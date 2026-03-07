import { marked } from "marked";
import katexExtension from 'marked-katex-extension';
import { getIsPreviewVisible, setIsPreviewVisible } from './state.js';
import { getEditorContent } from './editor.js';
import { updateEditorPreviewLayout } from '../features/panels.js';

marked.use(katexExtension({ throwOnError: false }));

export function updatePreview() {
    if (!getIsPreviewVisible()) return;
    
    const preview = document.getElementById('preview');
    if (!preview) return;
    
    const content = getEditorContent();
    preview.innerHTML = marked.parse(content);
}

export function togglePreview() {
    const preview = document.getElementById('preview');
    if (!preview) return;
    
    const isNowVisible = !getIsPreviewVisible();
    setIsPreviewVisible(isNowVisible);
    
    if (isNowVisible) {
        preview.classList.remove('hidden');
        updatePreview();
        updateEditorPreviewLayout();
    } else {
        preview.classList.add('hidden');
        updateEditorPreviewLayout();
    }
    
    const btn = document.getElementById('btn-preview');
    if (btn) {
        if (isNowVisible) {
            btn.classList.add('active');
            btn.title = 'Preview: Ctrl+P - Ocultar visualização';
        } else {
            btn.classList.remove('active');
            btn.title = 'Preview: Ctrl+P - Mostrar visualização';
        }
    }
    
    return isNowVisible;
}

export function setPreviewButtonActive(active) {
    const btn = document.getElementById('btn-preview');
    if (!btn) return;
    
    if (active) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}

export default {
    updatePreview,
    togglePreview,
    setPreviewButtonActive
};
