import axios, { AxiosError } from "axios";
import { MoveNodeDTO, TreeItem } from "../types/skillTree";
import { v4 as uuidv4 } from "uuid";
import { deepCopy } from "../utils/utils";
import { createHeader, getToken } from "./services";
import { debounce } from "lodash";
import { Mutex } from "async-mutex";

export type OperationType =
  | "createChildNode"
  | "createNodeAfter"
  | "createNodeBefore"
  | "updateNode"
  | "moveNode"
  | "deleteNode";

// Type for creating a child node
interface CreateChildNodeParams {
  node: TreeItem;
  parentUUID: string;
}

// Type for creating a node after a specific node
interface CreateNodeAfterParams {
  node: TreeItem;
  previousNodeUUID: string;
}

// Type for creating a node before a specific node
interface CreateNodeBeforeParams {
  node: TreeItem;
  nextNodeUUID: string;
}

// Type for updating a node
interface UpdateNodeParams {
  node: TreeItem;
  fieldsToRemove: (keyof TreeItem)[];
}

// Type for moving a node
interface MoveNodeParams {
  moveNodeDTO: MoveNodeDTO;
}

// Type for deleting a node
interface DeleteNodeParams {
  uuid: string;
}

// Union type for all operation parameters
type OperationParams =
  | CreateChildNodeParams
  | CreateNodeAfterParams
  | CreateNodeBeforeParams
  | UpdateNodeParams
  | MoveNodeParams
  | DeleteNodeParams;

