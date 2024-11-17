import { useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";
import { deleteNodeById } from "../../../reducers/skillTreeUtils";
import { TreeItem } from "../../../types/skillTree";
import { queueOperation } from "../../../services/skillTreeService";
import { ToggleButtonGroup, ToggleSquareButton } from "./ToggleSquareButton";
import { IoClose, IoRemoveOutline } from "react-icons/io5";
import {
  AiOutlineDatabase,
  AiOutlineNodeCollapse,
} from "react-icons/ai";
import { RxGroup } from "react-icons/rx";
import { RiGitRepositoryPrivateLine } from "react-icons/ri";
import { t } from "i18next";
import { createTreeNotesTitle } from "../../../utils/title";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import DeleteButton from "./DeleteButtonWithConfirm";
import { FaRegWindowMaximize, FaWindowMaximize } from "react-icons/fa";

export default function TreeNodeEditorHeader({
  node,
  isFullscreen,
  setFullscreen,
  editable,
}: {
  node: TreeItem;
  isFullscreen: boolean;
  setFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  editable: boolean;
}) {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeNodeEditor must be used within a SkillTreeContext");
  }
  const { treeData, dispatch, state, handleLoadMore } = context;
  const queryClient = useQueryClient();

  const { userId } = useParams();
  const { user } = useAuth0();

  function handleDeleteConfirmed() {
    if (state.selectedNodeParent === null) {
      throw new Error("Error deleting tree node: Parent not found");
    }
    dispatch({ type: "node/deselect" });
    dispatch({
      type: "title/update",
      title: createTreeNotesTitle(undefined, state.ownerUser || undefined),
    });
    queryClient.setQueryData(
      ["skill-tree"],
      (existingData: Record<string, TreeItem>) => {
        return deleteNodeById(existingData, node.uuid);
      }
    );
    queueOperation("deleteNode", { uuid: node.uuid });
  }

  return (
    <>
      <div className="ui segment flex tree__node_editor__top">
        {editable ? (
          <>
            {node.linkTo && (
              <div className="text-xl w-[100%] font-bold pt-2">
                Link to {node.linkTo.name}
              </div>
            )}
            {!node.linkTo && (
              <>
                <input
                  className="tree__node_editor__title w-[20%] border rounded-md p-2 focus:outline-none focus:border-blue-400"
                  placeholder={t("title")}
                  value={node.name}
                  onChange={(event) => {
                    const newNode = {
                      ...node,
                      name: event.target.value,
                    };
                    dispatch({ type: "node/update", node: newNode });
                    dispatch({
                      type: "title/update",
                      title: createTreeNotesTitle(
                        newNode,
                        state.ownerUser || undefined
                      ),
                    });
                    treeData.updateNode(newNode);
                  }}
                />
                {!node.isBelow && (
                  <input
                    className="tree__node_editor__subtitle w-[15%] border rounded-md p-2 focus:outline-none focus:border-blue-400"
                    placeholder={t("subtitle")}
                    value={node.subtitle ? node.subtitle : ""}
                    onChange={(event) => {
                      const newNode = {
                        ...node,
                        subtitle: event.target.value,
                      };
                      dispatch({ type: "node/update", node: newNode });
                      treeData.updateNode(newNode);
                    }}
                  />
                )}
                {!node.isBelow && (
                  <input
                    className="tree__node_editor__subtitle w-[10%] border rounded-md p-2 focus:outline-none focus:border-blue-400"
                    placeholder={t("badge")}
                    value={node.badge ? node.badge : ""}
                    onChange={(event) => {
                      const newNode = {
                        ...node,
                        badge: event.target.value,
                      };
                      dispatch({ type: "node/update", node: newNode });
                      treeData.updateNode(newNode);
                    }}
                  />
                )}
                {!node.isBelow && (
                  <select
                    className="tree__node_editor__subtitle w-15 p-1 outline-none border rounded-md"
                    value={node.color || ""}
                    onChange={(event) => {
                      const newNode = {
                        ...node,
                        color: event.target.value,
                      };
                      dispatch({ type: "node/update", node: newNode });
                      treeData.updateNode(newNode);
                    }}
                  >
                    <option value="">{t("color")}</option>
                    <option value="red" className="text-red-500">
                      {t("red")}
                    </option>
                    <option value="yellow" className="text-yellow-500">
                      {t("yellow")}
                    </option>
                    <option value="green" className="text-green-500">
                      {t("green")}
                    </option>
                    <option value="blue" className="text-blue-500">
                      {t("blue")}
                    </option>
                  </select>
                )}
              </>
            )}
            {!node.linkTo && (
              <ToggleButtonGroup>
                <ToggleSquareButton
                  Icon={IoRemoveOutline}
                  title={t("relationship")}
                  isActive={node.isRelationship}
                  isDisabled={node.isBelow || node.isCollapsed}
                  onClick={(checked) => {
                    const newNode = {
                      ...node,
                      isRelationship: checked,
                      isCollapsed: false,
                    };
                    dispatch({ type: "node/update", node: newNode });
                    treeData.updateNode(newNode);
                  }}
                />

                <ToggleSquareButton
                  Icon={AiOutlineNodeCollapse}
                  title={t("collapse")}
                  isActive={node.isCollapsed}
                  isDisabled={
                    node.isRelationship ||
                    node.isBelow ||
                    (!node.isCollapsed && node.children.length === 0)
                  }
                  onClick={(checked) => {
                    const newNode = {
                      ...node,
                      isCollapsed: checked,
                      isCollapsing: false,
                    };
                    dispatch({ type: "node/update", node: newNode });
                    treeData.updateNode(newNode);
                    if (!newNode.isCollapsed && newNode.children.length === 0) {
                      handleLoadMore(newNode);
                    }
                  }}
                />
                <ToggleSquareButton
                  Icon={AiOutlineDatabase}
                  title={t("attach")}
                  isActive={node.isBelow}
                  isDisabled={
                    node.children.length > 0 ||
                    node.isCollapsed ||
                    node.isRelationship
                  }
                  onClick={(checked) => {
                    const newNode = {
                      ...node,
                      isBelow: checked,
                    };
                    dispatch({ type: "node/update", node: newNode });
                    treeData.updateNode(newNode);
                  }}
                />

                <ToggleSquareButton
                  Icon={RxGroup}
                  title={t("box")}
                  isDisabled={false}
                  isActive={node.hasBorder}
                  onClick={(checked) => {
                    const newNode = {
                      ...node,
                      hasBorder: checked,
                    };
                    dispatch({ type: "node/update", node: newNode });
                    treeData.updateNode(newNode);
                  }}
                />

                <ToggleSquareButton
                  Icon={RiGitRepositoryPrivateLine}
                  title={t("private")}
                  isDisabled={false}
                  isActive={node.isPrivate}
                  onClick={(checked) => {
                    const newNode = {
                      ...node,
                      isPrivate: checked,
                    };
                    dispatch({ type: "node/update", node: newNode });
                    treeData.updateNode(newNode);
                  }}
                />
              </ToggleButtonGroup>
            )}
            {(node.children.length === 0 || node.linkTo) && (
              <DeleteButton onConfirm={handleDeleteConfirmed} />
            )}
          </>
        ) : (
          <div className="text-xl w-[100%] font-bold pt-2">
            {node.linkTo && (
              <>
                {t("linkTo")} {node.linkTo.name}
              </>
            )}
            {node.name}
          </div>
        )}

        <div className="flex">
          {!node.linkTo && (
            <button
              className="h-11 w-11 p-[10px] flex items-center justify-center transition-colors duration-200 bg-gray-200 hover:bg-gray-300 rounded-l-md"
              onClick={() => {
                setFullscreen(!isFullscreen);
              }}
            >
              {isFullscreen ? (
                <FaWindowMaximize className="h-5 w-5 text-gray-600" style={{ transform: "rotate(180deg)" }} />
              ) : (
                <FaRegWindowMaximize className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}
          <button
            className={`h-11 w-11 p-[8px] flex items-center justify-center transition-colors duration-200 bg-gray-200 hover:bg-gray-300 ${node.linkTo ? ' rounded-md' : 'rounded-r-md'}`}
            onClick={() => {
              dispatch({ type: "node/deselect" });
              dispatch({
                type: "title/update",
                title: createTreeNotesTitle(
                  undefined,
                  state.ownerUser || undefined
                ),
              });
            }}
          >
            <IoClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
      {userId === user?.sub &&
        !state.preview &&
        node.userId === "__demo_user_id__" && (
          <div className="bg-red-400 px-4 text-white font-light">
            ⚠️ {t("changDemoNotesWarning")}
          </div>
        )}
    </>
  );
}
