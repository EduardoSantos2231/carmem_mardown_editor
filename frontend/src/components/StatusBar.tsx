import { CheckCircle, LoaderCircle, Circle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function StatusBar() {
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const saveStatus = useAppStore((s) => s.saveStatus);

  return (
    <div
      id="status-bar"
      className="flex items-center gap-4 px-3 py-1 text-xs shrink-0 glass-surface"
      style={{
        backgroundColor: "var(--color-surface)",
        borderTop: "var(--border-width) solid var(--color-border)",
        color: "var(--color-text-muted)",
      }}
    >
      <span className="flex items-center gap-1">
        {saveStatus === "saved" && (
          <>
            <CheckCircle size={14} style={{ color: "#adff2f" }} />
            Salvo
          </>
        )}
        {saveStatus === "saving" && (
          <>
            <LoaderCircle size={14} className="animate-spin" style={{ color: "#ffd700" }} />
            Salvando...
          </>
        )}
        {saveStatus === "unsaved" && (
          <>
            <Circle size={14} style={{ color: "#f87171" }} />
            Não salvo
          </>
        )}
      </span>
      <span id="file-status" className="truncate ml-auto">
        {currentFilePath || ""}
      </span>
    </div>
  );
}
