import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportedLanguage } from "../types/shared";

export type FileType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string;
  language?: SupportedLanguage | "json" | "markdown" | "plaintext";
}

interface FileStore {
  files: Record<string, FileNode>;
  activeFileId: string | null;
  
  createFile: (parentId: string | null, name: string, language?: SupportedLanguage) => string;
  createFolder: (parentId: string | null, name: string) => string;
  updateFileContent: (id: string, content: string) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  setActiveFile: (id: string | null) => void;
  
  getChildren: (parentId: string | null) => FileNode[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_FILES: Record<string, FileNode> = {
  "root": { id: "root", name: "src", type: "folder", parentId: null },
  "main_py": { 
    id: "main_py", 
    name: "main.py", 
    type: "file", 
    parentId: "root", 
    content: "# Say \"create a function called add\" or start typing.\n", 
    language: "python" 
  }
};

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: INITIAL_FILES,
      activeFileId: "main_py",

      createFile: (parentId, name, language = "python") => {
        const id = generateId();
        set((state) => ({
          files: {
            ...state.files,
            [id]: { id, name, type: "file", parentId, content: "", language },
          },
          activeFileId: id, // Auto-open new file
        }));
        return id;
      },

      createFolder: (parentId, name) => {
        const id = generateId();
        set((state) => ({
          files: {
            ...state.files,
            [id]: { id, name, type: "folder", parentId },
          },
        }));
        return id;
      },

      updateFileContent: (id, content) => {
        set((state) => {
          const file = state.files[id];
          if (!file || file.type !== "file") return state;
          return {
            files: {
              ...state.files,
              [id]: { ...file, content },
            },
          };
        });
      },

      deleteNode: (id) => {
        set((state) => {
          const newFiles = { ...state.files };
          
          // Recursive delete helper
          const deleteRecursive = (nodeId: string) => {
            const children = Object.values(newFiles).filter(f => f.parentId === nodeId);
            children.forEach(c => deleteRecursive(c.id));
            delete newFiles[nodeId];
          };
          
          deleteRecursive(id);
          
          // If we deleted the active file, clear it
          const newActiveId = state.activeFileId === id || !newFiles[state.activeFileId as string] ? null : state.activeFileId;

          return { files: newFiles, activeFileId: newActiveId };
        });
      },

      renameNode: (id, newName) => {
        set((state) => {
          const node = state.files[id];
          if (!node) return state;
          return {
            files: {
              ...state.files,
              [id]: { ...node, name: newName },
            },
          };
        });
      },

      setActiveFile: (id) => set({ activeFileId: id }),

      getChildren: (parentId) => {
        return Object.values(get().files).filter(f => f.parentId === parentId);
      },
    }),
    {
      name: "v-code-files",
    }
  )
);
