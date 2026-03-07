import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { StateEffect, StateField } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { vim } from "@replit/codemirror-vim";
import { getConfig, getIsVimEnabled, setEditor, getEditor, getIsEditorLocked, setIsEditorLocked } from './state.js';
import { updatePreview } from './preview.js';

let onContentChangeCallback = null;

export function initEditor() {
    const editorElement = document.getElementById('editor');
    
    const extensions = [
        basicSetup,
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

    if (getIsVimEnabled()) {
        extensions.push(vim());
    }

    const config = getConfig();
    if (config.theme !== 'light') {
        extensions.push(oneDark);
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
    
    const editorElement = document.getElementById('editor');
    editorElement.innerHTML = '';
    
    initEditor();
    
    const newEditor = getEditor();
    newEditor.dispatch({
        changes: { from: 0, to: newEditor.state.doc.length, insert: content }
    });
    
    newEditor.scrollDOM.scrollTop = scrollPos;
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

const readOnlyEffect = StateEffect.define();

const readOnlyField = StateField.define({
    create() {
        return EditorState.readOnly.of(true);
    },
    update(state, tr) {
        return state.update({
            effects: tr.effects.map(e => e.is(readOnlyEffect) ? EditorState.readOnly.of(e.value) : null)
        }).state;
    },
    provide: f => EditorState.readOnly.from(f)
});

export function lockEditor() {
    const editor = getEditor();
    if (!editor) return;
    editor.dispatch({
        effects: readOnlyEffect.of(true)
    });
    setIsEditorLocked(true);
}

export function unlockEditor() {
    const editor = getEditor();
    if (!editor) return;
    editor.dispatch({
        effects: readOnlyEffect.of(false)
    });
    setIsEditorLocked(false);
}

export default {
    initEditor,
    recreateEditor,
    setContentChangeCallback,
    getEditorContent,
    setEditorContent,
    getScrollPosition,
    setScrollPosition,
    clearEditor,
    lockEditor,
    unlockEditor
};
