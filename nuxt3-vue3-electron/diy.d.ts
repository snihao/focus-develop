/**
 * 全局类型声明
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ElectronAPI {
  openFile: () => Promise<{ filePath: string; content: string } | null>;
  saveFile: (data: { content: string; filePath?: string }) => Promise<{ success: boolean; filePath?: string }>;
  readDirectory: (path: string) => Promise<{ success: boolean; items?: string[]; error?: string }>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
