import "./Tree.scss";
import { useContext } from "react";
import { State, TreeItem, TreeItemPlaceholder } from "../../types/skillTree";
import { SkillTreeContext } from "../../contexts/SkillTreeContext";
import { TreeLeafDragProps } from "./DragAndDrop/types";
import {
  DummyTreeLeafDropArea,
  TreeLeafDropArea,
} from "./DragAndDrop/TreeLeafDropArea";
import { useAuth0 } from "@auth0/auth0-react";
import LoadingSpinner from "../Common/Loader";
import { useParams } from "react-router-dom";
import { FaLink } from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { deleteNodeById } from "../../reducers/skillTreeUtils";

export type TreeLeafProps = TreeLeafDragProps & {
  isActive: boolean;
  linkFromUUID: string | null;
  onClick: (
    node: TreeItem,
    parent: TreeItem,
    linkFromUUID: string | null
  ) => void;
  onAddChildClick: (parentNode: TreeItem, linkFromUUID: string | null) => void;
  onAddAfterClick: (
    previousNode: TreeItem,
    parentNode: TreeItem,
    linkFromUUID: string | null
  ) => void;
  onLoadMoreClick: (node: TreeItem) => void;
  onCollapseClick: (node: TreeItem) => void;
};

function Tree({ children }: { children: any }) {
  return (
    <div className="tree-container">
      <div className="tree">{children}</div>
    </div>
  );
}

function TreeRoot() {
  return (
    <>
      <div className="ui card tree__item tree__root">
        <div className="text-white pr-2">
          <div className="content">
            <div className="header">My Tree</div>
          </div>
        </div>
      </div>
    </>
  );
}

function populateTreeLeafCard(
  node: TreeItem,
  props: TreeLeafProps,
  state: State
) {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error(
      "populateTreeLeafCard must be used within a SkillTreeContext"
    );
  }
  const { treeData } = context;

  const { userId } = useParams();
  const { user } = useAuth0();

  const contentArray = JSON.parse(node.content ? node.content : "[]");
  const hasContent =
    contentArray.length > 0 &&
    (((contentArray[0].type === "paragraph" ||
      contentArray[0].type === "heading") &&
      contentArray[0].content.length > 0) ||
      (contentArray[0].type !== "paragraph" &&
        contentArray[0].type !== "heading"));

  const childrenBelow = node.children
    .map((child) => {
      if (treeData.data) {
        const childNode = treeData.data[child];
        return "isBelow" in childNode && childNode.isBelow ? childNode : null;
      }
      return null;
    })
    .filter((child) => child !== null) as TreeItem[];
  const childrenAfter = node.children
    .map((child) => {
      if (treeData.data) {
        const childNode = treeData.data[child];
        return !("isBelow" in childNode) ||
          ("isBelow" in childNode && !childNode.isBelow)
          ? childNode
          : null;
      }
      return null;
    })
    .filter((child) => child !== null) as TreeItem[];

  return (
    <div
      id={`tree-left-${node.uuid}${
        props.linkFromUUID ? `-link-from-${props.linkFromUUID}` : ""
      }`}
    >
      <div
        className={`ui card hover:cursor-pointer tree__item tree__leaf${
          ((childrenAfter.length && !node.isCollapsing) || node.linkTo) &&
          ((state.preview &&
            childrenAfter.filter((child) => !child.isPrivate).length) ||
            !state.preview)
            ? " tree__leaf--has-children"
            : ""
        }${props.isActive ? " tree__item--active" : ""}${
          node.isDeleting ? " tree__leaf--deleting" : ""
        }${node.isRelationship ? " tree__leaf--is_relationship" : ""}${
          node.linkTo ? " tree__leaf--is_link" : ""
        }`}
        onClick={() => {
          props.onClick(node, props.parent, props.linkFromUUID);
        }}
      >
        <div className="content block relative">
          {childrenBelow.map((child) => {
            return (
              <div
                className="bg-white inline-block px-1 text-sm rounded-sm mt-[1px] opacity-0"
                key={`node-${node.uuid}-child-below-${child.uuid}-top`}
              >
                .
              </div>
            );
          })}

          <div className={`node-card bg-${node.color} flex relative`}>
            {node.isPrivate && (
              <div className="absolute top-[-11px] left-[-5px]">🔒</div>
            )}
            {node.badge && (
              <div className="absolute bg-red-300 top-[-10px] right-[-10px] text-xs px-1 rounded-sm">
                {node.badge}
              </div>
            )}
            <div className="flex flex-col w-[100%]">
              <div className="header">
                {node.linkTo ? (
                  <FaLink />
                ) : hasContent ? (
                  <FaNoteSticky className="inline-block mr-2 mb-1" />
                ) : (
                  ""
                )}
                {!node.linkTo && node.name}
              </div>
              {node.subtitle && <div className="meta">{node.subtitle}</div>}
              {userId === user?.sub &&
                !state.preview &&
                state.selectedNodeId ===
                  node.uuid +
                    (props.linkFromUUID
                      ? `-link-from-${props.linkFromUUID}`
                      : "") &&
                !node.linkTo && (
                  <button
                    className="ui button tree__item__bottom_button"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.onAddAfterClick(
                        node,
                        props.parent,
                        props.linkFromUUID
                      );
                    }}
                  >
                    +
                  </button>
                )}
            </div>
            <div className="mr-[-6px] ml-2 mt-[-5px] mb-[-5px] flex">
              {node.isCollapsed && node.isCollapsing && !node.linkTo && (
                <button
                  className="ui button tree__item__right_button h-[calc(100%+1px)]"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    props.onLoadMoreClick(node);
                  }}
                >
                  &gt;
                </button>
              )}
              {node.isCollapsed && !node.isCollapsing && !node.linkTo && (
                <button
                  className="ui button tree__item__right_button h-[calc(100%+1px)]"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    props.onCollapseClick(node);
                  }}
                >
                  &lt;
                </button>
              )}
              {userId === user?.sub &&
                !state.preview &&
                !node.linkTo &&
                state.selectedNodeId ===
                  node.uuid +
                    (props.linkFromUUID
                      ? `-link-from-${props.linkFromUUID}`
                      : "") &&
                (!node.isCollapsed ||
                  !node.isCollapsing ||
                  node.children.length !== 0) && (
                  <button
                    className="ui button tree__item__right_button h-[calc(100%+1px)]"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      props.onAddChildClick(node, props.linkFromUUID);
                    }}
                  >
                    +
                  </button>
                )}
            </div>
          </div>

          {childrenBelow.map((child) => {
            return (
              <div
                className={`child-below bg-white inline-block px-2 text-[11px] py-[2px] rounded-sm mt-[1px] ${
                  state.selectedNodeId ===
                    child.uuid +
                      (props.linkFromUUID
                        ? `-link-from-${props.linkFromUUID}`
                        : "") && "child-below--active"
                }`}
                key={`node-${node.uuid}-child-below-${child.uuid}-bottom`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  props.onClick(child, node, props.linkFromUUID);
                }}
              >
                {child.name}
              </div>
            );
          })}
        </div>
        {/* {node.isLoading && (
          <Progress percent={100} indicating attached="bottom" />
        )} */}
      </div>
    </div>
  );
}

