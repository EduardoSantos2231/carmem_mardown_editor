import Icon from "@/components/ui/Icon";
import { useAppStore } from "@/store/useAppStore";
import * as go from "../../wailsjs/go/main/App";
import { zoomIn, zoomOut } from "@/hooks/useZoom";
import { togglePreview } from "@/lib/cm-live-preview";

export default function Toolbar() {
  const currentFileName = useAppStore((s) => s.currentFileName);
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const zoomLevel = useAppStore((s) => s.zoomLevel);
  const isPreviewVisible = useAppStore((s) => s.isPreviewVisible);
  const theme = useAppStore((s) => s.theme);

  const handleThemeToggle = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    useAppStore.getState().setTheme(newTheme);
    document.body.className = newTheme;
    await go.SetTheme(newTheme);
  };

  return (
    <div
      id="toolbar"
      className="flex items-center gap-2 px-3 py-2 shrink-0 panel"
      style={{ borderBottom: "var(--border-width) solid var(--color-border)", boxShadow: "none" }}
    >
      <span
        id="current-file"
        className={`text-sm font-bold truncate min-w-0 ${!sidebarVisible ? "pl-14" : ""}`}
        style={{ color: "var(--color-ink-muted)" }}
      >
        {currentFileName || "Nenhum arquivo aberto"}
      </span>
      <div className="flex-1" />
      <div className="flex items-center" style={{ border: "var(--border-width) solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
        <button onClick={zoomOut} className="p-1.5" title="Zoom: Ctrl+- - Diminuir" style={{ color: "var(--color-ink)", borderRight: "var(--border-width) solid var(--color-border)" }}>
          <Icon name="minus" size={16} />
        </button>
        <span id="zoom-level" className="text-xs font-bold min-w-[2.5rem] text-center" style={{ color: "var(--color-ink-muted)" }}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <button onClick={zoomIn} className="p-1.5" title="Zoom: Ctrl++ - Aumentar" style={{ color: "var(--color-ink)", borderLeft: "var(--border-width) solid var(--color-border)" }}>
          <Icon name="plus" size={16} />
        </button>
      </div>
      <button
        onClick={() => togglePreview()}
        className="btn-press p-1.5"
        title={isPreviewVisible ? "Preview: Ctrl+P - Editar" : "Preview: Ctrl+P - Visualizar"}
        style={{
          border: "var(--border-width) solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
          backgroundColor: isPreviewVisible ? "var(--color-accent)" : "var(--color-chrome)",
          color: isPreviewVisible ? "#ffffff" : "var(--color-ink)",
        }}
      >
        <Icon name="eye" size={18} />
      </button>
      <button
        onClick={handleThemeToggle}
        className="btn-press p-1.5"
        title="Alternar tema"
        style={{ border: "var(--border-width) solid var(--color-border)", boxShadow: "var(--shadow-sm)", color: "var(--color-ink)" }}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
      </button>
    </div>
  );
}
