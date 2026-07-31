import {
  BlockContext,
  LeafBlock,
  LeafBlockParser,
  Line,
  MarkdownConfig,
} from "@lezer/markdown";

const blockDelimiter = /^\s*\$\$\s*$/;

class MathBlockParser implements LeafBlockParser {
  nextLine(cx: BlockContext, line: Line, leaf: LeafBlock) {
    if (!blockDelimiter.test(line.text.slice(line.pos))) return false;

    cx.nextLine();
    cx.addLeafElement(
      leaf,
      cx.elt("MathBlock", leaf.start, cx.prevLineEnd())
    );
    return true;
  }

  finish() {
    return false;
  }
}

export const mathExtension: MarkdownConfig = {
  defineNodes: [{ name: "MathBlock", block: true }, "InlineMath"],
  parseBlock: [
    {
      name: "MathBlock",
      leaf(_cx, leaf) {
        return blockDelimiter.test(leaf.content)
          ? new MathBlockParser()
          : null;
      },
      endLeaf(_cx, line, leaf) {
        const firstLine = leaf.content.split(/\r?\n/, 1)[0];
        return !blockDelimiter.test(firstLine) && blockDelimiter.test(line.text.slice(line.pos));
      },
    },
  ],
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
