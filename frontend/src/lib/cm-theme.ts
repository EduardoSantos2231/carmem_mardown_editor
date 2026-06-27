import { EditorView } from "@codemirror/view";
import {
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const darkColors = {
  background: "#0f1419",
  foreground: "#e5e7eb",
  selection: "rgba(5, 150, 105, 0.3)",
  cursor: "#059669",
  activeLine: "rgba(5, 150, 105, 0.1)",
  activeLineGutter: "#243044",
  guttersBackground: "#1a2332",
  guttersBorder: "#374357",
  gutterForeground: "#6b7280",
  lineNumberForeground: "#6b7280",
  matchingBracket: "rgba(5, 150, 105, 0.4)",
};

const lightColors = {
  background: "#ffffff",
  foreground: "#1f2937",
  selection: "rgba(5, 150, 105, 0.2)",
  cursor: "#059669",
  activeLine: "rgba(5, 150, 105, 0.05)",
  activeLineGutter: "#e8f0ec",
  guttersBackground: "#f3f7f5",
  guttersBorder: "#d1d9e0",
  gutterForeground: "#9ca3af",
  lineNumberForeground: "#9ca3af",
  matchingBracket: "rgba(5, 150, 105, 0.3)",
};

function makeHighlightStyle(colors: Record<string, string>) {
  return HighlightStyle.define([
    { tag: t.comment, color: colors.comment, fontStyle: "italic" },
    { tag: t.heading, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading1, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading2, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading3, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading4, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading5, color: colors.heading, fontWeight: "bold" },
    { tag: t.heading6, color: colors.heading, fontWeight: "bold" },
    { tag: t.emphasis, color: colors.emphasis, fontStyle: "italic" },
    { tag: t.strong, color: colors.strong, fontWeight: "bold" },
    { tag: t.link, color: colors.link, textDecoration: "underline" },
    { tag: t.url, color: colors.url },
    { tag: t.meta, color: colors.meta },
    { tag: t.keyword, color: colors.keyword },
    { tag: t.atom, color: colors.atom },
    { tag: t.bool, color: colors.atom },
    { tag: t.null, color: colors.atom },
    { tag: t.number, color: colors.number },
    { tag: t.integer, color: colors.number },
    { tag: t.float, color: colors.number },
    { tag: t.string, color: colors.string },
    { tag: t.literal, color: colors.string },
    { tag: t.inserted, color: colors.string },
    { tag: t.variableName, color: colors.variableName },
    { tag: t.definition(t.variableName), color: colors.definition },
    { tag: t.local(t.variableName), color: colors.variableName },
    { tag: t.propertyName, color: colors.propertyName },
    { tag: t.definition(t.propertyName), color: colors.definition },
    { tag: t.operator, color: colors.operator },
    { tag: t.arithmeticOperator, color: colors.operator },
    { tag: t.logicOperator, color: colors.operator },
    { tag: t.bitwiseOperator, color: colors.operator },
    { tag: t.compareOperator, color: colors.operator },
    { tag: t.punctuation, color: colors.punctuation },
    { tag: t.separator, color: colors.punctuation },
    { tag: t.bracket, color: colors.bracket },
    { tag: t.angleBracket, color: colors.bracket },
    { tag: t.squareBracket, color: colors.bracket },
    { tag: t.paren, color: colors.bracket },
    { tag: t.brace, color: colors.bracket },
    { tag: t.content, color: colors.content },
    { tag: t.monospace, color: colors.string },
    { tag: t.tagName, color: colors.tagName },
    { tag: t.attributeName, color: colors.attributeName },
    { tag: t.attributeValue, color: colors.attributeValue },
    { tag: t.invalid, color: colors.invalid, textDecoration: "line-through" },
    { tag: t.processingInstruction, color: colors.meta },
    { tag: t.contentSeparator, color: colors.punctuation },
    { tag: t.list, color: colors.keyword },
    { tag: t.quote, color: colors.emphasis },
  ]);
}

const darkHighlight = makeHighlightStyle({
  comment: "#6b7280",
  heading: "#10b981",
  emphasis: "#e5e7eb",
  strong: "#ffffff",
  link: "#059669",
  url: "#7dd3fc",
  meta: "#7dd3fc",
  keyword: "#f472b6",
  atom: "#f472b6",
  number: "#fb923c",
  string: "#4ade80",
  variableName: "#e5e7eb",
  definition: "#7dd3fc",
  propertyName: "#7dd3fc",
  operator: "#94a3b8",
  punctuation: "#94a3b8",
  bracket: "#94a3b8",
  tagName: "#f472b6",
  attributeName: "#7dd3fc",
  attributeValue: "#4ade80",
  invalid: "#f87171",
  content: "#e5e7eb",
});

const lightHighlight = makeHighlightStyle({
  comment: "#9ca3af",
  heading: "#059669",
  emphasis: "#1f2937",
  strong: "#1f2937",
  link: "#047857",
  url: "#0369a1",
  meta: "#0369a1",
  keyword: "#db2777",
  atom: "#db2777",
  number: "#ea580c",
  string: "#16a34a",
  variableName: "#1f2937",
  definition: "#0369a1",
  propertyName: "#0369a1",
  operator: "#6b7280",
  punctuation: "#6b7280",
  bracket: "#6b7280",
  tagName: "#db2777",
  attributeName: "#0369a1",
  attributeValue: "#16a34a",
  invalid: "#dc2626",
  content: "#1f2937",
});

export const carmemDark = EditorView.theme(
  {
    "&": {
      backgroundColor: darkColors.background,
      color: darkColors.foreground,
    },
    ".cm-content": { caretColor: darkColors.cursor, padding: "0" },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: darkColors.cursor,
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: darkColors.selection },
    ".cm-activeLine": { backgroundColor: darkColors.activeLine },
    ".cm-gutters": {
      backgroundColor: darkColors.guttersBackground,
      color: darkColors.gutterForeground,
      border: "none",
      borderRight: `1px solid ${darkColors.guttersBorder}`,
    },
    ".cm-activeLineGutter": {
      backgroundColor: darkColors.activeLineGutter,
      color: darkColors.foreground,
    },
    ".cm-lineNumbers .cm-gutterElement": {
      color: darkColors.lineNumberForeground,
      padding: "0 0.75rem 0 0.5rem",
      minWidth: "3rem",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: darkColors.cursor,
    },
    ".cm-tooltip": {
      backgroundColor: darkColors.guttersBackground,
      border: `1px solid ${darkColors.guttersBorder}`,
      borderRadius: "4px",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: darkColors.selection,
      },
    },
    ".cm-matchingBracket": {
      backgroundColor: darkColors.matchingBracket,
      color: "white !important",
      borderRadius: "2px",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(251, 191, 36, 0.3)",
      outline: "1px solid rgba(251, 191, 36, 0.5)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(5, 150, 105, 0.3)",
    },
    ".cm-line.cm-live-heading-1": {
      fontSize: "1.75rem",
      fontWeight: "700",
      lineHeight: "1.3",
      paddingTop: "0.75rem",
      color: "#10b981",
    },
    ".cm-line.cm-live-heading-2": {
      fontSize: "1.45rem",
      fontWeight: "600",
      lineHeight: "1.3",
      paddingTop: "0.5rem",
      color: "#10b981",
    },
    ".cm-line.cm-live-heading-3": {
      fontSize: "1.2rem",
      fontWeight: "600",
      lineHeight: "1.3",
      paddingTop: "0.4rem",
      color: "#10b981",
    },
    ".cm-line.cm-live-heading-4": {
      fontSize: "1.05rem",
      fontWeight: "600",
      color: "#10b981",
    },
    ".cm-line.cm-live-heading-5": {
      fontSize: "0.95rem",
      fontWeight: "600",
      color: "#10b981",
    },
    ".cm-line.cm-live-heading-6": {
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#6b7280",
    },
    ".cm-live-strong": { fontWeight: "bold" },
    ".cm-live-emphasis": { fontStyle: "italic" },
    ".cm-live-strikethrough": { textDecoration: "line-through" },
    ".cm-live-inline-code": {
      backgroundColor: "var(--color-surface)",
      fontFamily:
        'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
      fontSize: "0.85em",
      padding: "0.15em 0.35em",
      borderRadius: "3px",
    },
    ".cm-live-link": {
      color: "#059669",
      textDecoration: "underline",
    },
    ".cm-line.cm-live-blockquote": {
      borderLeft: "3px solid var(--color-accent)",
      paddingLeft: "1rem",
      color: "#6b7280",
    },
    ".cm-line.cm-live-code-block": {
      backgroundColor: "var(--color-surface)",
      fontFamily: "monospace",
      fontSize: "0.875em",
      padding: "0 0.5rem",
    },
    ".cm-line.cm-live-hr": {
      borderBottom: "1px solid var(--color-border)",
    },
    ".cm-vim-panel": {
      backgroundColor: darkColors.guttersBackground,
      color: darkColors.foreground,
      borderTop: `1px solid ${darkColors.guttersBorder}`,
      padding: "2px 8px",
      fontFamily: "monospace",
      fontSize: "0.85rem",
      minHeight: "1.5em",
    },
    ".cm-vim-panel .vim-panel-prompt": {
      color: darkColors.cursor,
      fontWeight: "bold",
    },
    ".cm-vim-panel input": {
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      fontFamily: "inherit",
      fontSize: "inherit",
      color: "inherit",
    },
    ".cm-vim-panel span": {
      color: darkColors.foreground,
    },
  },
  { dark: true }
);

