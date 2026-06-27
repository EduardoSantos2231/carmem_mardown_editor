import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { useAppStore } from "@/store/useAppStore";

let hideTimer: ReturnType<typeof setTimeout> | null = null;

function showToolbar(view: EditorView) {
  const sel = view.state.selection.main;
  if (sel.empty) return;

  const coords = view.coordsAtPos(sel.head);
  if (!coords) return;

  const editorEl = view.dom.closest("#editor");
  if (!editorEl) return;
  const editorRect = editorEl.getBoundingClientRect();

  const top = coords.top - editorRect.top - 56;
  const left = coords.left - editorRect.left;

  useAppStore.getState().setFloatingToolbar({ visible: true, top, left });
}

function hideToolbar() {
  useAppStore.getState().setFloatingToolbar({ visible: false, top: 0, left: 0 });
}

function debouncedHide() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(hideToolbar, 150);
}

function cancelHide() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

export const floatingToolbarPlugin = ViewPlugin.fromClass(
  class {
    constructor(view: EditorView) {
      view.dom.addEventListener("mouseup", () => {
        setTimeout(() => showToolbar(view), 50);
      });
      view.dom.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Escape") hideToolbar();
      });
      view.dom.addEventListener("blur", () => debouncedHide());
    }

    update(update: ViewUpdate) {
      if (update.selectionSet) {
        const sel = update.view.state.selection.main;
        if (sel.empty) {
          debouncedHide();
        } else {
          cancelHide();
          showToolbar(update.view);
        }
      }
    }

    destroy() {
      hideToolbar();
    }
  }
);
