const SIDEBAR_STORAGE_KEY = 'carmem-sidebar-visible';

export function isSidebarVisible() {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false';
}

function setSidebarVisible(visible) {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, visible);
}

export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    const main = document.getElementById('main');
    const btn = document.getElementById('btn-sidebar-toggle');
    
    if (!sidebar || !resizer || !main) return;
    
    const isVisible = sidebar.style.display !== 'none';
    const newVisibility = !isVisible;
    
    sidebar.style.display = newVisibility ? 'flex' : 'none';
    resizer.style.display = newVisibility ? 'block' : 'none';
    
    if (btn) {
        btn.classList.toggle('collapsed', !newVisibility);
    }
    
    setSidebarVisible(newVisibility);
    
    setTimeout(() => {
        initResizers && initResizers();
    }, 100);
}

export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    const btn = document.getElementById('btn-sidebar-toggle');
    
    if (!sidebar || !resizer) return;
    
    const visible = isSidebarVisible();
    
    sidebar.style.display = visible ? 'flex' : 'none';
    resizer.style.display = visible ? 'block' : 'none';
    
    if (btn) {
        btn.classList.toggle('collapsed', !visible);
    }
}

export default {
    toggleSidebar,
    initSidebar,
    isSidebarVisible
};
