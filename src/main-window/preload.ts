// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import {
  AutoAlgorithmSettings,
  FileSettings,
  ManualAlgorithmSettings,
} from "../models";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("python", {
  readFile: async (path: string) => {
    return await ipcRenderer.invoke("python:readFile", path);
  },
  startClustering: async (
    fileSettings: FileSettings,
    AlgorithmSettings: AutoAlgorithmSettings | ManualAlgorithmSettings,
  ) => {
    return await ipcRenderer.invoke(
      "python:startClustering",
      fileSettings,
      AlgorithmSettings,
    );
  },
  pollClusterProgress: async () => {
    return await ipcRenderer.invoke("python:pollClusterProgress");
  },
});