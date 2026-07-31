import { syntaxTree } from "@codemirror/language";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { useAppStore } from "@/store/useAppStore";
import "./table-preview.css";

type Cell = {
  from: number;
  to: number;
  text: string;
};

type Row = {
  from: number;
  to: number;
  cells: Cell[];
  header: boolean;
};

type TableData = {
  from: number;
  to: number;
  columns: number;
  alignments: string[];
  rows: Row[];
};

function isEscaped(text: string, position: number) {
  let slashes = 0;
  for (let i = position - 1; i >= 0 && text[i] === "\\"; i--) slashes++;
  return slashes % 2 === 1;
}

function splitRow(state: EditorState, from: number, to: number): Cell[] {
  const text = state.doc.sliceString(from, to);
  const ranges: { from: number; to: number }[] = [];
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "|" && !isEscaped(text, i)) {
      ranges.push({ from: start, to: i });
      start = i + 1;
    }
  }
  ranges.push({ from: start, to: text.length });

  if (text.trimStart().startsWith("|")) ranges.shift();
  if (text.trimEnd().endsWith("|")) ranges.pop();

  return ranges.map((range) => {
    let cellFrom = range.from;
    let cellTo = range.to;
    while (cellFrom < cellTo && /\s/.test(text[cellFrom])) cellFrom++;
    while (cellTo > cellFrom && /\s/.test(text[cellTo - 1])) cellTo--;
    return {
      from: from + cellFrom,
      to: from + cellTo,
      text: text.slice(cellFrom, cellTo),
    };
  });
}

function alignment(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
  if (trimmed.endsWith(":")) return "right";
  return "left";
}

function collectTables(state: EditorState): TableData[] {
  const tables: TableData[] = [];

  syntaxTree(state).iterate({
    enter: (node) => {
      if (node.name !== "Table") return;

      const table = node.node;
      const headers = table.getChildren("TableHeader");
      const bodyRows = table.getChildren("TableRow");
      const header = headers[0];
      if (!header) return;

      const delimiter = table.getChildren("TableDelimiter")[0];
      const rows = [
        {
          from: header.from,
          to: header.to,
          cells: splitRow(state, header.from, header.to),
          header: true,
        },
        ...bodyRows.map((row) => ({
          from: row.from,
          to: row.to,
          cells: splitRow(state, row.from, row.to),
          header: false,
        })),
      ];

      const delimiterCells = delimiter
        ? splitRow(state, delimiter.from, delimiter.to)
        : [];
      const columns = Math.max(
        rows[0].cells.length,
        delimiterCells.length,
        ...rows.map((row) => row.cells.length)
      );

      tables.push({
        from: node.from,
        to: node.to,
        columns,
        alignments: Array.from({ length: columns }, (_, i) =>
          alignment(delimiterCells[i]?.text ?? "")
        ),
        rows,
      });
    },
  });

  return tables;
}

function appendInline(parent: HTMLElement, value: string) {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]*\)|\$[^$\n]+\$)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value))) {
    if (match.index > cursor) {
      parent.append(document.createTextNode(value.slice(cursor, match.index)));
    }

    const token = match[0];
    const element = token.startsWith("**") || token.startsWith("__")
      ? document.createElement("strong")
      : token.startsWith("~~")
        ? document.createElement("del")
        : token.startsWith("`")
          ? document.createElement("code")
          : token.startsWith("*") || token.startsWith("_")
            ? document.createElement("em")
            : document.createElement("span");

    if (token.startsWith("[") || token.startsWith("$")) {
      element.className = token.startsWith("$") ? "cm-live-math" : "cm-live-link";
    }

    element.textContent = token
      .replace(/^\*\*|^__|^~~|^`|^\*|^_|^\[/, "")
      .replace(/\*\*$|__$|~~$|`$|\*$|_$|\].*\)$/, "")
      .replace(/\\\|/g, "|");
    parent.append(element);
    cursor = match.index + token.length;
  }

  if (cursor < value.length) parent.append(document.createTextNode(value.slice(cursor)));
}

class TableWidget extends WidgetType {
  constructor(readonly table: TableData) {
    super();
  }

  eq(other: TableWidget) {
    return this.table.from === other.table.from && this.table.to === other.table.to;
  }

  toDOM(view: EditorView) {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-live-table-wrapper";

    const table = document.createElement("table");
    table.className = "cm-live-table";
    const colgroup = document.createElement("colgroup");
    for (let i = 0; i < this.table.columns; i++) colgroup.append(document.createElement("col"));
    table.append(colgroup);

    const head = document.createElement("thead");
    const body = document.createElement("tbody");
    for (const row of this.table.rows) {
      const tr = document.createElement("tr");
      if (row.header) head.append(tr);
      else body.append(tr);

      for (let i = 0; i < this.table.columns; i++) {
        const cell = row.cells[i] ?? { from: row.to, to: row.to, text: "" };
        const td = document.createElement(row.header ? "th" : "td");
        td.style.textAlign = this.table.alignments[i] ?? "left";
        td.dataset.from = String(cell.from);
        td.dataset.to = String(cell.to);
        appendInline(td, cell.text);
        tr.append(td);
      }
    }
    table.append(head, body);
    wrapper.append(table);

    wrapper.addEventListener("mousedown", (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-from]");
      if (!target) return;
      event.preventDefault();
      view.dispatch({
        selection: { anchor: Number(target.dataset.from), head: Number(target.dataset.to) },
        scrollIntoView: true,
      });
      view.focus();
    });
    return wrapper;
  }
}

function selectionTouchesTable(state: EditorState, table: TableData) {
  return state.selection.ranges.some((range) =>
    range.from <= table.to && range.to >= table.from
  );
}

function buildDecorations(state: EditorState): DecorationSet {
  const isPreview = useAppStore.getState().isPreviewVisible;
  const decorations: { from: number; to: number; value: Decoration }[] = [];

  for (const table of collectTables(state)) {
    if (!isPreview && selectionTouchesTable(state, table)) continue;
    decorations.push({
      from: table.from,
      to: table.to,
      value: Decoration.replace({ widget: new TableWidget(table), block: true }),
    });
  }

  return Decoration.set(decorations, true);
}

export const tablePreviewToggled = StateEffect.define();

export const tablePreviewField = StateField.define<DecorationSet>({
  create: buildDecorations,
  update(value, transaction) {
    const previewChanged = transaction.effects.some((effect) =>
      effect.is(tablePreviewToggled)
    );
    if (transaction.docChanged || transaction.selection || previewChanged) {
      return buildDecorations(transaction.state);
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field),
});
