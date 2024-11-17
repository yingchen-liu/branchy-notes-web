import { TreeItem, TreeItemPlaceholder } from "../../../types/skillTree";

export type TreeLeafDragProps = {
  parent: TreeItem;
  data: TreeItem | TreeItemPlaceholder;
};

export type TreeLeafDropProps = TreeLeafDragProps & {
  position: "BEFORE" | "AFTER" | "CHILD";
};
