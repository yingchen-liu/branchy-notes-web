import { useContext } from "react";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";
import ToggleButton from "./ToggleButton";
import { t } from "i18next";

export default function TreeBottomBar() {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeNodeEditor must be used within a SkillTreeContext");
  }

  const { dispatch, state } = context;

  return (
    <div className="bg-white px-4 py-2 border-x border-gray-800 flex gap-3">
      <div className="flex-grow flex gap-3">
        <ToggleButton
          isToggled={state.preview}
          onToggle={(isToggled) => {
            dispatch({ type: "preview/toggle", preview: isToggled });
          }}
          labelOn={t("preview")}
          labelOff={t("preview")}
        />

        {!state.preview && (
          <ToggleButton
            isToggled={state.linkOnDrop}
            onToggle={(isToggled) => {
              dispatch({ type: "linkOnDrop/toggle", linkOnDrop: isToggled });
            }}
            labelOn={t("linkOnDrop")}
            labelOff={t("linkOnDrop")}
          />
        )}
      </div>

      <div>
        {state.selectedNode &&
          state.selectedNode.children &&
          state.selectedNode.children.length > 0 &&
          `${state.selectedNode.children.length} ${
            state.selectedNode.children.length > 1 ? " children" : " child"
          }`}
      </div>
    </div>
  );
}
