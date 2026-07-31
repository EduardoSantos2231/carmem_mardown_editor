import { syntaxTree } from "@codemirror/language";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import katex from "katex";
import { useAppStore } from "@/store/useAppStore";
import "./katex.css";

class MathWidget extends WidgetType {
  constructor(
    readonly latex: string,
    readonly block: boolean,
    readonly from: number
  ) {
    super();
  }

  eq(other: MathWidget) {
    return this.latex === other.latex && this.block === other.block;
  }

  toDOM(view: EditorView) {
    const wrapper = document.createElement(this.block ? "div" : "span");
    wrapper.className = this.block ? "cm-katex-block" : "cm-katex-inline";
    try {
      katex.render(this.latex, wrapper, {
        displayMode: this.block,
        throwOnError: false,
      });
    } catch {
      wrapper.textContent = this.latex;
    }

    wrapper.addEventListener("mousedown", (event) => {
      event.preventDefault();
      view.dispatch({ selection: { anchor: this.from }, scrollIntoView: true });
      view.focus();
    });
    return wrapper;
  }

  ignoreEvent() {
    return false;
  }
}

export const katexPreviewToggled = StateEffect.define();

function touchesSelection(state: EditorState, from: number, to: number) {
  return state.selection.ranges.some(
    (range) => range.from <= to && range.to >= from
  );
}

function buildKatexDecorations(state: EditorState): DecorationSet {
  const isPreview = useAppStore.getState().isPreviewVisible;
  const decorations: { from: number; to: number; value: Decoration }[] = [];

  syntaxTree(state).iterate({
    enter: (node) => {
      const isBlock = node.name === "MathBlock";
      const isInline = node.name === "InlineMath";
      if (!isBlock && !isInline) return;
      if (!isPreview && touchesSelection(state, node.from, node.to)) return;

      const source = state.doc.sliceString(node.from, node.to);
      const latex = isBlock
        ? source.split(/\r?\n/).slice(1, -1).join("\n").trim()
        : source.slice(1, -1);

      decorations.push({
        from: node.from,
        to: node.to,
        value: Decoration.replace({
          widget: new MathWidget(latex, isBlock, node.from),
          block: isBlock,
        }),
      });
    },
  });

  return Decoration.set(decorations, true);
}

export const katexPlugin = StateField.define<DecorationSet>({
  create: buildKatexDecorations,
  update(value, transaction) {
    const treeChanged =
      syntaxTree(transaction.startState) !== syntaxTree(transaction.state);
    const selectionChanged = transaction.selection !== undefined;
    const previewChanged = transaction.effects.some((effect) =>
      effect.is(katexPreviewToggled)
    );

    return transaction.docChanged || treeChanged || selectionChanged || previewChanged
      ? buildKatexDecorations(transaction.state)
      : value;
  },
  provide: (field) => EditorView.decorations.from(field),
});
