import { useAppStore } from "@/store/useAppStore";
import * as go from "../../wailsjs/go/main/App";

const AUTOSAVE_DELAY = 2000;
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

async function performSave() {
  const store = useAppStore.getState();
  if (!store.currentFilePath) return;
  store.setIsSaving(true);
  store.setSaveStatus("saving");
  try {
    const content = store.editor?.state.doc.toString() || "";
    await go.WriteFile(store.currentFilePath, content);
    store.setHasUnsavedChanges(false);
    store.setSaveStatus("saved");
  } catch (err) {
    console.error("Error saving file:", err);
    store.setSaveStatus("unsaved");
  } finally {
    store.setIsSaving(false);
  }
}

function debouncedSave() {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(performSave, AUTOSAVE_DELAY);
}

export function markUnsaved() {
  const store = useAppStore.getState();
  if (!store.currentFilePath || store.isSaving) return;
  store.setHasUnsavedChanges(true);
  store.setSaveStatus("unsaved");
  debouncedSave();
}

export function saveNow() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  performSave();
}

export function clearAutosaveStatus() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  useAppStore.getState().setHasUnsavedChanges(false);
  useAppStore.getState().setIsSaving(false);
  useAppStore.getState().setSaveStatus("hidden");
}

export function initAutosaveStatus() {
  useAppStore.getState().setSaveStatus("hidden");
}
