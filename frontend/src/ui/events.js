import { getIsVimEnabled, setIsVimEnabled, getConfig } from '../core/state.js';
import { initEditor, recreateEditor, getEditorContent, setContentChangeCallback } from '../core/editor.js';
import { togglePreview, updatePreview, setPreviewButtonActive } from '../core/preview.js';
import { applyTheme } from '../features/theme.js';
import { zoomIn, zoomOut, resetZoom } from '../features/zoom.js';
import { initResizers, updateEditorPreviewLayout } from '../features/panels.js';
import { createNewFile, createNewFolder, deleteSelected, renameSelected, saveCurrentFile } from '../features/fileOps.js';

export function updateVimStatus() {
    const isVimEnabled = getIsVimEnabled();
    const statusEl = document.getElementById('vim-status');
    const btn = document.getElementById('btn-vim');
    
    if (statusEl) {
        if (isVimEnabled) {
            statusEl.textContent = 'VIM Mode: ON';
            statusEl.classList.remove('off');
        } else {
            statusEl.textContent = 'VIM Mode: OFF';
            statusEl.classList.add('off');
        }
    }
    
    if (btn) {
        if (isVimEnabled) {
            btn.classList.add('active');
            btn.title = 'Vim Mode: ESC - Ativar modo Vim';
        } else {
            btn.classList.remove('active');
            btn.title = 'Vim Mode: clique para ativar modo Vim';
        }
    }
}

function toggleVimMode() {
    const newValue = !getIsVimEnabled();
    setIsVimEnabled(newValue);
    recreateEditor();
    updateVimStatus();
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
    } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        togglePreview();
    } else if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
    } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        zoomOut();
    } else if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        resetZoom();
    }
}

function handleContentChange() {
    updatePreview();
}

export function setupEventListeners() {
    document.getElementById('btn-new-file').addEventListener('click', createNewFile);
    document.getElementById('btn-new-folder').addEventListener('click', createNewFolder);
    document.getElementById('btn-delete').addEventListener('click', deleteSelected);
    document.getElementById('btn-rename').addEventListener('click', renameSelected);
    document.getElementById('btn-zoom-in').addEventListener('click', zoomIn);
    document.getElementById('btn-zoom-out').addEventListener('click', zoomOut);
    document.getElementById('btn-vim').addEventListener('click', toggleVimMode);
    document.getElementById('btn-preview').addEventListener('click', togglePreview);
    document.getElementById('btn-theme').addEventListener('click', async () => {
        const { toggleTheme } = await import('../features/theme.js');
        await toggleTheme();
    });
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    setContentChangeCallback(handleContentChange);
}
