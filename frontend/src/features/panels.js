import { getIsPreviewVisible } from '../core/state.js';

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 500;
const EDITOR_MIN_RATIO = 0.2;
const EDITOR_MAX_RATIO = 0.8;

let sidebarWidth = 250;
let editorPreviewRatio = 0.5;

export function loadPanelSizes() {
    const savedSidebar = localStorage.getItem('carmem-sidebar-width');
    const savedRatio = localStorage.getItem('carmem-editor-preview-ratio');
    
    if (savedSidebar) {
        sidebarWidth = Math.max(SIDEBAR_MIN, parseInt(savedSidebar));
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.width = sidebarWidth + 'px';
        }
    }
    
    if (savedRatio) {
        editorPreviewRatio = parseFloat(savedRatio);
    }
    
    updateEditorPreviewLayout();
}

export function saveSidebarWidth() {
    localStorage.setItem('carmem-sidebar-width', sidebarWidth.toString());
}

export function saveEditorPreviewRatio() {
    localStorage.setItem('carmem-editor-preview-ratio', editorPreviewRatio.toString());
}

export function updateEditorPreviewLayout() {
    const editorEl = document.getElementById('editor');
    const previewEl = document.getElementById('preview');
    const resizer = document.getElementById('editor-preview-resizer');
    
    if (!editorEl || !previewEl) return;
    
    if (getIsPreviewVisible()) {
        if (resizer) resizer.classList.add('visible');
        editorEl.style.flex = `${editorPreviewRatio}`;
        previewEl.style.flex = `${1 - editorPreviewRatio}`;
    } else {
        if (resizer) resizer.classList.remove('visible');
        editorEl.style.flex = '1';
        previewEl.style.flex = '0';
    }
}

export function initResizers() {
    const sidebarResizer = document.getElementById('sidebar-resizer');
    const editorPreviewResizer = document.getElementById('editor-preview-resizer');
    
    if (!sidebarResizer || !editorPreviewResizer) return;
    
    let isResizing = false;
    let currentResizer = null;
    let startX = 0;
    let startWidth = 0;
    let startRatio = 0;
    let startEditorWidth = 0;
    
    sidebarResizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentResizer = 'sidebar';
        startX = e.clientX;
        startWidth = sidebarWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    editorPreviewResizer.addEventListener('mousedown', (e) => {
        if (!getIsPreviewVisible()) return;
        isResizing = true;
        currentResizer = 'editor-preview';
        startX = e.clientX;
        const editorEl = document.getElementById('editor');
        startEditorWidth = editorEl ? editorEl.offsetWidth : 0;
        const containerWidth = document.getElementById('editor-container').offsetWidth - 4;
        startRatio = startEditorWidth / containerWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        if (currentResizer === 'sidebar') {
            const diff = e.clientX - startX;
            sidebarWidth = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startWidth + diff));
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.style.width = sidebarWidth + 'px';
            }
        } else if (currentResizer === 'editor-preview') {
            const containerWidth = document.getElementById('editor-container').offsetWidth - 4;
            const diff = e.clientX - startX;
            const newWidth = startEditorWidth + diff;
            editorPreviewRatio = newWidth / containerWidth;
            editorPreviewRatio = Math.max(EDITOR_MIN_RATIO, Math.min(EDITOR_MAX_RATIO, editorPreviewRatio));
            updateEditorPreviewLayout();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            currentResizer = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            if (currentResizer === 'sidebar' || currentResizer === null) {
                saveSidebarWidth();
            }
            if (currentResizer === 'editor-preview') {
                saveEditorPreviewRatio();
            }
        }
    });
}

export function getSidebarWidth() {
    return sidebarWidth;
}

export function setSidebarWidth(width) {
    sidebarWidth = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, width));
}

export function getEditorPreviewRatio() {
    return editorPreviewRatio;
}

export function setEditorPreviewRatio(ratio) {
    editorPreviewRatio = Math.max(EDITOR_MIN_RATIO, Math.min(EDITOR_MAX_RATIO, ratio));
}

export default {
    loadPanelSizes,
    saveSidebarWidth,
    saveEditorPreviewRatio,
    updateEditorPreviewLayout,
    initResizers,
    getSidebarWidth,
    setSidebarWidth,
    getEditorPreviewRatio,
    setEditorPreviewRatio
};
