// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("python", {
  start: () => ipcRenderer.send("python:start"),
  onStdout: (listener: (data: string) => void) =>
    ipcRenderer.on("python:stdout", (_, data) => listener(data)),
});
