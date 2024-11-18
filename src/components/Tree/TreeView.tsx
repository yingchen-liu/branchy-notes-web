import { useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import zhColors from "../../dictionaries/colors";
import zhAnimals from "../../dictionaries/animals";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";

import HorizontalScroll from "../Layout/HorizontalScroll";
import LoadingSpinner from "../Common/Loader";
import { SkillTreeContext } from "../../contexts/SkillTreeContext";
import {
  TreeItem,
  TreeItemPlaceholder,
  isTreeItem,
} from "../../types/skillTree";
import {
  addChildNode,
  addNodeAfter,
  addNodeBefore,
  deleteNodeById,
  updateNodeById,
} from "../../reducers/skillTreeUtils";
import {
  clientId,
  getRootUUID,
  queueOperation,
  updateOperationId,
} from "../../services/skillTreeService";
import { deepCopy } from "../../utils/utils";

import TreeLeafDragLayer from "./DragAndDrop/TreeLeafDragLayer";
import { Tree, TreeLeaf, TreeRoot } from "./TreeLeaf";
import { TreeChildren, TreeHierarchy } from "./TreeHierarchy";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import { createTreeNotesTitle } from "../../utils/title";
import { t } from "i18next";
import { useParams } from "react-router-dom";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "react-device-detect";

// Helper Functions
const populateChildren = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  parent: TreeItem,
  children: (TreeItem | TreeItemPlaceholder)[],
  activeItem: TreeItem | null,
  linkFromUUID: string | null,
  onClick: (
    node: TreeItem,
    parent: TreeItem,
    linkFromUUID: string | null
  ) => void,
  onAddChildClick: (parentNode: TreeItem, linkFromUUID: string | null) => void,
  onAddAfterClick: (
    previousNode: TreeItem,
    parentNode: TreeItem,
    linkFromUUID: string | null
  ) => void,
  onLoadMoreClick: (node: TreeItem) => void,
  onCollapseClick: (node: TreeItem) => void
) => {
  return children.map((child) => {
    return populateChild(
      data,
      parent,
      child,
      activeItem,
      linkFromUUID,
      onClick,
      onAddChildClick,
      onAddAfterClick,
      onLoadMoreClick,
      onCollapseClick
    );
  });
};

export const populateChild = (
  data: Record<string, TreeItem | TreeItemPlaceholder>,
  parent: TreeItem,
  child: TreeItem | TreeItemPlaceholder,
  activeItem: TreeItem | null,
  linkFromUUID: string | null,
  onClick: (
    node: TreeItem,
    parent: TreeItem,
    linkFromUUID: string | null
  ) => void,
  onAddChildClick: (parentNode: TreeItem, linkFromUUID: string | null) => void,
  onAddAfterClick: (
    previousNode: TreeItem,
    parentNode: TreeItem,
    linkFromUUID: string | null
  ) => void,
  onLoadMoreClick: (node: TreeItem) => void,
  onCollapseClick: (node: TreeItem) => void
) => {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("populateChild must be used within a SkillTreeContext");
  }

  const { state } = context;

  if (state.preview && "isPrivate" in child && child.isPrivate) return;
  return (
    <TreeHierarchy
      key={`skill-tree__hierarchy__${child.uuid}`}
      itemProps={{ parent, data: child }}
    >
      {"hasBorder" in child && child.hasBorder && !child.isCollapsing && (
        <div className="border-2 border-white w-[100%] h-[100%] absolute left-6 rounded-xl border-dashed"></div>
      )}
      <TreeLeaf
        parent={parent}
        data={child}
        isActive={activeItem?.uuid === child.uuid}
        onClick={onClick}
        linkFromUUID={linkFromUUID}
        onAddChildClick={onAddChildClick}
        onAddAfterClick={onAddAfterClick}
        onLoadMoreClick={onLoadMoreClick}
        onCollapseClick={onCollapseClick}
      />
      {isTreeItem(child) &&
        ((child.children.length && !child.isCollapsing) || child.linkTo) && (
          <TreeChildren>
            {populateChildren(
              data,
              child,
              child.isCollapsing
                ? []
                : child.linkTo
                ? [data[child.linkTo.uuid]]
                : child.children
                    .map((childUUID) => data[childUUID])
                    .filter(
                      (child) =>
                        !("isBelow" in child) ||
                        ("isBelow" in child && !child.isBelow)
                    ),
              activeItem,
              (linkFromUUID
                ? linkFromUUID +
                  (child.linkTo?.uuid ? `-link-from-${child.linkTo?.uuid}` : "")
                : child.linkTo?.uuid) || null,
              onClick,
              onAddChildClick,
              onAddAfterClick,
              onLoadMoreClick,
              onCollapseClick
            )}
          </TreeChildren>
        )}
    </TreeHierarchy>
  );
};

