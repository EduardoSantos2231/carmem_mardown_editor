import { EditorView } from "@codemirror/view";
import {
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const darkColors = {
  background: "#0f1419",
  foreground: "#e5e7eb",
  selection: "rgba(37, 99, 235, 0.3)",
  cursor: "#2563eb",
  activeLine: "rgba(37, 99, 235, 0.08)",
  activeLineGutter: "#243044",
  guttersBackground: "#1a2332",
  guttersBorder: "#374357",
  gutterForeground: "#6b7280",
  lineNumberForeground: "#6b7280",
  matchingBracket: "rgba(37, 99, 235, 0.4)",
  matchingBracketColor: "white",
};

const lightColors = {
  background: "#fbf9f1",
  foreground: "#1b1c17",
  selection: "rgba(37, 99, 235, 0.2)",
  cursor: "#2563eb",
  activeLine: "rgba(37, 99, 235, 0.05)",
  activeLineGutter: "#eae8e0",
  guttersBackground: "#f5f4ec",
  guttersBorder: "#000000",
  gutterForeground: "#434655",
  lineNumberForeground: "#434655",
  matchingBracket: "rgba(37, 99, 235, 0.3)",
  matchingBracketColor: "#1d4ed8",
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
  heading: "#3b82f6",
  emphasis: "#e5e7eb",
  strong: "#ffffff",
  link: "#2563eb",
  url: "#60a5fa",
  meta: "#60a5fa",
  keyword: "#f472b6",
  atom: "#f472b6",
  number: "#fb923c",
  string: "#4ade80",
  variableName: "#e5e7eb",
  definition: "#60a5fa",
  propertyName: "#60a5fa",
  operator: "#94a3b8",
  punctuation: "#94a3b8",
  bracket: "#94a3b8",
  tagName: "#f472b6",
  attributeName: "#60a5fa",
  attributeValue: "#4ade80",
  invalid: "#f87171",
  content: "#e5e7eb",
});

const lightHighlight = makeHighlightStyle({
  comment: "#434655",
  heading: "#2563eb",
  emphasis: "#1b1c17",
  strong: "#1b1c17",
  link: "#1d4ed8",
  url: "#0369a1",
  meta: "#0369a1",
  keyword: "#db2777",
  atom: "#db2777",
  number: "#ea580c",
  string: "#16a34a",
  variableName: "#1b1c17",
  definition: "#0369a1",
  propertyName: "#0369a1",
  operator: "#737686",
  punctuation: "#737686",
  bracket: "#737686",
  tagName: "#db2777",
  attributeName: "#0369a1",
  attributeValue: "#16a34a",
  invalid: "#dc2626",
  content: "#1b1c17",
});

function buildTheme(c: typeof darkColors, isDark: boolean) {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: c.background,
        color: c.foreground,
      },
      ".cm-content": { caretColor: c.cursor, padding: "0" },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: c.cursor,
        borderLeftWidth: "2px",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: c.selection },
      ".cm-activeLine": { backgroundColor: c.activeLine },
      ".cm-gutters": {
        backgroundColor: c.guttersBackground,
        color: c.gutterForeground,
        border: "none",
        borderRight: `var(--border-width) solid ${c.guttersBorder}`,
      },
      ".cm-activeLineGutter": {
        backgroundColor: c.activeLineGutter,
        color: c.foreground,
      },
      ".cm-lineNumbers .cm-gutterElement": {
        color: c.lineNumberForeground,
        padding: "0 0.75rem 0 0.5rem",
        minWidth: "3rem",
        fontFamily: '"JetBrains Mono", monospace',
      },
      ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: c.cursor,
      },
      ".cm-tooltip": {
        backgroundColor: c.guttersBackground,
        border: `1px solid ${c.guttersBorder}`,
        borderRadius: "4px",
      },
      ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
          backgroundColor: c.selection,
        },
      },
      ".cm-matchingBracket": {
        backgroundColor: c.matchingBracket,
        color: `${c.matchingBracketColor} !important`,
        borderRadius: "2px",
      },
      ".cm-searchMatch": {
        backgroundColor: "rgba(251, 191, 36, 0.3)",
        outline: "1px solid rgba(251, 191, 36, 0.5)",
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "rgba(5, 150, 105, 0.3)",
      },
    },
    { dark: isDark }
  );
}

export const carmemDark = buildTheme(darkColors, true);
export const carmemLight = buildTheme(lightColors, false);

export const carmemDarkSyntax = syntaxHighlighting(darkHighlight);
export const carmemLightSyntax = syntaxHighlighting(lightHighlight);

export function getTheme(theme: "dark" | "light") {
  return theme === "dark"
    ? [carmemDark, carmemDarkSyntax]
    : [carmemLight, carmemLightSyntax];
}