let operationId = 1;
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/nodes`;

let rootUUID: string | undefined;
export const getRootUUID = () => {
  return rootUUID;
};

export const clientId = uuidv4();

export const updateOperationId = (id: number) => {
  operationId = Math.max(id, operationId);
  console.log("Operation id:", operationId);
};

const STORAGE_KEY = "requestQueueData";

export const mutex = new Mutex();

// Load queue from localStorage
export const loadQueueFromStorage = () => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : { requestQueue: [] };
};

// Save the queue to localStorage
export const saveQueueToStorage = (requestQueue: any[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ requestQueue }));
};

// Process the queued operations
const processQueue = async () => {
  const requestQueue = await mutex.runExclusive(async () => {
    const { requestQueue } = loadQueueFromStorage();
    return requestQueue;
  });

  if (!getToken()) {
    console.log(
      "Wait for user credentials before processing the operation queue"
    );
    setTimeout(processQueue, 2000);
    return;
  }

  if (!requestQueue.length) {
    console.log("Operation queue is empty");
    setTimeout(processQueue, 2000);
    return;
  }
  console.log(`Processing queue, ${requestQueue.length} left`);

  const operation = requestQueue[0];
  const { key, operationType, params } = operation;

  console.log(`Processing request: ${key}`);

  try {
    const request = async () => {
      switch (operationType) {
        case "createChildNode":
          return createNodeRequest(
            (params as CreateChildNodeParams).node,
            (params as CreateChildNodeParams).parentUUID,
            ""
          );
        case "createNodeAfter":
          return createNodeRequest(
            (params as CreateNodeAfterParams).node,
            (params as CreateNodeAfterParams).previousNodeUUID,
            "/after"
          );
        case "createNodeBefore":
          return createNodeRequest(
            (params as CreateNodeBeforeParams).node,
            (params as CreateNodeBeforeParams).nextNodeUUID,
            "/before"
          );
        case "updateNode":
          return updateNode(
            (params as UpdateNodeParams).node,
            (params as UpdateNodeParams).fieldsToRemove
          );
        case "moveNode":
          return moveNode((params as MoveNodeParams).moveNodeDTO);
        case "deleteNode":
          return deleteNode((params as DeleteNodeParams).uuid);
        default:
          throw new Error(`Unknown operation type ${operationType}`);
      }
    };

    await request();

    await mutex.runExclusive(async () => {
      const { requestQueue: latestRequestQueue } = loadQueueFromStorage();
      latestRequestQueue.shift();
      saveQueueToStorage(latestRequestQueue);

      console.log(
        `Request processed: ${key}, ${latestRequestQueue.length} left`
      );
    });

    // Recursively call processQueue to handle the next request
    processQueue();
  } catch (error) {
    console.error(`Request failed (${operation.retries + 1}): ${error}`);

    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const { requestQueue: latestRequestQueue } = loadQueueFromStorage();
      latestRequestQueue[0].retries = operation.retries + 1;
      saveQueueToStorage(latestRequestQueue);
    }

    // Wait 10s and retry
    setTimeout(processQueue, 10000);
  }
};

const debounceMap = new Map<string, (...args: any[]) => void>();

/**
 * Creates a runtime-keyed debounce handler.
 * @param func - The function to debounce.
 * @param wait - The debounce delay in milliseconds.
 * @returns A function that accepts a key and arguments to debounce the function.
 */
function createKeyedDebounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (key: string, ...args: Parameters<T>) => void {
  return (key: string, ...args: Parameters<T>) => {
    if (!debounceMap.has(key)) {
      const debouncedFunc = debounce(
        (...params: Parameters<T>) => func(...params),
        wait
      );
      debounceMap.set(key, debouncedFunc);
    }
    debounceMap.get(key)?.(...args);
  };
}

type Operation = {
  key: string;
  operationType: string;
  params: OperationParams;
  retries: number;
};

// Queue a new operation with operation-specific parameters
export const queueOperation = <T extends OperationParams>(
  operationType: OperationType,
  params: T
) => {
  // Generate a unique key based on operation type and parameters
  const key = `${operationType}-${
    "uuid" in params
      ? params.uuid
      : "node" in params
      ? params.node.uuid
      : "moveNodeDTO" in params
      ? params.moveNodeDTO.uuid
      : uuidv4()
  }`;

  const operation = {
    key,
    operationType,
    params,
    retries: 0,
  };

  debouncedAddOperationToQueue(key, operation);
};

const addOperationToQueue = (operation: Operation) => {
  mutex.runExclusive(async () => {
    let { requestQueue } = loadQueueFromStorage();

    requestQueue = requestQueue.filter(
      (item: Operation) => item.key !== operation.key
    );

    requestQueue.push(operation);

    console.log(`Queued request ${operation.key}, ${requestQueue.length} left`);

    saveQueueToStorage(requestQueue);
  });
};

const debouncedAddOperationToQueue = createKeyedDebounce(
  addOperationToQueue,
  3000
);

// Create node request (helper function)
const createNodeRequest = (
  node: TreeItem,
  parentUUID: string,
  endpoint: string
) => {
  const modifiedNode = {
    ...node,
    ...(node.linkTo && {
      linkTo: {
        ...node.linkTo,
        children: [],
      },
    }),
  };
  return axios.post(
    `${API_BASE_URL}/${parentUUID}${endpoint}`,
    {
      clientId,
      operationId: operationId++,
      node: modifiedNode,
    },
    createHeader()
  );
};

// Update node request (helper function)
const updateNode = (node: TreeItem, fieldsToRemove: (keyof TreeItem)[]) => {
  const modifiedNode = removeFields(node, fieldsToRemove);
  return axios.put(
    `${API_BASE_URL}/${node.uuid}`,
    {
      clientId,
      operationId: operationId++,
      node: modifiedNode,
    },
    createHeader()
  );
};

// Move node request (helper function)
const moveNode = (moveNodeDTO: MoveNodeDTO) => {
  return axios.put(
    `${API_BASE_URL}/${moveNodeDTO.uuid}/position`,
    {
      clientId,
      operationId: operationId++,
      move: moveNodeDTO,
    },
    createHeader()
  );
};

// Delete node request (helper function)
const deleteNode = (uuid: string) => {
  return axios.delete(`${API_BASE_URL}/${uuid}`, createHeader());
};

// Parse tree (helper function)
const parseTree = (
  tree: any,
  map: Record<string, TreeItem>
): Record<string, TreeItem> => {
  const { children, isCollapsed, ...rest } = tree;
  map[tree.uuid] = {
    ...rest,
    isCollapsed,
    isCollapsing: isCollapsed,
    children: children.map((child: TreeItem) => child.uuid),
  };
  if (tree.linkTo) {
    parseTree(tree.linkTo, map);
  }
  children.forEach((child: any) => parseTree(child, map));
  return map;
};

// Remove fields from node (helper function)
const removeFields = <T extends Record<string, any>, K extends keyof T>(
  originalObject: T,
  fieldsToRemove: K[]
): Omit<T, K> => {
  const modifiedObject = deepCopy(originalObject);
  fieldsToRemove.forEach((field) => delete modifiedObject[field]);
  return modifiedObject;
};

// Initial call to processQueue
processQueue();

export const fetchRootNode = async (
  userId: string,
  language: string
): Promise<Record<string, TreeItem>> => {
  const { data } = await axios.get(
    `${API_BASE_URL}/${encodeURIComponent(userId)}/root?language=${language}`,
    createHeader()
  );
  rootUUID = data.uuid;
  return parseTree(data, {});
};

export const fetchNodeChildren = async (
  userId: string,
  uuid: string
): Promise<Record<string, TreeItem>> => {
  // await new Promise((resolve) => {
  //   setTimeout(resolve, 100000)
  // })
  const { data } = await axios.get(
    `${API_BASE_URL}/${encodeURIComponent(userId)}/${uuid}`,
    createHeader()
  );
  return data ? parseTree(data, {}) : {};
};
