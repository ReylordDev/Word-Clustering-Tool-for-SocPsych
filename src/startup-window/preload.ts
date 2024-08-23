// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("python", {
  isPythonInstalled: () => ipcRenderer.invoke("python:isPythonInstalled"),
  hasMinimalPythonVersion: () =>
    ipcRenderer.invoke("python:hasMinimalPythonVersion"),
  runSetupScript: () => ipcRenderer.invoke("python:runSetupScript"),
  onSetupScriptMessage: (listener: (event: unknown, message: string) => void) =>
    ipcRenderer.on("python:setupScriptMessage", listener),
});

contextBridge.exposeInMainWorld("startup", {
  complete: () => ipcRenderer.invoke("startup:complete"),
});
