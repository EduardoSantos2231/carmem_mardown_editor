import Icon from "@/components/ui/Icon";
import { useAppStore } from "@/store/useAppStore";

export default function StatusBar() {
  const currentFilePath = useAppStore((s) => s.currentFilePath);
  const saveStatus = useAppStore((s) => s.saveStatus);

  return (
    <div
      id="status-bar"
      className="flex items-center gap-4 px-3 py-1 text-xs font-bold shrink-0 panel"
      style={{
        borderTop: "var(--border-width) solid var(--color-border)",
        boxShadow: "none",
        color: "var(--color-ink-muted)",
      }}
    >
      <span className="flex items-center gap-1.5">
        {saveStatus === "saved" && (
          <>
            <span className="inline-block" style={{ width: 8, height: 8, backgroundColor: "var(--color-success)" }} />
            Salvo
          </>
        )}
        {saveStatus === "saving" && (
          <>
            <Icon name="loader-circle" size={12} style={{ color: "var(--color-warning)" }} />
            Salvando...
          </>
        )}
        {saveStatus === "unsaved" && (
          <>
            <span className="inline-block animate-pulse" style={{ width: 8, height: 8, backgroundColor: "var(--color-danger)" }} />
            Não salvo
          </>
        )}
      </span>
      <span id="file-status" className="truncate ml-auto" style={{ fontFamily: "var(--font-mono)" }}>
        {currentFilePath || ""}
      </span>
    </div>
  );
}
