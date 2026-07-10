import CodeMirrorEditor from "@/components/CodeMirrorEditor";
import { useAppStore } from "@/store/useAppStore";

export default function EditorContainer() {
  const isLocked = useAppStore((s) => s.isEditorLocked);

  return (
    <div id="editor-container" className="flex flex-1 min-h-0" style={{ backgroundColor: "var(--color-bg)", padding: 24 }}>
      <div className="flex flex-1 min-w-0" style={{ border: "var(--border-width) solid var(--color-border)", backgroundColor: "var(--color-paper)" }}>
        <div className="flex-1 flex">
          <CodeMirrorEditor />
        </div>
        {isLocked && (
          <div
            id="editor-placeholder"
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: "var(--color-paper)", margin: 24 }}
          >
            <p className="text-lg font-bold" style={{ color: "var(--color-ink-muted)" }}>
              Selecione ou crie um arquivo na barra lateral para come&ccedil;ar a editar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
