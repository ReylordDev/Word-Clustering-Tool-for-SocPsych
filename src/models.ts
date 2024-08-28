export interface FileSettings {
  path: string;
  delimiter: string;
  hasHeader: boolean;
  selectedColumns: number[];
}

interface AlgorithmSettings {
  autoClusterCount: boolean;
  seed: number;
  excludedWords: string[];
  advancedOptions: AdvancedOptions;
}

export interface AdvancedOptions {
  nearestNeighbors: number;
  zScoreThreshold: number;
  similarityThreshold: number;
  languageModel: string;
}

export interface AutoAlgorithmSettings extends AlgorithmSettings {
  autoClusterCount: true;
  maxClusters: number;
}

export interface ManualAlgorithmSettings extends AlgorithmSettings {
  autoClusterCount: false;
  clusterCount: number;
}

export interface Args {
  path: string;
  delimiter: string;
  hasHeaders: boolean;
  selectedColumns: number[];
  excludedWords: string[];
  languageModel: string;
  nearestNeighbors: number;
  zScoreThreshold: number;
  automaticK: boolean;
  maxNumClusters: number;
  seed: number;
  clusterCount: number;
  mergeThreshold: number;
  logDir: string;
  logLevel: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  outputDir: string;
}
