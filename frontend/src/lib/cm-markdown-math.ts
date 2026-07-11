import { MarkdownConfig } from "@lezer/markdown";

export const mathExtension: MarkdownConfig = {
  defineNodes: ["InlineMath"],
  parseInline: [
    {
      name: "InlineMath",
      parse(cx, next, pos) {
        if (next !== 36) return -1;
        if (cx.slice(pos + 1, pos + 2) === "$") return -1;
        if (cx.slice(pos - 1, pos) === "\\") return -1;
        let end = pos + 1;
        while (end < cx.end && cx.slice(end, end + 1) !== "$") end++;
        if (end >= cx.end || cx.slice(end, end + 1) !== "$" || cx.slice(end - 1, end) === "\\") return -1;
        return cx.addElement(cx.elt("InlineMath", pos, end + 1));
      },
    },
  ],
};
