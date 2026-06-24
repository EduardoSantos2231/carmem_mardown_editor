import { useAppStore } from "@/store/useAppStore";

export function loadZoomLevel() {
  const saved = localStorage.getItem("carmem-zoom-level");
  if (saved) {
    useAppStore.getState().setZoomLevel(parseFloat(saved));
  }
}

export function applyZoom() {
  const zoom = useAppStore.getState().zoomLevel;
  document.body.style.fontSize = `${zoom * 16}px`;
  const el = document.getElementById("zoom-level");
  if (el) el.textContent = `${Math.round(zoom * 100)}%`;
}

export function zoomIn() {
  const store = useAppStore.getState();
  const newZoom = Math.min(2, Math.round((store.zoomLevel + 0.05) * 100) / 100);
  store.setZoomLevel(newZoom);
  document.body.style.fontSize = `${newZoom * 16}px`;
  localStorage.setItem("carmem-zoom-level", String(newZoom));
  const el = document.getElementById("zoom-level");
  if (el) el.textContent = `${Math.round(newZoom * 100)}%`;
}

export function zoomOut() {
  const store = useAppStore.getState();
  const newZoom = Math.max(0.5, Math.round((store.zoomLevel - 0.05) * 100) / 100);
  store.setZoomLevel(newZoom);
  document.body.style.fontSize = `${newZoom * 16}px`;
  localStorage.setItem("carmem-zoom-level", String(newZoom));
  const el = document.getElementById("zoom-level");
  if (el) el.textContent = `${Math.round(newZoom * 100)}%`;
}

export function resetZoom() {
  useAppStore.getState().setZoomLevel(1);
  document.body.style.fontSize = "16px";
  localStorage.setItem("carmem-zoom-level", "1");
  const el = document.getElementById("zoom-level");
  if (el) el.textContent = "100%";
}
