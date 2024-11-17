import { TreeItem, TreeItemPlaceholder, isTreeItem } from "../types/skillTree";
import { deepCopy } from "../utils/utils";

export const addChildNode = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  parentUUID: string,
  newNode: TreeItem | TreeItemPlaceholder
): Record<string, TreeItem | TreeItemPlaceholder> => {
  return {
    ...Object.fromEntries(
      Object.entries(data).map(([uuid, node]) => {
        if (isTreeItem(node)) {
          return [
            uuid,
            {
              ...node,
              children:
                node.uuid === parentUUID
                  ? [...node.children, newNode.uuid]
                  : node.children,
            },
          ];
        } else {
          return [uuid, node];
        }
      })
    ),
    [newNode.uuid]: newNode,
  };
};

export const addNodeAfter = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  previousNodeUUID: string,
  newNode: TreeItem | TreeItemPlaceholder
): Record<string, TreeItem | TreeItemPlaceholder> => {
  return {
    ...Object.fromEntries(
      Object.entries(data).map(([uuid, node]) => {
        if (isTreeItem(node)) {
          const previousNodeIndex = node.children.findIndex(
            (childUUID) => childUUID === previousNodeUUID
          );
          let children = node.children;
          if (previousNodeIndex >= 0) {
            children = deepCopy(children);
            children.splice(previousNodeIndex + 1, 0, newNode.uuid);
          }
          return [
            uuid,
            {
              ...node,
              children: children,
            },
          ];
        } else {
          return [uuid, node];
        }
      })
    ),
    [newNode.uuid]: newNode,
  };
};

export const addNodeBefore = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  nextNodeUUID: string,
  newNode: TreeItem | TreeItemPlaceholder
): Record<string, TreeItem | TreeItemPlaceholder> => {
  return {
    ...Object.fromEntries(
      Object.entries(data).map(([uuid, node]) => {
        if (isTreeItem(node)) {
          const nextNodeIndex = node.children.findIndex(
            (childUUID) => childUUID === nextNodeUUID
          );
          let children = node.children;
          if (nextNodeIndex >= 0) {
            children = deepCopy(children);
            children.splice(nextNodeIndex, 0, newNode.uuid);
          }
          return [
            uuid,
            {
              ...node,
              children: children,
            },
          ];
        } else {
          return [uuid, node];
        }
      })
    ),
    [newNode.uuid]: newNode,
  };
};

export const updateNodes = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  newNodes: Record<string, TreeItem | TreeItemPlaceholder>
): Record<string, TreeItem | TreeItemPlaceholder> => {
  return {
    ...data,
    ...newNodes,
  };
};

export const updateNodeById = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  uuid: string,
  newNode: TreeItem | TreeItemPlaceholder
): Record<string, TreeItem | TreeItemPlaceholder> => {
  return {
    ...data,
    [uuid]: {
      ...newNode,
      ...(isTreeItem(data[uuid]) && {
        children: (data[uuid] as TreeItem).children,
      }),
    },
  };
};

export const removeChildren = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  uuid: string
): Record<string, TreeItem | TreeItemPlaceholder> => {
  return {
    ...data,
    [uuid]: {
      ...data[uuid],
      children: [],
    },
  };
};

export const deleteNodeById = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  uuid: string
): Record<string, TreeItem | TreeItemPlaceholder> => {
  return {
    ...Object.fromEntries(
      Object.entries(data)
        .filter(([nodeUUID]) => nodeUUID !== uuid)
        .map(([nodeUUID, node]) => {
          if (isTreeItem(node)) {
            return [
              nodeUUID,
              {
                ...node,
                children: node.children.filter((nodeUUID) => nodeUUID !== uuid),
              },
            ];
          } else {
            return [uuid, node];
          }
        })
    ),
  };
};
