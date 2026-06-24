import { useAppStore } from "@/store/useAppStore";

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 500;
const EDITOR_MIN_RATIO = 0.2;
const EDITOR_MAX_RATIO = 0.8;

let sidebarWidth = 250;
let editorPreviewRatio = 0.5;

export function loadPanelSizes() {
  const savedSidebar = localStorage.getItem("carmem-sidebar-width");
  const savedRatio = localStorage.getItem("carmem-editor-preview-ratio");

  if (savedSidebar) {
    sidebarWidth = Math.max(SIDEBAR_MIN, parseInt(savedSidebar));
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.style.width = sidebarWidth + "px";
  }

  if (savedRatio) {
    editorPreviewRatio = parseFloat(savedRatio);
  }

  updateEditorPreviewLayout();
}

function saveSidebarWidth() {
  localStorage.setItem("carmem-sidebar-width", String(sidebarWidth));
}

function saveEditorPreviewRatio() {
  localStorage.setItem(
    "carmem-editor-preview-ratio",
    String(editorPreviewRatio)
  );
}

export function updateEditorPreviewLayout() {
  const previewEl = document.getElementById("preview");
  if (!previewEl) return;

  const store = useAppStore.getState();
  const visible = store.isPreviewVisible;
  const isReadMode = store.isReadMode;

  if (isReadMode) {
    previewEl.style.flex = "1";
    return;
  }

  const editorEl = document.getElementById("editor");
  const resizer = document.getElementById("editor-preview-resizer");
  const editorWrapper = editorEl?.parentElement;

  if (visible) {
    if (resizer) resizer.classList.add("visible");
    if (editorWrapper) editorWrapper.style.flex = `${editorPreviewRatio}`;
    previewEl.style.flex = `${1 - editorPreviewRatio}`;
  } else {
    if (resizer) resizer.classList.remove("visible");
    if (editorWrapper) editorWrapper.style.flex = "1";
    previewEl.style.flex = "0";
  }
}

export function initResizers() {
  const sidebarResizer = document.getElementById("sidebar-resizer");
  const editorPreviewResizer = document.getElementById("editor-preview-resizer");
  if (!sidebarResizer || !editorPreviewResizer) return;

  let isResizing = false;
  let currentResizer: "sidebar" | "editor-preview" | null = null;
  let startX = 0;
  let startWidth = 0;
  let startEditorWidth = 0;

  sidebarResizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    currentResizer = "sidebar";
    startX = (e as MouseEvent).clientX;
    startWidth = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  editorPreviewResizer.addEventListener("mousedown", (e) => {
    if (!useAppStore.getState().isPreviewVisible) return;
    isResizing = true;
    currentResizer = "editor-preview";
    startX = (e as MouseEvent).clientX;
    const editorEl = document.getElementById("editor");
    startEditorWidth = editorEl ? editorEl.offsetWidth : 0;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    if (currentResizer === "sidebar") {
      const diff = e.clientX - startX;
      sidebarWidth = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startWidth + diff));
      const sidebar = document.getElementById("sidebar");
      if (sidebar) sidebar.style.width = sidebarWidth + "px";
    } else if (currentResizer === "editor-preview") {
      const container = document.getElementById("editor-container");
      if (!container) return;
      const containerWidth = container.offsetWidth - 4;
      const diff = e.clientX - startX;
      const newWidth = startEditorWidth + diff;
      editorPreviewRatio = newWidth / containerWidth;
      editorPreviewRatio = Math.max(EDITOR_MIN_RATIO, Math.min(EDITOR_MAX_RATIO, editorPreviewRatio));
      updateEditorPreviewLayout();
    }
  });

  document.addEventListener("mouseup", () => {
    if (!isResizing) return;
    const resized = currentResizer;
    isResizing = false;
    currentResizer = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (resized === "sidebar") saveSidebarWidth();
    if (resized === "editor-preview") saveEditorPreviewRatio();
  });
}
