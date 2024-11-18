import { useDrag } from "react-dnd";
import { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";
import { TreeLeafDragProps } from "./DragAndDrop/types";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export function TreeHierarchy({
  itemProps,
  children,
}: {
  itemProps: TreeLeafDragProps;
  children: any;
}) {
  const { userId } = useParams();
  const { user } = useAuth0();

  const [{ isDragging }, drag, preview] = useDrag(() => {
    return {
      type: "LEAF",
      item: itemProps,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    };
  }, [itemProps]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <div
      ref={userId === user?.sub ? drag : undefined}
      className={`py-[1px] pr-[2px] tree__hierarchy${
        isDragging ? " tree__hierarchy--dragging" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function TreeChildren({ children }: { children: any }) {
  return (
    <>
      <div className="tree__children">{children}</div>
    </>
  );
}
