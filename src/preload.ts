// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("python", {
  submitFilePath: async (path: string) => {
    return await ipcRenderer.invoke("python:submitFilePath", path);
  },
  readFile: async (path: string) => {
    return await ipcRenderer.invoke("python:readFile", path);
  },
});
