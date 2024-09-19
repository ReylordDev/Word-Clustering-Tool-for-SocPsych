// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("firstLaunch", {
  onError: (callback: () => void) =>
    ipcRenderer.on("firstLaunch:error", () => callback()),
});

contextBridge.exposeInMainWorld("python", {
  showItemInFolder: async (path: string) => {
    return await ipcRenderer.invoke("python:showItemInFolder", path);
  },
  getLogsPath: async (firstLaunch = true) => {
    return await ipcRenderer.invoke("python:getLogsPath", firstLaunch);
  },
});