export const carmemLight = EditorView.theme(
  {
    "&": {
      backgroundColor: lightColors.background,
      color: lightColors.foreground,
    },
    ".cm-content": { caretColor: lightColors.cursor, padding: "0" },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: lightColors.cursor,
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: lightColors.selection },
    ".cm-activeLine": { backgroundColor: lightColors.activeLine },
    ".cm-gutters": {
      backgroundColor: lightColors.guttersBackground,
      color: lightColors.gutterForeground,
      border: "none",
      borderRight: `1px solid ${lightColors.guttersBorder}`,
    },
    ".cm-activeLineGutter": {
      backgroundColor: lightColors.activeLineGutter,
      color: lightColors.foreground,
    },
    ".cm-lineNumbers .cm-gutterElement": {
      color: lightColors.lineNumberForeground,
      padding: "0 0.75rem 0 0.5rem",
      minWidth: "3rem",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: lightColors.cursor,
    },
    ".cm-tooltip": {
      backgroundColor: lightColors.guttersBackground,
      border: `1px solid ${lightColors.guttersBorder}`,
      borderRadius: "4px",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: lightColors.selection,
      },
    },
    ".cm-matchingBracket": {
      backgroundColor: lightColors.matchingBracket,
      color: "#047857 !important",
      borderRadius: "2px",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(251, 191, 36, 0.3)",
      outline: "1px solid rgba(251, 191, 36, 0.5)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(5, 150, 105, 0.3)",
    },
    ".cm-line.cm-live-heading-1": {
      fontSize: "1.75rem",
      fontWeight: "700",
      lineHeight: "1.3",
      paddingTop: "0.75rem",
      color: "#059669",
    },
    ".cm-line.cm-live-heading-2": {
      fontSize: "1.45rem",
      fontWeight: "600",
      lineHeight: "1.3",
      paddingTop: "0.5rem",
      color: "#059669",
    },
    ".cm-line.cm-live-heading-3": {
      fontSize: "1.2rem",
      fontWeight: "600",
      lineHeight: "1.3",
      paddingTop: "0.4rem",
      color: "#059669",
    },
    ".cm-line.cm-live-heading-4": {
      fontSize: "1.05rem",
      fontWeight: "600",
      color: "#059669",
    },
    ".cm-line.cm-live-heading-5": {
      fontSize: "0.95rem",
      fontWeight: "600",
      color: "#059669",
    },
    ".cm-line.cm-live-heading-6": {
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#9ca3af",
    },
    ".cm-live-strong": { fontWeight: "bold" },
    ".cm-live-emphasis": { fontStyle: "italic" },
    ".cm-live-strikethrough": { textDecoration: "line-through" },
    ".cm-live-inline-code": {
      backgroundColor: "var(--color-surface)",
      fontFamily:
        'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
      fontSize: "0.85em",
      padding: "0.15em 0.35em",
      borderRadius: "3px",
    },
    ".cm-live-link": {
      color: "#047857",
      textDecoration: "underline",
    },
    ".cm-line.cm-live-blockquote": {
      borderLeft: "3px solid var(--color-accent)",
      paddingLeft: "1rem",
      color: "#9ca3af",
    },
    ".cm-line.cm-live-code-block": {
      backgroundColor: "var(--color-surface)",
      fontFamily: "monospace",
      fontSize: "0.875em",
      padding: "0 0.5rem",
    },
    ".cm-line.cm-live-hr": {
      borderBottom: "1px solid var(--color-border)",
    },
    ".cm-vim-panel": {
      backgroundColor: lightColors.guttersBackground,
      color: lightColors.foreground,
      borderTop: `1px solid ${lightColors.guttersBorder}`,
      padding: "2px 8px",
      fontFamily: "monospace",
      fontSize: "0.85rem",
      minHeight: "1.5em",
    },
    ".cm-vim-panel .vim-panel-prompt": {
      color: lightColors.cursor,
      fontWeight: "bold",
    },
    ".cm-vim-panel input": {
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      fontFamily: "inherit",
      fontSize: "inherit",
      color: "inherit",
    },
    ".cm-vim-panel span": {
      color: lightColors.foreground,
    },
  },
  { dark: false }
);

export const carmemDarkSyntax = syntaxHighlighting(darkHighlight);
export const carmemLightSyntax = syntaxHighlighting(lightHighlight);

export function getTheme(theme: "dark" | "light") {
  return theme === "dark"
    ? [carmemDark, carmemDarkSyntax]
    : [carmemLight, carmemLightSyntax];
}
