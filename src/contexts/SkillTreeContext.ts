import { createContext, useReducer, useRef } from "react";
import {
  State,
  Action,
  TreeItem,
  TreeItemPlaceholder,
} from "../types/skillTree";
import { t } from "i18next";

const initialState: State = {
  title: t("myTreeNotesTitle"),
  ownerUser: null,
  selectedNodeId: null,
  selectedNode: null,
  selectedNodeParent: null,
  linkOnDrop: false,
  preview: false,
};

export type SkillTreeContextType = {
  state: State;
  selectedLeafRef: React.MutableRefObject<any>;
  dispatch: React.Dispatch<Action>;
  treeData: {
    data: Record<string, TreeItem | TreeItemPlaceholder> | undefined;
    isPending: boolean;
    isSuccess: boolean;
    updateNode: (node: TreeItem) => void;
  };
  handleLoadMore: (node: TreeItem) => void;
  handleCollapse: (node: TreeItem) => void;
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "title/update":
      return {
        ...state,
        title: action.title,
      };
    case "ownerUser/update":
      return {
        ...state,
        ownerUser: action.ownerUser,
      };
    case "node/select":
      return {
        ...state,
        selectedNodeParent: action.parent,
        selectedNodeId:
          action.node.uuid +
          (action.linkFromUUID ? `-link-from-${action.linkFromUUID}` : ""),
        selectedNode: action.node,
      };
    case "node/update":
      return { ...state, selectedNode: action.node };
    case "node/deselect":
      return {
        ...state,
        selectedNodeId: null,
        selectedNode: null,
        selectedNodeParent: null,
      };
    case "linkOnDrop/toggle":
      return {
        ...state,
        linkOnDrop: action.linkOnDrop,
      };
    case "preview/toggle":
      return {
        ...state,
        preview: action.preview,
      };
    default:
      return state;
  }
}

export const SkillTreeContext = createContext<SkillTreeContextType | undefined>(
  undefined
);

export function useSkillTreeContext() {
  const [state, dispatch] = useReducer(reducer, initialState, undefined);
  const selectedLeafRef = useRef(null);

  return { state, dispatch, selectedLeafRef };
}
