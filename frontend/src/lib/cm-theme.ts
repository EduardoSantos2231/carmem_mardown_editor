import { EditorView } from "@codemirror/view";
import {
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const darkColors = {
  background: "#13131b",
  foreground: "#e4e1ed",
  selection: "rgba(128, 131, 255, 0.3)",
  cursor: "#8083ff",
  activeLine: "rgba(128, 131, 255, 0.06)",
  activeLineGutter: "rgba(128, 131, 255, 0.08)",
  guttersBackground: "transparent",
  guttersBorder: "rgba(255,255,255,0.08)",
  gutterForeground: "#908fa0",
  lineNumberForeground: "#908fa0",
  matchingBracket: "rgba(128, 131, 255, 0.4)",
  matchingBracketColor: "white",
};

const lightColors = {
  background: "#ffffff",
  foreground: "#1f2937",
  selection: "rgba(99, 102, 241, 0.2)",
  cursor: "#6366f1",
  activeLine: "rgba(99, 102, 241, 0.05)",
  activeLineGutter: "#e8f0ec",
  guttersBackground: "#f3f7f5",
  guttersBorder: "#d1d9e0",
  gutterForeground: "#9ca3af",
  lineNumberForeground: "#9ca3af",
  matchingBracket: "rgba(99, 102, 241, 0.3)",
  matchingBracketColor: "#4338ca",
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
  heading: "#a5a7ff",
  emphasis: "#e4e1ed",
  strong: "#ffffff",
  link: "#8083ff",
  url: "#a5a7ff",
  meta: "#a5a7ff",
  keyword: "#ffb0cd",
  atom: "#ffb0cd",
  number: "#ffb783",
  string: "#6ee7b7",
  variableName: "#e4e1ed",
  definition: "#a5a7ff",
  propertyName: "#a5a7ff",
  operator: "#908fa0",
  punctuation: "#908fa0",
  bracket: "#908fa0",
  tagName: "#ffb0cd",
  attributeName: "#a5a7ff",
  attributeValue: "#6ee7b7",
  invalid: "#f87171",
  content: "#e4e1ed",
});

const lightHighlight = makeHighlightStyle({
  comment: "#9ca3af",
  heading: "#6366f1",
  emphasis: "#1f2937",
  strong: "#1f2937",
  link: "#4338ca",
  url: "#6366f1",
  meta: "#6366f1",
  keyword: "#db2777",
  atom: "#db2777",
  number: "#ea580c",
  string: "#16a34a",
  variableName: "#1f2937",
  definition: "#6366f1",
  propertyName: "#6366f1",
  operator: "#6b7280",
  punctuation: "#6b7280",
  bracket: "#6b7280",
  tagName: "#db2777",
  attributeName: "#6366f1",
  attributeValue: "#16a34a",
  invalid: "#dc2626",
  content: "#1f2937",
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
        backgroundColor: "rgba(128, 131, 255, 0.3)",
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