export default function TreeView() {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeView must be used within a SkillTreeContext");
  }

  const {
    treeData,
    state,
    dispatch,
    handleLoadMore,
    handleCollapse,
    selectedLeafRef,
  } = context;
  const queryClient = useQueryClient();
  const { data, isPending, isSuccess } = treeData;
  const { user } = useAuth0();
  const { userId } = useParams();
  const { i18n } = useTranslation();

  const createNewNode = (userId: string): TreeItem => ({
    uuid: uuidv4(),
    name: uniqueNamesGenerator({
      dictionaries:
        i18n.language === "zh" ? [zhColors, zhAnimals] : [colors, animals],
      style: "capital",
      separator: i18n.language === "zh" ? "" : " ",
    }),
    children: [],
    isCollapsed: false,
    isCollapsing: false,
    isLoading: false,
    isDeleting: false,
    isRelationship: false,
    isBelow: false,
    hasBorder: false,
    isPrivate: false,
    userId,
  });

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: `${import.meta.env.VITE_WS_BASE_URL}/ws`,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        subscribeToUpdates(stompClient);
        localStorage.setItem("isOffline", "false");
      },
      onDisconnect: () => {},
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
      },
      debug: (str) => {
        console.log("STOMP: " + str);
        if (
          str.startsWith("STOMP: scheduling reconnection") ||
          str.startsWith("Connection closed to")
        ) {
          localStorage.setItem("isOffline", "true");
        }
      },
    });

    stompClient.activate();
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [queryClient]);

  useEffect(() => {
    if (state.selectedNodeId && selectedLeafRef.current) {
      setTimeout(() => {
        console.log("selectedLeafRef.current");
        console.log(selectedLeafRef.current);
        selectedLeafRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 500);
    }
  }, [state.selectedNodeId, selectedLeafRef]);

  const subscribeToUpdates = (stompClient: Client) => {
    stompClient.subscribe("/topic/operations/move", handleMoveOperation);
    stompClient.subscribe("/topic/operations/create", handleCreateOperation);
    stompClient.subscribe("/topic/operations/update", handleUpdateOperation);
  };

  const handleMoveOperation = (message: any) => {
    const dto = JSON.parse(message.body);
    if (dto.clientId !== clientId) {
      updateOperationId(dto.operationId);
      queryClient.setQueryData(["skill-tree"], (existingData: any) =>
        handleMoveNode(existingData, dto)
      );
    }
  };

  const handleCreateOperation = (message: any) => {
    const dto = JSON.parse(message.body);
    if (dto.clientId !== clientId) {
      updateOperationId(dto.operationId);
      queryClient.setQueryData(["skill-tree"], (existingData: any) =>
        handleCreateNode(existingData, dto)
      );
    }
  };

  const handleUpdateOperation = (message: any) => {
    const dto = JSON.parse(message.body);
    if (dto.clientId !== clientId) {
      updateOperationId(dto.operationId);
      queryClient.setQueryData(["skill-tree"], (existingData: any) =>
        updateNodeById(existingData, dto.updatedNode.uuid, dto.updatedNode)
      );
    }
  };

  const handleMoveNode = (existingData: any, dto: any) => {
    const node = deepCopy(existingData[dto.nodeUUID]);
    const updatedData =
      dto.nodePositionDTO.order?.position === "BEFORE"
        ? addNodeBefore(
            deleteNodeById(existingData, dto.nodeUUID),
            dto.nodePositionDTO.order.relatedToUUID,
            node
          )
        : dto.nodePositionDTO.order?.position === "AFTER"
        ? addNodeAfter(
            deleteNodeById(existingData, dto.nodeUUID),
            dto.nodePositionDTO.order.relatedToUUID,
            node
          )
        : addChildNode(
            deleteNodeById(existingData, dto.nodeUUID),
            dto.nodePositionDTO.parentUUID,
            node
          );
    return updatedData;
  };

  const handleCreateNode = (existingData: any, dto: any) => {
    const node = dto.createdNode;
    return dto.parentNodeUUID
      ? addChildNode(existingData, dto.parentNodeUUID, node)
      : dto.previousNodeUUID
      ? addNodeAfter(existingData, dto.previousNodeUUID, node)
      : dto.nextNodeUUID
      ? addNodeBefore(existingData, dto.nextNodeUUID, node)
      : existingData;
  };

  const handleClick = (
    node: TreeItem,
    parent: TreeItem,
    linkFromUUID: string | null
  ) => {
    dispatch({ type: "node/select", node, parent, linkFromUUID });
    console.log("select", node);
    dispatch({
      type: "title/update",
      title: createTreeNotesTitle(node, state.ownerUser || undefined),
    });
  };

  const handleAddChild = (
    parentNode: TreeItem,
    linkFromUUID: string | null
  ) => {
    const newNode = createNewNode(parentNode.userId);
    queryClient.setQueryData(["skill-tree"], (existingData: any) =>
      addChildNode(existingData, parentNode.uuid, newNode)
    );
    queueOperation("createChildNode", {
      node: newNode,
      parentUUID: parentNode.uuid,
    });
    handleClick(newNode, parentNode, linkFromUUID);
  };

  const handleAddAfter = (
    previousNode: TreeItem,
    parentNode: TreeItem,
    linkFromUUID: string | null
  ) => {
    const newNode = createNewNode(parentNode.userId);
    queryClient.setQueryData(["skill-tree"], (existingData: any) =>
      addNodeAfter(existingData, previousNode.uuid, newNode)
    );

    queueOperation("createNodeAfter", {
      node: newNode,
      previousNodeUUID: previousNode.uuid,
    });
    handleClick(newNode, parentNode, linkFromUUID);
  };

  return (
    <HorizontalScroll className="body--full-screen">
      {isPending && (
        <div className="mt-40">
          <LoadingSpinner size="lg" dark={false} message={t("loadingTree")} />
        </div>
      )}
      {isSuccess && data && getRootUUID() && (
        <div className="relative">
          {userId === user?.sub &&
            !state.preview &&
            state.selectedNode?.userId === "__demo_user_id__" && (
              <div className="sticky z-50 top-[-14px] mr-[-1px] bg-red-400 px-4 text-white font-light">
                ⚠️ {t("changDemoNotesWarning")}
              </div>
            )}
          <Tree>
            {!state.isEditorFocused ? (
              <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
                <TreeLeafDragLayer />
                <TreeRoot />
                <TreeChildren>
                  {populateChildren(
                    data,
                    data[getRootUUID()!] as TreeItem,
                    (data[getRootUUID()!] as TreeItem).children.map(
                      (childUUID) => data[childUUID]
                    ),
                    state.selectedNode,
                    null,
                    handleClick,
                    handleAddChild,
                    handleAddAfter,
                    handleLoadMore,
                    handleCollapse
                  )}
                </TreeChildren>
              </DndProvider>
            ) : (
              <>
                <TreeRoot />
                <TreeChildren>
                  {populateChildren(
                    data,
                    data[getRootUUID()!] as TreeItem,
                    (data[getRootUUID()!] as TreeItem).children.map(
                      (childUUID) => data[childUUID]
                    ),
                    state.selectedNode,
                    null,
                    handleClick,
                    handleAddChild,
                    handleAddAfter,
                    handleLoadMore,
                    handleCollapse
                  )}
                </TreeChildren>
              </>
            )}
          </Tree>

          <div className="footer">
            <p>Designed and built by Yingchen.</p>
            <p>(React + Spring Boot) - Docker -&gt; AWS ECS + Neo4j</p>
          </div>
        </div>
      )}
    </HorizontalScroll>
  );
}
