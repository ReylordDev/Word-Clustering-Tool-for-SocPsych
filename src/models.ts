export interface FileSettingsParam {
  delimiter: string;
  hasHeader: boolean;
  selectedColumns: boolean[];
}

interface AlgorithmSettings {
  seed: number;
  excludedWords: string[];
  autoClusterCount: boolean;
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
