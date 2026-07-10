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

export interface UpdateInfo {
  hasUpdate: boolean;
  latest: string;
  current: string;
  downloadUrl: string;
  changelog: string;
}
