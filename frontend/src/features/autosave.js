import * as go from '../../wailsjs/go/main/App';
import { icons } from '../ui/icons.js';
import { getCurrentFile, getHasUnsavedChanges, setHasUnsavedChanges, getIsSaving, setIsSaving } from '../core/state.js';
import { getEditorContent } from '../core/editor.js';

const AUTOSAVE_DELAY = 2000;
let autosaveTimer = null;

function updateSaveStatus(status) {
    const statusEl = document.getElementById('save-status');
    if (!statusEl) return;

    statusEl.className = '';
    statusEl.classList.add(status);

    switch (status) {
        case 'saved':
            statusEl.innerHTML = `${icons.checkCircle}Saved`;
            break;
        case 'saving':
            statusEl.innerHTML = `${icons.loader}Saving...`;
            break;
        case 'unsaved':
            statusEl.innerHTML = `${icons.circle}Unsaved`;
            break;
        case 'hidden':
            statusEl.innerHTML = '';
            statusEl.className = '';
            break;
    }
}

export { updateSaveStatus };

async function performSave() {
    const currentFile = getCurrentFile();
    if (!currentFile) return;

    setIsSaving(true);
    updateSaveStatus('saving');

    try {
        const content = getEditorContent();
        await go.WriteFile(currentFile, content);
        setHasUnsavedChanges(false);
        updateSaveStatus('saved');
    } catch (err) {
        console.error('Error saving file:', err);
        updateSaveStatus('unsaved');
    } finally {
        setIsSaving(false);
    }
}

function debounce(func, delay) {
    return function (...args) {
        if (autosaveTimer) {
            clearTimeout(autosaveTimer);
        }
        autosaveTimer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const debouncedSave = debounce(performSave, AUTOSAVE_DELAY);

export function markUnsaved() {
    const currentFile = getCurrentFile();
    if (!currentFile) return;

    const isSaving = getIsSaving();
    if (isSaving) return;

    setHasUnsavedChanges(true);
    updateSaveStatus('unsaved');

    debouncedSave();
}

export function saveNow() {
    if (autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer = null;
    }
    performSave();
}

export function clearAutosaveStatus() {
    if (autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer = null;
    }
    setHasUnsavedChanges(false);
    setIsSaving(false);
    updateSaveStatus('hidden');
}

export function initAutosaveStatus() {
    updateSaveStatus('hidden');
}

export default {
    markUnsaved,
    saveNow,
    clearAutosaveStatus,
    initAutosaveStatus
};
