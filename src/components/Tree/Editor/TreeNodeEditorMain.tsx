import { BlockNoteEditor, combineByGroup, filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";
import { useContext, useMemo } from "react";
import { TreeItem } from "../../../types/skillTree";
import { BasicTextStyleButton, BlockTypeSelect, BlockTypeSelectItem, blockTypeSelectItems, ColorStyleButton, CreateLinkButton, FormattingToolbar, FormattingToolbarController, getDefaultReactSlashMenuItems, NestBlockButton, SuggestionMenuController, TextAlignButton, UnnestBlockButton } from "@blocknote/react";
import { RiAlertFill } from "react-icons/ri";
import { insertCode } from "@defensestation/blocknote-code";

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
          insertCode() as any
        ),
        query
      );
  }, [editor]);

  return (
    <div className="ui segment tree__node_editor__rich_text_editor__container">
      <BlockNoteView
        editable={editable}
        editor={editor}
        formattingToolbar={false}
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
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect
                items={[
                  ...blockTypeSelectItems(editor.dictionary),
                  {
                    name: "Alert",
                    type: "alert",
                    icon: RiAlertFill,
                    isSelected: (block) => block.type === "alert",
                  } satisfies BlockTypeSelectItem,
                ]}
                key={"blockTypeSelect"}
              />

              <BasicTextStyleButton
                basicTextStyle={"bold"}
                key={"boldStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"italic"}
                key={"italicStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"underline"}
                key={"underlineStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"strike"}
                key={"strikeStyleButton"}
              />
              {/* Extra button to toggle code styles */}
              <BasicTextStyleButton
                key={"codeStyleButton"}
                basicTextStyle={"code"}
              />

              <TextAlignButton
                textAlignment={"left"}
                key={"textAlignLeftButton"}
              />
              <TextAlignButton
                textAlignment={"center"}
                key={"textAlignCenterButton"}
              />
              <TextAlignButton
                textAlignment={"right"}
                key={"textAlignRightButton"}
              />

              <ColorStyleButton key={"colorStyleButton"} />

              <NestBlockButton key={"nestBlockButton"} />
              <UnnestBlockButton key={"unnestBlockButton"} />

              <CreateLinkButton key={"createLinkButton"} />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
    </div>
  );
}
