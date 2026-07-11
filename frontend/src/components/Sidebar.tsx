import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useAppStore } from "@/store/useAppStore";
import { showModal, showConfirm } from "@/components/ui/Modal";
import * as go from "../../wailsjs/go/main/App";
import type { FileNode } from "@/types";
import { clearAutosaveStatus } from "@/hooks/useAutosave";
import { initCodeMirror } from "@/components/CodeMirrorEditor";

const SIDEBAR_STORAGE_KEY = "carmem-sidebar-visible";

export function initSidebar() {
  const visible = localStorage.getItem(SIDEBAR_STORAGE_KEY) !== "false";
  useAppStore.getState().setSidebarVisible(visible);
}

export default function Sidebar() {
  const visible = useAppStore((s) => s.sidebarVisible);
  const toggle = () => {
    const next = !visible;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    useAppStore.getState().setSidebarVisible(next);
  };

  return (
    <>
      <aside
        id="sidebar"
        className="flex flex-col flex-shrink-0 panel"
        style={{ display: visible ? "flex" : "none", width: "250px", boxShadow: "none" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "var(--border-width) solid var(--color-border)", fontWeight: 700 }}
        >
          <span className="font-bold text-lg">Carmem</span>
          <button
            onClick={toggle}
            className="btn-press p-1.5"
            title="Alternar barra lateral"
            style={{ border: "var(--border-width) solid var(--color-border)", color: "var(--color-ink)", boxShadow: "var(--shadow-sm)" }}
          >
            <Icon name="panel-left" size={18} />
          </button>
        </div>
        <SidebarActions />
        <FileTree />
      </aside>
      <button
        id="btn-panel-left"
        onClick={toggle}
        className="fixed left-2 top-2 z-40 btn-press panel p-1.5"
        title="Alternar barra lateral"
        style={{ display: visible ? "none" : "flex", color: "var(--color-ink)" }}
      >
        <Icon name="panel-left" size={18} />
      </button>
    </>
  );
}