function TreeLeaf(props: TreeLeafProps) {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeLeaf must be used within a SkillTreeContext");
  }

  const { state, selectedLeafRef, handleLoadMore } = context;
  const queryClient = useQueryClient();

  if ("name" in props.data) {
    const node = props.data as TreeItem;

    return (
      <div
        ref={(ref) => {
          if (
            state.selectedNodeId ===
            node.uuid +
              (props.linkFromUUID ? `-link-from-${props.linkFromUUID}` : "")
          )
            selectedLeafRef.current = ref;
        }}
      >
        {!node.isDeleting ? (
          <>
            {!state.isEditorFocused ? (
              <TreeLeafDropArea
                props={{ parent: props.parent, data: node, position: "BEFORE" }}
              />
            ) : (
              <DummyTreeLeafDropArea
                props={{ parent: props.parent, data: node, position: "BEFORE" }}
              />
            )}
            {!node.linkTo && !state.isEditorFocused ? (
              <TreeLeafDropArea
                props={{ parent: props.parent, data: node, position: "CHILD" }}
              >
                {populateTreeLeafCard(node, props, state)}
              </TreeLeafDropArea>
            ) : (
              <>{populateTreeLeafCard(node, props, state)}</>
            )}
            {!state.isEditorFocused ? (
              <TreeLeafDropArea
                props={{ parent: props.parent, data: node, position: "AFTER" }}
              />
            ) : (
              <DummyTreeLeafDropArea
                props={{ parent: props.parent, data: node, position: "AFTER" }}
              />
            )}
          </>
        ) : (
          populateTreeLeafCard(node, props, state)
        )}
      </div>
    );
  } else {
    return (
      <div className="ui card tree__item tree__leaf tree__leaf--loading">
        <div className="node-card">
          <div className="content">
            {"isError" in props.data && props.data.isError ? (
              <button
                className="font-normal"
                onClick={() => {
                  queryClient.setQueryData(
                    ["skill-tree"],
                    (
                      existingData: Record<
                        string,
                        TreeItem | TreeItemPlaceholder
                      >
                    ) => {
                      return deleteNodeById(
                        existingData,
                        props.parent.children[0]
                      );
                    }
                  );

                  handleLoadMore({
                    ...props.parent,
                    children: [],
                  });
                }}
              >
                <span className="text-red-600">Error</span>: Tap to Retry
              </button>
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export { Tree, TreeRoot, TreeLeaf };
