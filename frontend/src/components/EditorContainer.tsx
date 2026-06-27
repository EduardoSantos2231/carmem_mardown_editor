import CodeMirrorEditor from "@/components/CodeMirrorEditor";
import FloatingToolbar from "@/components/FloatingToolbar";
import { useAppStore } from "@/store/useAppStore";

export default function EditorContainer() {
  const isLocked = useAppStore((s) => s.isEditorLocked);

  return (
    <div id="editor-container" className="flex flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-w-0 relative">
        <CodeMirrorEditor />
        <FloatingToolbar />
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
    </div>
  );
}
