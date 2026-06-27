import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { loadFileTree } from "@/components/Sidebar";
import { initResizers, loadPanelSizes } from "@/hooks/usePanelResize";
import { loadZoomLevel, applyZoom } from "@/hooks/useZoom";
import { initSidebar } from "@/components/Sidebar";
import { initAutosaveStatus } from "@/hooks/useAutosave";
import { setupKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Sidebar from "@/components/Sidebar";
import SidebarResizer from "@/components/Resizer";
import Toolbar from "@/components/Toolbar";
import EditorContainer from "@/components/EditorContainer";
import StatusBar from "@/components/StatusBar";
import Modal from "@/components/ui/Modal";
import * as go from "../wailsjs/go/main/App";

let initialized = false;

export default function App() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    init();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <SidebarResizer />
      <div
        id="main"
        className="flex flex-1 flex-col min-w-0"
      >
        <Toolbar />
        <EditorContainer />
        <StatusBar />
      </div>
      <Modal />
    </div>
  );
}

async function init() {
  try {
    const store = useAppStore.getState();
    initSidebar();
    loadZoomLevel();

    const config = await go.GetConfig();
    store.setConfig({
      theme: config.theme as "dark" | "light",
      documents: config.documents,
    });

    document.body.className = config.theme;
    await loadFileTree();
    initAutosaveStatus();
    setupKeyboardShortcuts();

    initResizers();
    loadPanelSizes();
    applyZoom();
  } catch (err) {
    console.error("Init error:", err);
  }
}

export { markUnsaved } from "@/hooks/useAutosave";
