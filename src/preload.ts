// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { start } from "repl";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("python", {
  submitFilePath: async (path: string) => {
    return await ipcRenderer.invoke("python:submitFilePath", path);
  },
  readFile: async (path: string) => {
    return await ipcRenderer.invoke("python:readFile", path);
  },
  setFileSettings: async (
    hasHeader: boolean,
    separator: string,
    selectedColumns: number[],
  ) => {
    return await ipcRenderer.invoke(
      "python:setFileSettings",
      hasHeader,
      separator,
      selectedColumns,
    );
  },
  setAlgorithmSettings: async (
    autoChooseClusters: boolean,
    maxClusters: number,
    excludedWords: string[],
    seed: number,
    languageModel: string,
    nearestNeighbors: number,
    zScoreThreshold: number,
    similarityThreshold: number,
  ) => {
    return await ipcRenderer.invoke(
      "python:setAlgorithmSettings",
      autoChooseClusters,
      maxClusters,
      excludedWords,
      seed,
      languageModel,
      nearestNeighbors,
      zScoreThreshold,
      similarityThreshold,
    );
  },
  startClustering: async () => {
    return await ipcRenderer.invoke("python:startClustering");
  },
});
