import { CSSProperties, FC, useContext } from "react";
import { XYCoord, useDragLayer } from "react-dnd";
import { populateChild } from "../TreeView";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";

const layerStyles: CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
};

const TreeLeafDragLayer: FC = () => {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeLeafDragLayer must be used within a SkillTreeContext");
  }

  const { item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  function getItemStyles(
    initialOffset: XYCoord | null,
    currentOffset: XYCoord | null
  ) {
    if (!initialOffset || !currentOffset) {
      return {
        display: "none",
      };
    }

    let { x, y } = currentOffset;

    const transform = `translate(${x}px, ${y}px)`;
    return {
      transform,
      WebkitTransform: transform,
    };
  }

  if (item && item.data && context.treeData.data) {
    return (
      <div className="tree__leaf__drag_container" style={layerStyles}>
        <div style={getItemStyles(initialOffset, currentOffset)}>
          {populateChild(
            context.treeData.data,
            item.parent,
            item.data,
            null,
            null,
            () => {},
            () => {},
            () => {},
            () => {},
            () => {}
          )}
        </div>
      </div>
    );
  }
};

export default TreeLeafDragLayer;
