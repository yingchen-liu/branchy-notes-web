import { useContext } from "react";
import { TreeItem, TreeItemPlaceholder } from "../../../types/skillTree";
import { TreeLeafDropProps } from "./types";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";
import { useDrop } from "react-dnd";
import { TreeLeafProps } from "../TreeLeaf";
import { useQueryClient } from "@tanstack/react-query";
import {
  addChildNode,
  addNodeAfter,
  addNodeBefore,
  deleteNodeById,
} from "../../../reducers/skillTreeUtils";
import { deepCopy } from "../../../utils/utils";
import { v4 as uuidv4 } from "uuid";
import { useAuth0 } from "@auth0/auth0-react";
import { queueOperation } from "../../../services/skillTreeService";

function isDescendant(
  a: TreeItem | TreeItemPlaceholder,
  b: TreeItem,
  data: Record<string, TreeItem | TreeItemPlaceholder>
): boolean {
  return (
    b.children.includes(a.uuid) ||
    b.children.some((childUUID) =>
      isDescendant(a, data[childUUID] as TreeItem, data)
    ) ||
    (!!b.linkTo && b.linkTo.uuid === a.uuid)
  );
}

export function DummyTreeLeafDropArea({
  props,
  children,
}: {
  props: TreeLeafDropProps;
  children?: any;
}) {
  return <div
  className={`tree__leaf__drop_area tree__leaf__drop_area__${props.position.toLowerCase()}`}
>
  {children && children}
</div>
}

export function TreeLeafDropArea({
  props,
  children,
}: {
  props: TreeLeafDropProps;
  children?: any;
}) {
  const queryClient = useQueryClient();
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeLeafDropArea must be used within a SkillTreeContext");
  }

  const { treeData, state } = context;
  const { user } = useAuth0();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "LEAF",
      drop: (item) => {
        let newData = deepCopy(item.data);

        if (!state.linkOnDrop) {
          queryClient.setQueryData(
            ["skill-tree"],
            (existingData: Record<string, TreeItem | TreeItemPlaceholder>) => {
              return deleteNodeById(existingData, item.data.uuid);
            }
          );
        } else {
          if (!user?.sub) {
            console.log("Cannot perform drop: No user");
            return;
          }
          newData = {
            uuid: uuidv4(),
            isLoading: false,
            isDeleting: false,
            linkTo: item.data,
            isCollapsed: false,
            isCollapsing: false,
            isRelationship: false,
            isBelow: false,
            hasBorder: false,
            isPrivate: false,
            children: [],
            userId: user?.sub,
          } as TreeItem;
        }

        switch (props.position) {
          case "CHILD":
            queryClient.setQueryData(
              ["skill-tree"],
              (
                existingData: Record<string, TreeItem | TreeItemPlaceholder>
              ) => {
                return addChildNode(existingData, props.data.uuid, newData);
              }
            );

            if (!state.linkOnDrop) {
              queueOperation("moveNode", {
                moveNodeDTO: {
                  parentUUID: props.data.uuid,
                  uuid: newData.uuid,
                },
              });
            } else {
              queueOperation("createChildNode", {
                node: newData,
                parentUUID: props.data.uuid,
              });
            }
            break;
          case "BEFORE":
            queryClient.setQueryData(
              ["skill-tree"],
              (
                existingData: Record<string, TreeItem | TreeItemPlaceholder>
              ) => {
                return addNodeBefore(existingData, props.data.uuid, newData);
              }
            );

            if (!state.linkOnDrop) {
              queueOperation("moveNode", {
                moveNodeDTO: {
                  parentUUID: props.parent.uuid,
                  uuid: newData.uuid,
                  order: {
                    position: props.position,
                    relatedToUUID: props.data.uuid,
                  },
                },
              });
            } else {
              queueOperation("createNodeBefore", {
                node: newData,
                nextNodeUUID: props.data.uuid,
              });
            }
            break;
          case "AFTER":
            queryClient.setQueryData(
              ["skill-tree"],
              (
                existingData: Record<string, TreeItem | TreeItemPlaceholder>
              ) => {
                return addNodeAfter(existingData, props.data.uuid, newData);
              }
            );

            if (!state.linkOnDrop) {
              queueOperation("moveNode", {
                moveNodeDTO: {
                  parentUUID: props.parent.uuid,
                  uuid: newData.uuid,
                  order: {
                    position: props.position,
                    relatedToUUID: props.data.uuid,
                  },
                },
              });
            } else {
              queueOperation("createNodeAfter", {
                node: newData,
                previousNodeUUID: props.data.uuid,
              });
            }
            break;
          default:
            throw new Error(
              `Error dropping node: position "${props.position}" not supported`
            );
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
      canDrop: (item: TreeLeafProps) => {
        if (props.data.uuid === item.data.uuid) return false;
        if (props.position === "CHILD" && item.parent.uuid === props.data.uuid)
          return false;
        if (
          !treeData.data ||
          isDescendant(props.data, item.data as TreeItem, treeData.data)
        ) {
          return false;
        }
        return true;
      },
    }),
    [props]
  );

  return (
    <div
      className={`tree__leaf__drop_area tree__leaf__drop_area__${props.position.toLowerCase()}${
        isOver && canDrop ? " tree__leaf__drop_area--is_over" : ""
      }`}
      ref={drop}
    >
      {children && children}
    </div>
  );
}
