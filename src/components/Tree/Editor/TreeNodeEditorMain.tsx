import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  FormattingToolbarController,
  FormattingToolbar,
  BlockTypeSelect,
  blockTypeSelectItems,
  BlockTypeSelectItem,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";
import { insertCode } from "@defensestation/blocknote-code";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";
import { useContext } from "react";
import { TreeItem } from "../../../types/skillTree";
import { RiAlertFill } from "react-icons/ri";

export default function TreeNodeEditorMain({
  editor,
  node,
  editable
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
        {/* 
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore */}
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query: string) =>
            filterSuggestionItems(
              [...getDefaultReactSlashMenuItems(editor), insertCode()],
              query
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}
