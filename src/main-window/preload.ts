// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { FileSettings, AlgorithmSettings, Settings } from "../models";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("python", {
  readFile: async (path: string) => {
    return await ipcRenderer.invoke("python:readFile", path);
  },
  showItemInFolder: async (path: string) => {
    return await ipcRenderer.invoke("python:showItemInFolder", path);
  },
  readJsonFile: async (path: string) => {
    return await ipcRenderer.invoke("python:readJsonFile", path);
  },
  startClustering: async (
    fileSettings: FileSettings,
    AlgorithmSettings: AlgorithmSettings,
  ) => {
    return await ipcRenderer.invoke(
      "python:startClustering",
      fileSettings,
      AlgorithmSettings,
    );
  },
  getRunName: async () => {
    return await ipcRenderer.invoke("python:getRunName");
  },
  setRunName: async (name: string) => {
    return await ipcRenderer.invoke("python:setRunName", name);
  },
  getExampleFilePath: async () => {
    return await ipcRenderer.invoke("python:getExampleFilePath");
  },
  getResultsDir: async () => {
    return await ipcRenderer.invoke("python:getResultsDir");
  },
  openResultsDir: async () => {
    return await ipcRenderer.invoke("python:openResultsDir");
  },
  getLogsPath: async () => {
    return await ipcRenderer.invoke("python:getLogsPath");
  },
  fetchPreviousResults: async () => {
    return await ipcRenderer.invoke("python:fetchPreviousResults");
  },
  pollRunStatus: async () => {
    return await ipcRenderer.invoke("python:pollRunStatus");
  },
  resetClusterProgress: async () => {
    return await ipcRenderer.invoke("python:resetClusterProgress");
  },
  loadRun: async (name: string) => {
    return await ipcRenderer.invoke("python:loadRun", name);
  },
});

contextBridge.exposeInMainWorld("control", {
  close: () => {
    ipcRenderer.send("control:close");
  },
  minimize: () => {
    ipcRenderer.send("control:minimize");
  },
  maximize: () => {
    ipcRenderer.send("control:maximize");
  },
});

contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => {
    ipcRenderer.invoke("darkMode:toggle");
  },
  get: () => {
    return ipcRenderer.invoke("darkMode:get");
  },
  system: () => {
    ipcRenderer.invoke("darkMode:system");
  },
});

contextBridge.exposeInMainWorld("settings", {
  load: async () => {
    return await ipcRenderer.invoke("settings:load");
  },
  save: async (settings: Settings) => {
    return await ipcRenderer.invoke("settings:save", settings);
  },
});
