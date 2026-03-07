import * as go from '../../wailsjs/go/main/App';
import { getConfig, getSelectedPath, setSelectedPath, getCurrentFile, setCurrentFile } from '../core/state.js';
import { clearEditor, setEditorContent, getEditorContent } from '../core/editor.js';
import { loadFileTree } from './fileTree.js';
import { showModal } from '../ui/modal.js';

export async function getParentDir(path) {
    const parts = path.split('/');
    parts.pop();
    const config = getConfig();
    return parts.join('/') || config.documents;
}

async function getParentPathForSelection() {
    const selectedPath = getSelectedPath();
    if (!selectedPath) {
        return getConfig().documents;
    }
    
    const item = document.querySelector(`[data-path="${selectedPath}"]`);
    if (item?.classList.contains('directory')) {
        return selectedPath;
    }
    
    return await getParentDir(selectedPath);
}

export async function saveCurrentFile() {
    const currentFile = getCurrentFile();
    if (!currentFile) return;
    
    const content = getEditorContent();
    try {
        await go.WriteFile(currentFile, content);
    } catch (err) {
        console.error('Error saving file:', err);
    }
}

export async function createNewFile() {
    const parentPath = await getParentPathForSelection();
    
    showModal('New File', 'filename.md', async (name) => {
        try {
            await go.CreateFile(name, parentPath);
            await loadFileTree();
        } catch (err) {
            console.error('Error creating file:', err);
        }
    });
}

export async function createNewFolder() {
    const parentPath = await getParentPathForSelection();
    
    showModal('New Folder', 'folder name', async (name) => {
        try {
            await go.CreateFolder(name, parentPath);
            await loadFileTree();
        } catch (err) {
            console.error('Error creating folder:', err);
        }
    });
}

export async function deleteSelected() {
    const selectedPath = getSelectedPath();
    if (!selectedPath) return;
    
    const item = document.querySelector(`[data-path="${selectedPath}"]`);
    const name = item?.querySelector('.name')?.textContent || 'this item';
    
    if (!confirm(`Delete "${name}"?`)) return;
    
    try {
        await go.Delete(selectedPath);
        setSelectedPath(null);
        setCurrentFile(null);
        clearEditor();
        
        const currentFileEl = document.getElementById('current-file');
        const fileStatusEl = document.getElementById('file-status');
        
        if (currentFileEl) currentFileEl.textContent = 'No file open';
        if (fileStatusEl) fileStatusEl.textContent = '';
        
        await loadFileTree();
    } catch (err) {
        console.error('Error deleting:', err);
    }
}

export async function renameSelected() {
    const selectedPath = getSelectedPath();
    if (!selectedPath) return;
    
    const item = document.querySelector(`[data-path="${selectedPath}"]`);
    const currentName = item?.querySelector('.name')?.textContent || '';
    
    showModal('Rename', currentName, async (newName) => {
        try {
            await go.Rename(selectedPath, newName);
            setSelectedPath(null);
            setCurrentFile(null);
            await loadFileTree();
        } catch (err) {
            console.error('Error renaming:', err);
        }
    });
}

export async function moveFile(fromPath, toPath) {
    try {
        await go.MoveFile(fromPath, toPath);
        await loadFileTree();
    } catch (err) {
        console.error('Error moving file:', err);
        throw err;
    }
}

export default {
    getParentDir,
    saveCurrentFile,
    createNewFile,
    createNewFolder,
    deleteSelected,
    renameSelected,
    moveFile
};