function SidebarActions() {
  const selectedPath = useAppStore((s) => s.selectedPath);

  const getParentPathForSelection = () => {
    if (!selectedPath) return useAppStore.getState().config?.documents || "";
    const el = document.querySelector(`[data-path="${selectedPath}"]`);
    if (el?.classList.contains("directory")) return selectedPath;
    const parts = selectedPath.split("/");
    parts.pop();
    return parts.join("/") || useAppStore.getState().config?.documents || "";
  };

  const createFile = async () => {
    const parentPath = getParentPathForSelection();
    showModal("Novo Arquivo", "nome-do-arquivo.md", async (name: string) => {
      await go.CreateFile(name, parentPath);
      await loadFileTree();
    });
  };

  const createFolder = async () => {
    const parentPath = getParentPathForSelection();
    showModal("Nova Pasta", "nome da pasta", async (name: string) => {
      await go.CreateFolder(name, parentPath);
      await loadFileTree();
    });
  };

  const deleteSelected = () => {
    if (!selectedPath) return;
    const el = document.querySelector(`[data-path="${selectedPath}"]`);
    const name = el?.querySelector(".name")?.textContent || "este item";
    showConfirm(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir "${name}"?`,
      async () => {
        await go.Delete(selectedPath);
        useAppStore.getState().setSelectedPath(null);
        useAppStore.getState().clearCurrentFile();
        useAppStore.getState().setEditorLocked(true);
        useAppStore.getState().setPreviewVisible(false);
        clearAutosaveStatus();
        await loadFileTree();
      },
      null,
      true
    );
  };

  const renameSelected = () => {
    if (!selectedPath) return;
    const el = document.querySelector(`[data-path="${selectedPath}"]`);
    const currentName = el?.querySelector(".name")?.textContent || "";
    showModal("Renomear", currentName, async (newName: string) => {
      await go.Rename(selectedPath, newName);
      useAppStore.getState().setSelectedPath(null);
      useAppStore.getState().clearCurrentFile();
      useAppStore.getState().setEditorLocked(true);
      useAppStore.getState().setPreviewVisible(false);
      clearAutosaveStatus();
      await loadFileTree();
    }, currentName);
  };

  return (
    <div
      className="flex gap-1.5 px-3 py-2 shrink-0 justify-center"
      style={{ borderBottom: "var(--border-width) solid var(--color-border)" }}
    >
      <button onClick={createFile} className="btn-press p-2" title="Novo arquivo" style={{ border: "var(--border-width) solid var(--color-border)", color: "var(--color-ink)", boxShadow: "var(--shadow-sm)" }}>
        <Icon name="file-plus" size={16} />
      </button>
      <button onClick={createFolder} className="btn-press p-2" title="Nova pasta" style={{ border: "var(--border-width) solid var(--color-border)", color: "var(--color-ink)", boxShadow: "var(--shadow-sm)" }}>
        <Icon name="folder-plus" size={16} />
      </button>
      <button onClick={deleteSelected} className="btn-press p-2" title="Excluir item selecionado" style={{ border: "var(--border-width) solid var(--color-border)", color: "var(--color-ink)", boxShadow: "var(--shadow-sm)" }}>
        <Icon name="trash-2" size={16} />
      </button>
      <button onClick={renameSelected} className="btn-press p-2" title="Renomear item selecionado" style={{ border: "var(--border-width) solid var(--color-border)", color: "var(--color-ink)", boxShadow: "var(--shadow-sm)" }}>
        <Icon name="edit-3" size={16} />
      </button>
    </div>
  );
}

export async function loadFileTree() {
  try {
    const tree = await go.GetFileTree();
    useAppStore.getState().setFileTree(tree || []);
  } catch (err) {
    console.error("Error loading file tree:", err);
  }
}

function FileTree() {
  const fileTree = useAppStore((s) => s.fileTree);

  return (
    <div id="file-tree" className="flex-1 overflow-y-auto py-1">
      {fileTree.map((node) => (
        <FileTreeItem key={node.path} node={node} depth={0} />
      ))}
    </div>
  );
}

function FileTreeItem({ node, depth }: { node: FileNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const selectedPath = useAppStore((s) => s.selectedPath);
  const isSelected = selectedPath === node.path;

  const handleClick = async () => {
    useAppStore.getState().setSelectedPath(node.path);
    if (node.isDir) {
      setExpanded((prev) => !prev);
      return;
    }

    if (!node.name.endsWith(".md")) return;

    try {
      const content = await go.ReadFile(node.path);
      useAppStore.getState().setCurrentFile(node.path, node.name);
      clearAutosaveStatus();
      useAppStore.getState().setSaveStatus("saved");

      useAppStore.getState().setEditorLocked(false);
      initCodeMirror(content);

    } catch (err) {
      console.error("Error reading file:", err);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    (window as any).draggedItemPath = node.path;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", node.path);
    setTimeout(() => {
      const el = document.querySelector(`[data-path="${node.path}"]`);
      el?.classList.add("dragging");
    }, 0);
  };

  const handleDragEnd = () => {
    (window as any).draggedItemPath = null;
    document.querySelectorAll(".file-item.dragging").forEach((el) => el.classList.remove("dragging"));
    document.querySelectorAll(".file-item.drag-over").forEach((el) => el.classList.remove("drag-over"));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = document.querySelector(`[data-path="${node.path}"]`);
    el?.classList.remove("drag-over");
    const draggedPath = (window as any).draggedItemPath;
    if (!draggedPath || draggedPath === node.path) return;
    const draggedItem = document.querySelector(`[data-path="${draggedPath}"]`);
    if (draggedItem?.getAttribute("data-is-dir") === "true" && draggedPath.startsWith(node.path + "/")) return;
    try {
      await go.MoveFile(draggedPath, node.path);
      if (useAppStore.getState().currentFilePath === draggedPath) {
        useAppStore.getState().clearCurrentFile();
        useAppStore.getState().setEditorLocked(true);
        useAppStore.getState().setPreviewVisible(false);
      }
      await loadFileTree();
    } catch (err) {
      console.error("Error moving file:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!node.isDir) return;
    e.preventDefault();
    e.stopPropagation();
    const draggedPath = (window as any).draggedItemPath;
    if (draggedPath && draggedPath !== node.path) {
      const el = document.querySelector(`[data-path="${node.path}"]`);
      el?.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector(`[data-path="${node.path}"]`)?.classList.remove("drag-over");
  };

  return (
    <div>
      <div
        data-path={node.path}
        data-is-dir={node.isDir}
        className={`file-item flex items-center gap-1.5 px-2 py-1 select-none text-sm ${
          isSelected ? "" : "hover:bg-[var(--color-selected)]"
        } ${!node.isDir && !node.name.endsWith(".md") ? "opacity-40" : "cursor-pointer"}`}
        style={{
          paddingLeft: `${8 + depth * 16}px`,
          ...(isSelected
            ? {
                backgroundColor: "var(--color-selected)",
                color: "var(--color-accent)",
                borderLeft: "4px solid var(--color-accent)",
                paddingLeft: `${8 + depth * 16 - 4}px`,
              }
            : {}),
        }}
        draggable
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {node.isDir && (
          <Icon
            name="chevron-right"
            size={14}
            className="shrink-0"
            style={{
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              color: isSelected ? "var(--color-accent)" : "var(--color-ink-muted)",
            }}
          />
        )}
        {node.isDir ? (
          <Icon name="folder" size={14} className="shrink-0" style={{ color: isSelected ? "#ffffff" : "var(--color-accent)" }} />
        ) : node.name.endsWith(".md") ? (
          <Icon name="file-text" size={14} className="shrink-0" style={{ color: isSelected ? "#ffffff" : "var(--color-accent)" }} />
        ) : (
          <Icon name="file" size={14} className="shrink-0" style={{ color: isSelected ? "#ffffff" : "var(--color-ink-muted)" }} />
        )}
        <span className="name truncate">{node.name}</span>
      </div>
      {node.isDir && expanded && node.children && (
        <div
          style={{
            borderLeft: "3px solid var(--color-tree-line)",
            marginLeft: `${14 + depth * 16}px`,
          }}
        >
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
