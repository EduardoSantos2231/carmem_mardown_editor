import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { useAppStore } from "@/store/useAppStore";
import { getTheme } from "@/lib/cm-theme";
import { markUnsaved } from "@/hooks/useAutosave";
import { livePreviewPlugin, editableState } from "@/lib/cm-live-preview";

let cmView: EditorView | null = null;

function createEditor(parent: HTMLElement, initialDoc: string) {
  const theme = useAppStore.getState().theme;
  const extensions = [
    basicSetup,
    EditorView.lineWrapping,
    ...getTheme(theme),
    markdown(),
    editableState,
    livePreviewPlugin,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) markUnsaved();
    }),
  ];

  const view = new EditorView({
    state: EditorState.create({ doc: initialDoc, extensions }),
    parent,
  });

  useAppStore.getState().setEditor(view);
  cmView = view;
  return view;
}

export function initCodeMirror(initialContent: string) {
  const el = document.getElementById("editor");
  if (!el) return;
  el.innerHTML = "";

  if (cmView) {
    cmView.destroy();
    cmView = null;
  }

  createEditor(el, initialContent);
}

export default function CodeMirrorEditor() {
  const theme = useAppStore((s) => s.theme);
  const prevTheme = useRef(theme);

  useEffect(() => {
    if (theme !== prevTheme.current && cmView) {
      prevTheme.current = theme;
      const content = cmView.state.doc.toString();
      cmView.destroy();
      const el = document.getElementById("editor");
      if (el) createEditor(el, content);
    }
  }, [theme]);

  return <div id="editor" className="flex-1 min-w-0" />;
}
