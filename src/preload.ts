// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import {
  AutoAlgorithmSettings,
  FileSettingsParam,
  ManualAlgorithmSettings,
} from "./models";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("python", {
  submitFilePath: async (path: string) => {
    return await ipcRenderer.invoke("python:submitFilePath", path);
  },
  chooseExampleFile: async () => {
    return await ipcRenderer.invoke("python:chooseExampleFile");
  },
  readFile: async (path: string) => {
    return await ipcRenderer.invoke("python:readFile", path);
  },
  setFileSettings: async (fileSettings: FileSettingsParam) => {
    return await ipcRenderer.invoke("python:setFileSettings", fileSettings);
  },
  setAlgorithmSettings: async (
    algorithmSettings: AutoAlgorithmSettings | ManualAlgorithmSettings,
  ) => {
    return await ipcRenderer.invoke(
      "python:setAlgorithmSettings",
      algorithmSettings,
    );
  },
  startClustering: async () => {
    return await ipcRenderer.invoke("python:startClustering");
  },
  pollClusterProgress: async () => {
    return await ipcRenderer.invoke("python:pollClusterProgress");
  },
});
