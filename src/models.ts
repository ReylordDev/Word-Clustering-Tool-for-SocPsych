export interface FileSettings {
  path: string;
  delimiter: string;
  hasHeader: boolean;
  selectedColumns: boolean[];
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
