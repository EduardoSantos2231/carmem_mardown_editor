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

export function cancelHide() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

export const floatingToolbarPlugin = ViewPlugin.fromClass(
  class {
    private view: EditorView;
    private mouseupHandler: () => void;
    private keydownHandler: (e: KeyboardEvent) => void;
    private blurHandler: () => void;

    constructor(view: EditorView) {
      this.view = view;

      this.mouseupHandler = () => {
        setTimeout(() => showToolbar(view), 50);
      };
      this.keydownHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape") hideToolbar();
      };
      // ponytail: defer blur check so floating-toolbar mousedown can cancel it
      this.blurHandler = () => {
        setTimeout(() => {
          if (document.activeElement?.closest("#floating-toolbar")) return;
          debouncedHide();
        }, 100);
      };

      view.dom.addEventListener("mouseup", this.mouseupHandler);
      view.dom.addEventListener("keydown", this.keydownHandler);
      view.dom.addEventListener("blur", this.blurHandler);
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
      this.view.dom.removeEventListener("mouseup", this.mouseupHandler);
      this.view.dom.removeEventListener("keydown", this.keydownHandler);
      this.view.dom.removeEventListener("blur", this.blurHandler);
    }
  }
);
