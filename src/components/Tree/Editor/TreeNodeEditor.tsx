import "./TreeNodeEditor.css";
import { useContext, useMemo, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { SkillTreeContext } from "../../../contexts/SkillTreeContext";
import TreeNodeEditorHeader from "./TreeNodeEditorHeader";
import TreeNodeEditorMain from "./TreeNodeEditorMain";
import { useAuth0 } from "@auth0/auth0-react";
import { CodeBlock } from "@defensestation/blocknote-code";
import { BlockNoteSchema, defaultBlockSpecs, BlockNoteEditor, locales } from "@blocknote/core";
import { NodeEditorAlert } from "./NodeEditorAlert";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TreeNodeEditor() {
  const context = useContext(SkillTreeContext);

  if (!context) {
    throw new Error("TreeNodeEditor must be used within a SkillTreeContext");
  }
  const { state } = context;

  const [isFullscreen, setFullscreen] = useState(false);

  const { userId } = useParams();
  const { user } = useAuth0();

  if (state.selectedNode === null) {
    throw new Error("Error rendering editor: No node is selected");
  }
  const node = state.selectedNode;

  const { i18n } = useTranslation(); // Get current language from i18n
  const dictionary = locales[i18n.language.replace(/-.*/g, '') as keyof typeof locales]; // Dynamically load dictionary based on language

  // Use useMemo to ensure editor is created only when necessary
  const editor = useMemo(() => {
    const schema = BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        procode: CodeBlock,
        alert: NodeEditorAlert,
      },
    });

    let content: any[] | null = null;
    if (node.content !== undefined) {
      content = JSON.parse(node.content);
      content = Array.isArray(content) && content.length === 0 ? null : content;
    }

    return BlockNoteEditor.create({
      schema,
      initialContent: content as any,
      dictionary,
    });
  }, [state.selectedNodeId, dictionary]);

  return (
    <div
      className={`ui segments tree__node_editor__container${
        isFullscreen ? " tree__node_editor__container--fullscreen" : ""
      }`}
    >
      <TreeNodeEditorHeader
        editable={userId === user?.sub && !state.preview}
        node={node}
        isFullscreen={isFullscreen}
        setFullscreen={setFullscreen}
      />
      {!node.linkTo && (
        <TreeNodeEditorMain
          editable={userId === user?.sub && !state.preview}
          editor={editor}
          node={node}
        />
      )}
    </div>
  );
}
