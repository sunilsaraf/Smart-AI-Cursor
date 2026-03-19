import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('save-file', filePath, content),
  executeCommand: (command: string) =>
    ipcRenderer.invoke('execute-command', command),
});

declare global {
  interface Window {
    electron: {
      openFile: (filePath: string) => Promise<{ success: boolean; filePath: string }>;
      saveFile: (filePath: string, content: string) => Promise<{ success: boolean }>;
      executeCommand: (command: string) => Promise<{ success: boolean; output: string }>;
    };
  }
}
