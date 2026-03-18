import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { vim } from "@replit/codemirror-vim";
import { carmemDark, carmemDarkSyntax, carmemLight, carmemLightSyntax } from '../theme/carmemTheme.js';
import { getConfig, getIsVimEnabled, setEditor, getEditor, getIsEditorLocked, setIsEditorLocked } from './state.js';
import { updatePreview } from './preview.js';

let onContentChangeCallback = null;
let editableCompartment = new Compartment();
let vimCompartment = new Compartment();

function getVimExtension() {
    if (getIsVimEnabled()) {
        return vim();
    }
    return [];
}

export function initEditor() {
    const editorElement = document.getElementById('editor');
    
    const extensions = [
        basicSetup,
        editableCompartment.of(EditorView.editable.of(false)),
        vimCompartment.of(getVimExtension()),
        markdown(),
        EditorView.updateListener.of((update) => {
            if (update.docChanged && onContentChangeCallback) {
                onContentChangeCallback();
            }
        }),
        EditorView.domEventHandlers({
            keydown: (event, view) => {
                if (event.ctrlKey && event.key === 's') {
                    event.preventDefault();
                    return true;
                }
                if (event.ctrlKey && event.key === 'p') {
                    event.preventDefault();
                    return true;
                }
                return false;
            }
        })
    ];

    const config = getConfig();
    if (config.theme === 'light') {
        extensions.push(carmemLight, carmemLightSyntax);
    } else {
        extensions.push(carmemDark, carmemDarkSyntax);
    }

    const editor = new EditorView({
        state: EditorState.create({
            doc: '',
            extensions: extensions
        }),
        parent: editorElement
    });

    setEditor(editor);
    return editor;
}

export function recreateEditor() {
    const editor = getEditor();
    if (!editor) return;
    
    const content = editor.state.doc.toString();
    const scrollPos = editor.scrollDOM.scrollTop;
    const wasLocked = getIsEditorLocked();
    
    const editorElement = document.getElementById('editor');
    editorElement.innerHTML = '';
    
    initEditor();
    
    const newEditor = getEditor();
    newEditor.dispatch({
        changes: { from: 0, to: newEditor.state.doc.length, insert: content }
    });
    
    newEditor.scrollDOM.scrollTop = scrollPos;
    
    if (!wasLocked) {
        unlockEditor();
    }
}

export function toggleVimExtension() {
    const editor = getEditor();
    if (!editor) return;
    
    editor.dispatch({
        effects: vimCompartment.reconfigure(getVimExtension())
    });
}

export function setContentChangeCallback(callback) {
    onContentChangeCallback = callback;
}

export function getEditorContent() {
    const editor = getEditor();
    if (!editor) return '';
    return editor.state.doc.toString();
}

export function setEditorContent(content) {
    const editor = getEditor();
    if (!editor) return;
    editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: content }
    });
}

export function getScrollPosition() {
    const editor = getEditor();
    if (!editor) return 0;
    return editor.scrollDOM.scrollTop;
}

export function setScrollPosition(pos) {
    const editor = getEditor();
    if (!editor) return;
    editor.scrollDOM.scrollTop = pos;
}

export function clearEditor() {
    const editor = getEditor();
    if (!editor) return;
    editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: '' }
    });
}

export function lockEditor() {
    const editor = getEditor();
    if (!editor) return;
    editor.dispatch({
        effects: editableCompartment.reconfigure(EditorView.editable.of(false))
    });
    setIsEditorLocked(true);
}

export function unlockEditor() {
    const editor = getEditor();
    if (!editor) return;
    editor.dispatch({
        effects: editableCompartment.reconfigure(EditorView.editable.of(true))
    });
    setIsEditorLocked(false);
}

export default {
    initEditor,
    recreateEditor,
    toggleVimExtension,
    setContentChangeCallback,
    getEditorContent,
    setEditorContent,
    getScrollPosition,
    setScrollPosition,
    clearEditor,
    lockEditor,
    unlockEditor
};
