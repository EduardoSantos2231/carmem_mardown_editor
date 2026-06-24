import { create } from "zustand";
import type { AppConfig, FileNode, SaveStatus } from "@/types";
import { EditorView } from "@codemirror/view";

interface AppState {
  editor: EditorView | null;
  currentFilePath: string | null;
  currentFileName: string | null;
  isEditorLocked: boolean;
  isReadMode: boolean;
  isPreviewVisible: boolean;
  theme: "dark" | "light";
  saveStatus: SaveStatus;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  selectedPath: string | null;
  fileTree: FileNode[];
  config: AppConfig | null;
  zoomLevel: number;
  sidebarVisible: boolean;

  setEditor: (editor: EditorView | null) => void;
  setCurrentFile: (path: string | null, name: string | null) => void;
  clearCurrentFile: () => void;
  setTheme: (theme: "dark" | "light") => void;
  setPreviewVisible: (visible: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setSelectedPath: (path: string | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  setConfig: (config: AppConfig) => void;
  setZoomLevel: (zoom: number) => void;
  setSidebarVisible: (visible: boolean) => void;
  setEditorLocked: (locked: boolean) => void;
  setReadMode: (readMode: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  editor: null,
  currentFilePath: null,
  currentFileName: null,
  isEditorLocked: true,
  isReadMode: false,
  isPreviewVisible: false,
  theme: "dark",
  saveStatus: "hidden",
  hasUnsavedChanges: false,
  isSaving: false,
  selectedPath: null,
  fileTree: [],
  config: null,
  zoomLevel: 1,
  sidebarVisible: true,

  setEditor: (editor) => set({ editor }),
  setCurrentFile: (path, name) =>
    set({ currentFilePath: path, currentFileName: name }),
  clearCurrentFile: () =>
    set({ currentFilePath: null, currentFileName: null }),
  setTheme: (theme) => set({ theme }),
  setPreviewVisible: (visible) => set({ isPreviewVisible: visible }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
  setIsSaving: (value) => set({ isSaving: value }),
  setSelectedPath: (path) => set({ selectedPath: path }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setConfig: (config) => set({ config, theme: config.theme as "dark" | "light" }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setEditorLocked: (locked) => set({ isEditorLocked: locked }),
  setReadMode: (readMode) => set({ isReadMode: readMode }),
}));
