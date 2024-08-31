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
  fileSettings: FileSettings;
  algorithmSettings: AlgorithmSettings;
  outputDir: string;
}

export interface ProgressMessage {
  step: string;
  status: "TODO" | "STARTED" | "DONE";
  timestamp: string;
  type: string;
}

export interface ResultsDirMessage {
  path: string;
  type: string;
}
