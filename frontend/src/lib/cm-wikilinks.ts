import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { useAppStore } from "@/store/useAppStore";
import { showConfirm } from "@/components/ui/Modal";
import { initCodeMirror } from "@/components/CodeMirrorEditor";
import { clearAutosaveStatus } from "@/hooks/useAutosave";
import { loadFileTree } from "@/components/Sidebar";
import * as go from "../../wailsjs/go/main/App";
import "./wikilink.css";

const wikiRegex = /\[\[([^\]]+)\]\]/g;

function buildDecorations(view: EditorView): DecorationSet {
  const decorations: { from: number; to: number; value: Decoration }[] = [];
  const doc = view.state.doc;

  for (const { from, to } of view.visibleRanges) {
    const text = doc.sliceString(from, to);
    let match: RegExpExecArray | null;

    wikiRegex.lastIndex = 0;
    while ((match = wikiRegex.exec(text)) !== null) {
      const start = from + match.index;
      const end = start + match[0].length;
      decorations.push({
        from: start,
        to: end,
        value: Decoration.mark({ class: "cm-wikilink" }),
      });
    }
  }

  return Decoration.set(decorations, true);
}

async function handleWikiClick(view: EditorView, pos: number) {
  const doc = view.state.doc;
  const line = doc.lineAt(pos);
  const lineText = line.text;

  wikiRegex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = wikiRegex.exec(lineText)) !== null) {
    const start = line.from + match.index;
    const end = start + match[0].length;
    if (pos >= start && pos <= end) {
      const raw = match[1];
      const parts = raw.split("|");
      const linkName = parts[0].trim();
      const store = useAppStore.getState();
      const currentPath = store.currentFilePath || store.config?.documents || "";

      const resolved = await go.ResolveLink(linkName, currentPath);
      if (resolved) {
        const content = await go.ReadFile(resolved);
        const name = resolved.split("/").pop() || linkName;
        store.setCurrentFile(resolved, name);
        clearAutosaveStatus();
        store.setSaveStatus("saved");
        store.setEditorLocked(false);
        store.setPreviewVisible(false);
        initCodeMirror(content);
        await loadFileTree();
        view.focus();
      } else {
        const parentDir = currentPath ? currentPath.substring(0, currentPath.lastIndexOf("/")) : store.config?.documents || "";
        const fileName = linkName.endsWith(".md") ? linkName : linkName + ".md";
        showConfirm(
          "Criar nota",
          `Deseja criar "${fileName}"?`,
          async () => {
            await go.CreateFile(fileName, parentDir);
            const createdPath = parentDir ? parentDir + "/" + fileName : fileName;
            store.setCurrentFile(createdPath, fileName);
            clearAutosaveStatus();
            store.setSaveStatus("saved");
            store.setEditorLocked(false);
            store.setPreviewVisible(false);
            initCodeMirror("");
            await loadFileTree();
          }
        );
      }
      break;
    }
  }
}

export const wikiLinkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    private mousedownHandler: (e: MouseEvent) => void;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);

      this.mousedownHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(".cm-wikilink")) {
          const pos = view.posAtDOM(target);
          if (pos !== null) {
            e.preventDefault();
            e.stopPropagation();
            handleWikiClick(view, pos);
          }
        }
      };

      view.dom.addEventListener("mousedown", this.mousedownHandler);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }

    destroy() {
      // ponytail: cleanup on editor destroy
    }
  },
  { decorations: (v) => v.decorations, eventHandlers: {} }
);
