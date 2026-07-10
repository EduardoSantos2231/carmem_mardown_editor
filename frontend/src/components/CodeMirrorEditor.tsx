import { useEffect } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { autocompletion } from "@codemirror/autocomplete";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { useAppStore } from "@/store/useAppStore";
import { getTheme } from "@/lib/cm-theme";
import { markUnsaved } from "@/hooks/useAutosave";
import { livePreviewPlugin, editableState } from "@/lib/cm-live-preview";
import { floatingToolbarPlugin } from "@/lib/floating-toolbar-plugin";

const themeCompartment = new Compartment();
let cmView: EditorView | null = null;

function createEditor(parent: HTMLElement, initialDoc: string, theme: "dark" | "light") {
  const extensions = [
    basicSetup,
    autocompletion({ override: [() => null] }),
    EditorView.lineWrapping,
    themeCompartment.of(getTheme(theme)),
    markdown({ base: markdownLanguage,
      codeLanguages: (info: string) => {
        const lang = info.toLowerCase().trim();
        if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript") return javascript().language;
        if (lang === "css") return css().language;
        if (lang === "html") return html().language;
        if (lang === "json") return json().language;
        if (lang === "py" || lang === "python") return python().language;
        return null;
      },
    }),
    editableState,
    livePreviewPlugin,
    floatingToolbarPlugin,
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

  const theme = useAppStore.getState().theme;
  createEditor(el, initialContent, theme);
}

export default function CodeMirrorEditor() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    if (cmView) {
      cmView.dispatch({
        effects: themeCompartment.reconfigure(getTheme(theme)),
      });
    }
  }, [theme]);

  return <div id="editor" className="flex-1 min-w-0" />;
}
