import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { useAppStore } from "@/store/useAppStore";

const headingClasses: Record<string, string> = {
  ATXHeading1: "cm-live-heading-1",
  ATXHeading2: "cm-live-heading-2",
  ATXHeading3: "cm-live-heading-3",
  ATXHeading4: "cm-live-heading-4",
  ATXHeading5: "cm-live-heading-5",
  ATXHeading6: "cm-live-heading-6",
  SetextHeading1: "cm-live-heading-1",
  SetextHeading2: "cm-live-heading-2",
};

const markClasses: Record<string, string> = {
  StrongEmphasis: "cm-live-strong",
  Emphasis: "cm-live-emphasis",
  Strikethrough: "cm-live-strikethrough",
  InlineCode: "cm-live-inline-code",
  Link: "cm-live-link",
};

const lineClasses: Record<string, string> = {
  Blockquote: "cm-live-blockquote",
  FencedCode: "cm-live-code-block",
  CodeBlock: "cm-live-code-block",
  HorizontalRule: "cm-live-hr",
};

let styleInjected = false;

function injectLivePreviewCSS() {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    .cm-live-heading-1, .cm-line.cm-live-heading-1 {
      font-size: 1.75rem !important; font-weight: 700 !important;
      line-height: 1.3; padding-top: 0.75rem;
      color: var(--color-accent) !important;
    }
    .cm-live-heading-2, .cm-line.cm-live-heading-2 {
      font-size: 1.45rem !important; font-weight: 600 !important;
      line-height: 1.3; padding-top: 0.5rem;
      color: var(--color-accent) !important;
    }
    .cm-live-heading-3, .cm-line.cm-live-heading-3 {
      font-size: 1.2rem !important; font-weight: 600 !important;
      line-height: 1.3; padding-top: 0.4rem;
      color: var(--color-accent) !important;
    }
    .cm-live-heading-4, .cm-line.cm-live-heading-4 {
      font-size: 1.05rem !important; font-weight: 600 !important;
      color: var(--color-accent) !important;
    }
    .cm-live-heading-5, .cm-line.cm-live-heading-5 {
      font-size: 0.95rem !important; font-weight: 600 !important;
      color: var(--color-accent) !important;
    }
    .cm-live-heading-6, .cm-line.cm-live-heading-6 {
      font-size: 0.9rem !important; font-weight: 600 !important;
      color: var(--color-text-muted) !important;
    }
    .cm-live-strong { font-weight: bold !important; }
    .cm-live-emphasis { font-style: italic !important; }
    .cm-live-strikethrough { text-decoration: line-through !important; }
    .cm-live-inline-code {
      background: var(--color-surface) !important;
      font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace !important;
      font-size: 0.85em !important;
      padding: 0.15em 0.35em !important; border-radius: 3px;
    }
    .cm-live-link {
      color: var(--color-accent) !important;
      text-decoration: underline !important;
    }
    .cm-line.cm-live-blockquote, .cm-live-blockquote {
      border-left: 3px solid var(--color-accent) !important;
      padding-left: 1rem !important;
      color: var(--color-text-muted) !important;
    }
    .cm-line.cm-live-code-block, .cm-live-code-block {
      background: var(--color-surface) !important;
      font-family: monospace !important;
      font-size: 0.875em !important;
    }
    .cm-line.cm-live-hr {
      border-bottom: 1px solid var(--color-border) !important;
    }
  `;
  document.head.appendChild(style);
  console.warn("[live-preview] CSS injected");
}

function buildDecorations(view: EditorView): DecorationSet {
  const decorations: { from: number; to: number; value: Decoration }[] = [];
  const tree = syntaxTree(view.state);

  let totalNodes = 0;
  let matchedNodes = 0;

  // ponytail: iterate visible ranges only
  for (const { from, to } of view.visibleRanges) {
    tree.iterate({
      from,
      to,
      enter: (node) => {
        const name = node.type.name;
        totalNodes++;

        if (name in headingClasses) {
          matchedNodes++;
          decorations.push({
            from: node.from,
            to: node.from,
            value: Decoration.line({ class: headingClasses[name] }),
          });
        } else if (name in markClasses) {
          matchedNodes++;
          decorations.push({
            from: node.from,
            to: node.to,
            value: Decoration.mark({ class: markClasses[name] }),
          });
        } else if (name in lineClasses) {
          matchedNodes++;
          decorations.push({
            from: node.from,
            to: node.from,
            value: Decoration.line({ class: lineClasses[name] }),
          });
        }
      },
    });
  }

  console.warn("[live-preview] nodes:", totalNodes, "matched:", matchedNodes, "decos:", decorations.length, "docLen:", view.state.doc.length);
  return Decoration.set(decorations, true);
}

export const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      injectLivePreviewCSS();
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        syntaxTree(update.startState) !== syntaxTree(update.state)
      ) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

const editableEffect = StateEffect.define<boolean>();

export const editableState = StateField.define<boolean>({
  create: () => true,
  update(value, tr) {
    for (const e of tr.effects) if (e.is(editableEffect)) return e.value;
    return value;
  },
  provide: (f) => EditorView.editable.from(f),
});

export function togglePreview() {
  const store = useAppStore.getState();
  const view = store.editor;
  if (!view || !store.currentFilePath) return;

  const next = !store.isPreviewVisible;
  store.setPreviewVisible(next);

  view.dispatch({ effects: editableEffect.of(!next) });

  const wrapper = document.getElementById("editor")?.parentElement;
  wrapper?.classList.toggle("cm-preview-mode", next);
}
