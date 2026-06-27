import { Minus, Plus, Eye, Sun, Moon } from "lucide-react";
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
      className="flex items-center gap-2 px-3 py-2 shrink-0 glass-panel"
      style={{
        borderBottom: "var(--border-width) solid var(--color-border)",
      }}
    >
      <span
        id="current-file"
        className={`text-sm truncate min-w-0 ${!sidebarVisible ? "pl-10" : ""}`}
        style={{ color: "var(--color-text-muted)" }}
      >
        {currentFileName || "Nenhum arquivo aberto"}
      </span>
      <div className="flex-1" />
      <button
        onClick={zoomOut}
        className="p-1.5 rounded hover:opacity-80"
        title="Zoom: Ctrl+- - Diminuir"
        style={{ color: "var(--color-text-muted)" }}
      >
        <Minus size={18} />
      </button>
      <span
        id="zoom-level"
        className="text-xs min-w-[2.5rem] text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        {Math.round(zoomLevel * 100)}%
      </span>
      <button
        onClick={zoomIn}
        className="p-1.5 rounded hover:opacity-80"
        title="Zoom: Ctrl++ - Aumentar"
        style={{ color: "var(--color-text-muted)" }}
      >
        <Plus size={18} />
      </button>
      <button
        onClick={() => togglePreview()}
        className={`p-1.5 rounded transition-opacity ${isPreviewVisible ? "opacity-100" : "opacity-50"}`}
        title={isPreviewVisible ? "Preview: Ctrl+P - Editar" : "Preview: Ctrl+P - Visualizar"}
        style={{ color: isPreviewVisible ? "var(--color-accent)" : "var(--color-text-muted)" }}
      >
        <Eye size={18} />
      </button>
      <button
        onClick={handleThemeToggle}
        className="p-1.5 rounded hover:opacity-80"
        title="Alternar tema"
        style={{ color: "var(--color-text-muted)" }}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
