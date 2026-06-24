import { useAppStore } from "@/store/useAppStore";
import { saveNow } from "@/hooks/useAutosave";
import { toggleReadMode } from "@/components/MarkdownPreview";

export function setupKeyboardShortcuts() {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveNow();
    } else if (e.ctrlKey && e.key === "p") {
      e.preventDefault();
      togglePreview();
    } else if (e.ctrlKey && e.shiftKey && e.key === "P") {
      e.preventDefault();
      toggleReadMode();
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

function togglePreview() {
  const store = useAppStore.getState();
  store.setPreviewVisible(!store.isPreviewVisible);
}

function zoomIn() {
  const store = useAppStore.getState();
  const newZoom = Math.min(2, store.zoomLevel + 0.05);
  store.setZoomLevel(newZoom);
  document.body.style.fontSize = `${newZoom * 16}px`;
  localStorage.setItem("carmem-zoom-level", String(newZoom));
}

function zoomOut() {
  const store = useAppStore.getState();
  const newZoom = Math.max(0.5, store.zoomLevel - 0.05);
  store.setZoomLevel(newZoom);
  document.body.style.fontSize = `${newZoom * 16}px`;
  localStorage.setItem("carmem-zoom-level", String(newZoom));
}

function resetZoom() {
  useAppStore.getState().setZoomLevel(1);
  document.body.style.fontSize = "16px";
  localStorage.setItem("carmem-zoom-level", "1");
}
