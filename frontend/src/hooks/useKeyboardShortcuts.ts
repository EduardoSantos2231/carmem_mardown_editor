import { useAppStore } from "@/store/useAppStore";
import { saveNow } from "@/hooks/useAutosave";
import { togglePreview } from "@/lib/cm-live-preview";
import { zoomIn, zoomOut, resetZoom } from "@/hooks/useZoom";

export function setupKeyboardShortcuts() {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveNow();
    } else if (e.ctrlKey && e.key === "p") {
      e.preventDefault();
      togglePreview();
    } else if (e.ctrlKey && (e.key === "+" || e.key === "=")) {
      e.preventDefault();
      zoomIn();
    } else if (e.ctrlKey && e.key === "-") {
      e.preventDefault();
      zoomOut();
    } else if (e.ctrlKey && e.key === "0") {
      e.preventDefault();
      resetZoom();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  window.addEventListener("beforeunload", (e) => {
    const store = useAppStore.getState();
    if (store.hasUnsavedChanges) {
      e.preventDefault();
    }
  });
}

