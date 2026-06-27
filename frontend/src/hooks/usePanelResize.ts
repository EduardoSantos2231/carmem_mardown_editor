
const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 500;

let sidebarWidth = 250;

export function loadPanelSizes() {
  const savedSidebar = localStorage.getItem("carmem-sidebar-width");
  if (savedSidebar) {
    sidebarWidth = Math.max(SIDEBAR_MIN, parseInt(savedSidebar));
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.style.width = sidebarWidth + "px";
  }
}

function saveSidebarWidth() {
  localStorage.setItem("carmem-sidebar-width", String(sidebarWidth));
}

export function initResizers() {
  const sidebarResizer = document.getElementById("sidebar-resizer");
  if (!sidebarResizer) return;

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  sidebarResizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    startX = (e as MouseEvent).clientX;
    startWidth = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    const diff = e.clientX - startX;
    sidebarWidth = Math.max(
      SIDEBAR_MIN,
      Math.min(SIDEBAR_MAX, startWidth + diff)
    );
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.style.width = sidebarWidth + "px";
  });

  document.addEventListener("mouseup", () => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    saveSidebarWidth();
  });
}
