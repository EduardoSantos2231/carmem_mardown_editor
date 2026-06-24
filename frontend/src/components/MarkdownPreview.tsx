import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { renderMarkdown } from "@/lib/marked";
import { updateEditorPreviewLayout } from "@/hooks/usePanelResize";
import { saveNow } from "@/hooks/useAutosave";

export async function toggleReadMode() {
  const store = useAppStore.getState();
  if (!store.currentFilePath) return;

  const next = !store.isReadMode;
  if (next) {
    await saveNow();
    store.setPreviewVisible(true);
    store.setReadMode(true);
  } else {
    store.setReadMode(false);
  }
  updateEditorPreviewLayout();
  updatePreview();
}

export function updatePreview() {
  const store = useAppStore.getState();
  if (!store.isPreviewVisible) return;
  const el = document.getElementById("preview");
  if (!el) return;
  const content = store.editor?.state.doc.toString() || "";
  el.innerHTML = renderMarkdown(content);
}

export function togglePreview() {
  const store = useAppStore.getState();
  if (!store.currentFilePath) return;
  const newVisible = !store.isPreviewVisible;
  store.setPreviewVisible(newVisible);
  updateEditorPreviewLayout();
  if (newVisible) updatePreview();
}

export default function MarkdownPreview() {
  const isVisible = useAppStore((s) => s.isPreviewVisible);
  const editor = useAppStore((s) => s.editor);
  const prevContent = useRef("");

  useEffect(() => {
    if (!isVisible || !editor) return;
    const content = editor.state.doc.toString();
    if (content !== prevContent.current) {
      prevContent.current = content;
      const el = document.getElementById("preview");
      if (el) el.innerHTML = renderMarkdown(content);
    }
  }, [isVisible, editor]);

  return (
    <div
      id="preview"
      className={`overflow-y-auto ${isVisible ? "flex-1" : "hidden"}`}
    />
  );
}
