import {
  BlockNoteEditor,
  combineByGroup,
  filterSuggestionItems,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";
import { useContext, useMemo } from "react";
import { TreeItem } from "../../../types/skillTree";
import { getMultiColumnSlashMenuItems } from "@blocknote/xl-multi-column";

export default function TreeNodeEditorMain({
  editor,
  node,
  editable,
}: {
  editor: BlockNoteEditor<any>;
  node: TreeItem;
  editable: boolean;
}) {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeNodeEditor must be used within a SkillTreeContext");
  }
  const { treeData, dispatch } = context;

  const getSlashMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        combineByGroup(
          getDefaultReactSlashMenuItems(editor),
          getMultiColumnSlashMenuItems(editor)
        ),
        query
      );
  }, [editor]);

  return (
    <div className="ui segment tree__node_editor__rich_text_editor__container">
      <BlockNoteView
        editable={editable}
        editor={editor}
        // formattingToolbar={false}
        slashMenu={false}
        theme="light"
        onChange={() => {
          const newNode = {
            ...node,
            content: JSON.stringify(editor.document),
          };
          dispatch({ type: "node/update", node: newNode });
          treeData.updateNode(newNode);
        }}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={getSlashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
}
