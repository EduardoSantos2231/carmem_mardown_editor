import * as go from '../../wailsjs/go/main/App';
import { icons } from '../ui/icons.js';
import { getConfig, setSelectedPath, getSelectedPath, setCurrentFile, getCurrentFile } from '../core/state.js';
import { setEditorContent, clearEditor, getScrollPosition, setScrollPosition, unlockEditor } from '../core/editor.js';
import { updatePreview } from '../core/preview.js';
import { getParentDir } from './fileOps.js';
import { clearAutosaveStatus, updateSaveStatus } from './autosave.js';

let onFileSelectCallback = null;
let onFileTreeChangeCallback = null;

export function setOnFileSelectCallback(callback) {
    onFileSelectCallback = callback;
}

export function setOnFileTreeChangeCallback(callback) {
    onFileTreeChangeCallback = callback;
}

export async function loadFileTree() {
    try {
        const tree = await go.GetFileTree();
        renderFileTree(tree);
        if (onFileTreeChangeCallback) {
            onFileTreeChangeCallback(tree);
        }
    } catch (err) {
        console.error('Error loading file tree:', err);
    }
}

export function renderFileTree(nodes, container = null) {
    if (!container) {
        container = document.getElementById('file-tree');
        if (!container) return;
        container.innerHTML = '';
    }

    nodes.forEach(node => {
        const item = document.createElement('div');
        item.className = `file-item ${node.isDir ? 'directory' : ''}`;
        item.dataset.path = node.path;
        item.dataset.isDir = node.isDir;
        item.draggable = true;

        if (node.isDir) {
            const chevron = document.createElement('span');
            chevron.className = 'chevron';
            chevron.innerHTML = icons.chevronRight;
            item.appendChild(chevron);
            
            chevron.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFolder(item, node, chevron, container);
            });
            
            setupDragEvents(item, node);
        } else {
            setupDragEvents(item, node);
        }

        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.innerHTML = node.isDir ? icons.folder : icons.file;
        item.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = node.name;
        item.appendChild(name);

        item.addEventListener('click', () => selectFile(node));
        
        const selectedPath = getSelectedPath();
        if (selectedPath === node.path) {
            item.classList.add('selected');
        }
        
        container.appendChild(item);

        if (node.isDir && node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'folder-children';
            childrenContainer.dataset.parentPath = node.path;
            renderFileTree(node.children, childrenContainer);
            childrenContainer.style.display = 'block';
            container.appendChild(childrenContainer);
            
            item.classList.add('expanded');
            const chevronEl = item.querySelector('.chevron');
            if (chevronEl) chevronEl.classList.add('expanded');
        }
    });
}

function toggleFolder(item, node, chevron, container) {
    const isExpanded = item.classList.toggle('expanded');
    item.classList.toggle('collapsed', !isExpanded);
    chevron.classList.toggle('expanded', isExpanded);
    chevron.classList.toggle('collapsed', !isExpanded);
    
    const childrenContainer = container.querySelector(`.folder-children[data-parent-path="${node.path}"]`);
    if (childrenContainer) {
        childrenContainer.style.display = isExpanded ? 'block' : 'none';
    }
}

function setupDragEvents(item, node) {
    item.addEventListener('dragstart', (e) => {
        window.draggedItemPath = node.path;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', node.path);
        setTimeout(() => {
            item.classList.add('dragging');
        }, 0);
    });

    item.addEventListener('dragend', () => {
        window.draggedItemPath = null;
        item.classList.remove('dragging');
        document.querySelectorAll('.file-item.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    });

    if (node.isDir) {
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const draggedPath = window.draggedItemPath;
            if (draggedPath && draggedPath !== node.path) {
                item.classList.add('drag-over');
            }
        });
        
        item.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            item.classList.remove('drag-over');
        });
        
        item.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            item.classList.remove('drag-over');
            
            const draggedPath = window.draggedItemPath;
            if (!draggedPath || draggedPath === node.path) return;
            
            const draggedItem = document.querySelector(`[data-path="${draggedPath}"]`);
            const draggedIsDir = draggedItem?.dataset.isDir === 'true';
            
            if (draggedIsDir && draggedPath.startsWith(node.path + '/')) {
                return;
            }
            
            try {
                await go.MoveFile(draggedPath, node.path);
                const currentFile = getCurrentFile();
                if (currentFile === draggedPath) {
                    setCurrentFile(null);
                    clearEditor();
                    document.getElementById('current-file').textContent = 'No file open';
                    document.getElementById('file-status').textContent = '';
                }
                await loadFileTree();
                if (onFileTreeChangeCallback) {
                    onFileTreeChangeCallback();
                }
            } catch (err) {
                console.error('Error moving file:', err);
            }
        });
    }
}

export async function selectFile(node) {
    setSelectedPath(node.path);
    
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
    const item = document.querySelector(`[data-path="${node.path}"]`);
    if (item) item.classList.add('selected');

    if (node.isDir) {
        return;
    }
    
    try {
        const content = await go.ReadFile(node.path);
        setCurrentFile(node.path);
        clearAutosaveStatus();
        updateSaveStatus('saved');
        
        setEditorContent(content);
        
        const placeholder = document.getElementById('editor-placeholder');
        if (placeholder) {
            placeholder.classList.remove('visible');
        }
        unlockEditor();
        
        const currentFileEl = document.getElementById('current-file');
        const fileStatusEl = document.getElementById('file-status');
        
        if (currentFileEl) currentFileEl.textContent = node.name;
        if (fileStatusEl) fileStatusEl.textContent = node.path;
        
        updatePreview();
        
        if (onFileSelectCallback) {
            onFileSelectCallback(node);
        }
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

export function deselectAll() {
    document.querySelectorAll('.file-item.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

export function selectByPath(path) {
    deselectAll();
    const item = document.querySelector(`[data-path="${path}"]`);
    if (item) {
        item.classList.add('selected');
    }
}

export default {
    loadFileTree,
    renderFileTree,
    selectFile,
    deselectAll,
    selectByPath,
    setOnFileSelectCallback,
    setOnFileTreeChangeCallback
};
