let editor = null;
let currentFile = null;
let isPreviewVisible = false;
let isVimEnabled = true;
let isEditorLocked = true;
let config = { theme: 'dark', documents: '' };
let selectedPath = null;

const state = {
    get editor() { return editor; },
    set editor(value) { editor = value; },
    
    get currentFile() { return currentFile; },
    set currentFile(value) { currentFile = value; },
    
    get isPreviewVisible() { return isPreviewVisible; },
    set isPreviewVisible(value) { isPreviewVisible = value; },
    
    get isVimEnabled() { return isVimEnabled; },
    set isVimEnabled(value) { isVimEnabled = value; },
    
    get isEditorLocked() { return isEditorLocked; },
    set isEditorLocked(value) { isEditorLocked = value; },
    
    get config() { return config; },
    set config(value) { config = value; },
    
    get selectedPath() { return selectedPath; },
    set selectedPath(value) { selectedPath = value; }
};

export function getEditor() {
    return editor;
}

export function setEditor(newEditor) {
    editor = newEditor;
}

export function getCurrentFile() {
    return currentFile;
}

export function setCurrentFile(path) {
    currentFile = path;
}

export function getIsPreviewVisible() {
    return isPreviewVisible;
}

export function setIsPreviewVisible(value) {
    isPreviewVisible = value;
}

export function getIsVimEnabled() {
    return isVimEnabled;
}

export function setIsVimEnabled(value) {
    isVimEnabled = value;
}

export function getIsEditorLocked() {
    return isEditorLocked;
}

export function setIsEditorLocked(value) {
    isEditorLocked = value;
}

export function getConfig() {
    return config;
}

export function setConfig(newConfig) {
    config = newConfig;
}

export function getSelectedPath() {
    return selectedPath;
}

export function setSelectedPath(path) {
    selectedPath = path;
}

export default state;
