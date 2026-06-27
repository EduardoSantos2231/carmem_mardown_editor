import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder, StateEffect, StateField } from "@codemirror/state";
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

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const tree = syntaxTree(view.state);

  for (const { from, to } of view.visibleRanges) {
    tree.iterate({
      from,
      to,
      enter: (node) => {
        const name = node.type.name;

        if (name in headingClasses) {
          builder.add(
            node.from,
            node.from,
            Decoration.line({ class: headingClasses[name] })
          );
        } else if (name in markClasses) {
          builder.add(
            node.from,
            node.to,
            Decoration.mark({ class: markClasses[name] })
          );
        } else if (name in lineClasses) {
          builder.add(
            node.from,
            node.from,
            Decoration.line({ class: lineClasses[name] })
          );
        }
      },
    });
  }

  return builder.finish();
}

export const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
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
