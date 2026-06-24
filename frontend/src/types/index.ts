export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
}

export interface AppConfig {
  theme: "dark" | "light";
  documents: string;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "hidden";
