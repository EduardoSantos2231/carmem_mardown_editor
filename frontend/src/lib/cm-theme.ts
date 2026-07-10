import { EditorView } from "@codemirror/view";
import {
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const darkHighlight = HighlightStyle.define([
  { tag: t.heading, color: "#a5a7ff", fontWeight: "bold" },
  { tag: t.heading1, color: "#a5a7ff", fontWeight: "bold" },
  { tag: t.heading2, color: "#a5a7ff", fontWeight: "bold" },
  { tag: t.heading3, color: "#a5a7ff", fontWeight: "bold" },
  { tag: t.heading4, color: "#a5a7ff", fontWeight: "bold" },
  { tag: t.heading5, color: "#a5a7ff", fontWeight: "bold" },
  { tag: t.heading6, color: "#8a8070", fontWeight: "bold" },
  { tag: t.emphasis, color: "#e8dcc8", fontStyle: "italic" },
  { tag: t.strong, color: "#ffffff", fontWeight: "bold" },
  { tag: t.strikethrough, color: "#8a8070", textDecoration: "line-through" },
  { tag: t.link, color: "#0055ff", textDecoration: "underline" },
  { tag: t.url, color: "#1a6eff" },
  { tag: t.monospace, color: "#8a8070" },
  { tag: t.comment, color: "#6b6255", fontStyle: "italic" },
  { tag: t.processingInstruction, color: "#6b6255" },
  { tag: t.content, color: "#e8dcc8" },
  { tag: t.keyword, color: "#ffb0cd" },
  { tag: t.atom, color: "#ffb0cd" },
  { tag: t.bool, color: "#ffb0cd" },
  { tag: t.null, color: "#ffb0cd" },
  { tag: t.number, color: "#ffb783" },
  { tag: t.integer, color: "#ffb783" },
  { tag: t.float, color: "#ffb783" },
  { tag: t.string, color: "#6ee7b7" },
  { tag: t.literal, color: "#6ee7b7" },
  { tag: t.inserted, color: "#6ee7b7" },
  { tag: t.variableName, color: "#e8dcc8" },
  { tag: t.definition(t.variableName), color: "#a5a7ff" },
  { tag: t.local(t.variableName), color: "#e8dcc8" },
  { tag: t.propertyName, color: "#a5a7ff" },
  { tag: t.definition(t.propertyName), color: "#a5a7ff" },
  { tag: t.operator, color: "#8a8070" },
  { tag: t.arithmeticOperator, color: "#8a8070" },
  { tag: t.logicOperator, color: "#8a8070" },
  { tag: t.bitwiseOperator, color: "#8a8070" },
  { tag: t.compareOperator, color: "#8a8070" },
  { tag: t.punctuation, color: "#8a8070" },
  { tag: t.separator, color: "#8a8070" },
  { tag: t.bracket, color: "#8a8070" },
  { tag: t.angleBracket, color: "#8a8070" },
  { tag: t.squareBracket, color: "#8a8070" },
  { tag: t.paren, color: "#8a8070" },
  { tag: t.brace, color: "#8a8070" },
  { tag: t.tagName, color: "#ffb0cd" },
  { tag: t.attributeName, color: "#a5a7ff" },
  { tag: t.attributeValue, color: "#6ee7b7" },
  { tag: t.invalid, color: "#dc2626", textDecoration: "line-through" },
  { tag: t.contentSeparator, color: "#8a8070" },
  { tag: t.list, color: "#ffb0cd" },
  { tag: t.quote, color: "#8a8070" },
  { tag: t.meta, color: "#a5a7ff" },
]);

const lightHighlight = HighlightStyle.define([
  { tag: t.heading, color: "#0055ff", fontWeight: "bold" },
  { tag: t.heading1, color: "#0055ff", fontWeight: "bold" },
  { tag: t.heading2, color: "#0055ff", fontWeight: "bold" },
  { tag: t.heading3, color: "#0055ff", fontWeight: "bold" },
  { tag: t.heading4, color: "#0055ff", fontWeight: "bold" },
  { tag: t.heading5, color: "#0055ff", fontWeight: "bold" },
  { tag: t.heading6, color: "#6b6255", fontWeight: "bold" },
  { tag: t.emphasis, color: "#1a1a1a", fontStyle: "italic" },
  { tag: t.strong, color: "#000000", fontWeight: "bold" },
  { tag: t.strikethrough, color: "#6b6255", textDecoration: "line-through" },
  { tag: t.link, color: "#0055ff", textDecoration: "underline" },
  { tag: t.url, color: "#0033aa" },
  { tag: t.monospace, color: "#6b6255" },
  { tag: t.comment, color: "#9ca3af", fontStyle: "italic" },
  { tag: t.processingInstruction, color: "#9ca3af" },
  { tag: t.content, color: "#1a1a1a" },
  { tag: t.keyword, color: "#db2777" },
  { tag: t.atom, color: "#db2777" },
  { tag: t.bool, color: "#db2777" },
  { tag: t.null, color: "#db2777" },
  { tag: t.number, color: "#ea580c" },
  { tag: t.integer, color: "#ea580c" },
  { tag: t.float, color: "#ea580c" },
  { tag: t.string, color: "#16a34a" },
  { tag: t.literal, color: "#16a34a" },
  { tag: t.inserted, color: "#16a34a" },
  { tag: t.variableName, color: "#1a1a1a" },
  { tag: t.definition(t.variableName), color: "#0055ff" },
  { tag: t.local(t.variableName), color: "#1a1a1a" },
  { tag: t.propertyName, color: "#0055ff" },
  { tag: t.definition(t.propertyName), color: "#0055ff" },
  { tag: t.operator, color: "#6b6255" },
  { tag: t.arithmeticOperator, color: "#6b6255" },
  { tag: t.logicOperator, color: "#6b6255" },
  { tag: t.bitwiseOperator, color: "#6b6255" },
  { tag: t.compareOperator, color: "#6b6255" },
  { tag: t.punctuation, color: "#6b6255" },
  { tag: t.separator, color: "#6b6255" },
  { tag: t.bracket, color: "#6b6255" },
  { tag: t.angleBracket, color: "#6b6255" },
  { tag: t.squareBracket, color: "#6b6255" },
  { tag: t.paren, color: "#6b6255" },
  { tag: t.brace, color: "#6b6255" },
  { tag: t.tagName, color: "#db2777" },
  { tag: t.attributeName, color: "#0055ff" },
  { tag: t.attributeValue, color: "#16a34a" },
  { tag: t.invalid, color: "#dc2626", textDecoration: "line-through" },
  { tag: t.contentSeparator, color: "#6b6255" },
  { tag: t.list, color: "#db2777" },
  { tag: t.quote, color: "#6b6255" },
  { tag: t.meta, color: "#0055ff" },
]);

function buildTheme(isDark: boolean) {
  return EditorView.theme(
    {
      "&": { backgroundColor: "transparent", color: isDark ? "#e8dcc8" : "#1a1a1a" },
      ".cm-content": { caretColor: "#0055ff", padding: "0" },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#0055ff",
        borderLeftWidth: "3px",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: "rgba(0, 85, 255, 0.2)" },
      ".cm-activeLine": { backgroundColor: "rgba(0, 85, 255, 0.05)" },
      ".cm-gutters": {
        backgroundColor: "transparent",
        color: isDark ? "#8a8070" : "#6b6255",
        border: "none",
        borderRight: isDark ? "3px solid #000000" : "3px solid #1a1a1a",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "rgba(0, 85, 255, 0.08)",
        color: isDark ? "#e8dcc8" : "#1a1a1a",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        color: isDark ? "#8a8070" : "#6b6255",
        padding: "0 0.75rem 0 0.5rem",
        minWidth: "3rem",
        fontFamily: '"JetBrains Mono", monospace',
      },
      ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: "#0055ff",
      },
      ".cm-tooltip": {
        backgroundColor: isDark ? "#222222" : "#ffffff",
        border: isDark ? "3px solid #000000" : "3px solid #1a1a1a",
        boxShadow: isDark ? "4px 4px 0 #000000" : "4px 4px 0 #1a1a1a",
      },
      ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
          backgroundColor: "#0055ff",
          color: "#ffffff",
        },
      },
      ".cm-matchingBracket": {
        backgroundColor: "rgba(0, 85, 255, 0.3)",
        outline: "2px solid #0055ff",
      },
      ".cm-searchMatch": {
        backgroundColor: "rgba(245, 158, 11, 0.3)",
        outline: "2px solid rgba(245, 158, 11, 0.5)",
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "rgba(0, 85, 255, 0.3)",
      },
    },
    { dark: isDark }
  );
}

export const carmemDark = buildTheme(true);
export const carmemLight = buildTheme(false);
export const carmemDarkSyntax = syntaxHighlighting(darkHighlight);
export const carmemLightSyntax = syntaxHighlighting(lightHighlight);

export function getTheme(theme: "dark" | "light") {
  return theme === "dark"
    ? [carmemDark, carmemDarkSyntax]
    : [carmemLight, carmemLightSyntax];
}
