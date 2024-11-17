export type TreeItem = {
  uuid: string;
  isLoading: boolean;
  isDeleting: boolean;
  isBelow: boolean;
  name?: string;
  subtitle?: string;
  badge?: string;
  color?: string;
  content?: string;
  children: string[];
  linkTo?: TreeItem;
  isCollapsed: boolean;
  isCollapsing: boolean;
  isPrivate: boolean;
  isRelationship: boolean;
  userId: string;
  hasBorder: boolean;
};

export type TreeItemPlaceholder = {
  uuid: string;
  isError: boolean;
};

export const isTreeItem = (
  entity: TreeItem | TreeItemPlaceholder
): entity is TreeItem => {
  return (entity as TreeItem).name !== undefined || (entity as TreeItem).linkTo !== undefined;
};

export type State = {
  title: string;
  ownerUser: null | User;
  selectedNodeId: null | string;
  selectedNode: null | TreeItem;
  selectedNodeParent: null | TreeItem;
  linkOnDrop: boolean;
  preview: boolean;
};

export type Action =
  | { type: "node/select"; node: TreeItem; parent: TreeItem; linkFromUUID: string | null }
  | { type: "node/update"; node: TreeItem }
  | { type: "node/deselect" }
  | { type: "linkOnDrop/toggle"; linkOnDrop: boolean }
  | { type: "preview/toggle"; preview: boolean }
  | { type: "title/update"; title: string }
  | { type: "ownerUser/update"; ownerUser: User };

export type MoveNodeDTO = {
  uuid: string;
  parentUUID: string;
  order?: { position: "BEFORE" | "AFTER"; relatedToUUID: string };
};
