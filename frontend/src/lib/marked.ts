import { marked, Renderer } from "marked";
import katexExtension from "marked-katex-extension";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const renderer = new Renderer();
renderer.link = function ({ href, title, text }) {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.use(
  katexExtension({ throwOnError: false }),
  markedHighlight({
    langPrefix: "hljs language-",
    highlight: (code: string, lang: string) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  }),
  {
    breaks: true,
    gfm: true,
    renderer,
  }
);

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}
