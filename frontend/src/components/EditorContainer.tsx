import CodeMirrorEditor from "@/components/CodeMirrorEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import { useAppStore } from "@/store/useAppStore";

export default function EditorContainer() {
  const isPreviewVisible = useAppStore((s) => s.isPreviewVisible);
  const isLocked = useAppStore((s) => s.isEditorLocked);

  return (
    <div id="editor-container" className="flex flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <div className="flex flex-1 min-w-0 relative">
          <CodeMirrorEditor />
          {isLocked && (
            <div
              id="editor-placeholder"
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <p style={{ color: "var(--color-text-muted)" }}>
                Selecione ou crie um arquivo na barra lateral para começar a editar.
              </p>
            </div>
          )}
        </div>
        {isPreviewVisible && (
          <div
            id="editor-preview-resizer"
            className="resizer-horizontal flex-shrink-0 cursor-col-resize visible"
            style={{
              width: "4px",
              backgroundColor: "transparent",
              zIndex: 10,
            }}
          />
        )}
        <MarkdownPreview />
      </div>
    </div>
  );
}
