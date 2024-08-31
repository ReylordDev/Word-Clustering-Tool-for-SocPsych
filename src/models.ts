export interface FileSettings {
  path: string;
  delimiter: string;
  hasHeader: boolean;
  selectedColumns: number[];
}

export interface AlgorithmSettings {
  autoClusterCount: boolean;
  maxClusters: number | undefined;
  clusterCount: number | undefined;
  seed: number | undefined;
  excludedWords: string[];
  advancedOptions: AdvancedOptions;
}

export interface AdvancedOptions {
  outlierDetection: boolean;
  nearestNeighbors: number | undefined;
  zScoreThreshold: number | undefined;
  agglomerativeClustering: boolean;
  similarityThreshold: number | undefined;
  languageModel: string;
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
