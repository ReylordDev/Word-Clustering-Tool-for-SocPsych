import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import FileSelectionPage from "../components/FileSelectionPage";
import FilePreviewPage from "../components/FilePreviewPage";
import AlgorithmSettingsPage from "../components/AlgorithmSettingsPage";
import ProgressPage from "../components/ProgressPage";
import ResultsPage from "../components/ResultsPage";
import { FileSettings, AlgorithmSettings, AdvancedOptions } from "../models";

export default function App() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(",");
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);
  const [autoClusterCount, setAutoChooseClusters] = useState(true);
  const [maxClusters, setMaxClusters] = useState<number | undefined>(undefined);
  const [clusterCount, setClusterCount] = useState<number | undefined>(
    undefined,
  );
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    outlierDetection: true,
    agglomerativeClustering: true,
    nearestNeighbors: 5,
    zScoreThreshold: 3,
    similarityThreshold: 0.95,
    languageModel: "BAAI/bge-large-en-v1.5",
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  const setFileSettings = (fileSettings: FileSettings) => {
    setFilePath(fileSettings.path);
    setHasHeader(fileSettings.hasHeader);
    setDelimiter(fileSettings.delimiter);
    setSelectedColumns(fileSettings.selectedColumns);
  };

  const resetFileSettings = () => {
    setFilePath(null);
    setHasHeader(true);
    setDelimiter(",");
    setSelectedColumns([]);
  };

  const startClustering = async () => {
    if (!filePath) {
      console.error("File not selected");
      return;
    }
    const fileSettings: FileSettings = {
      path: filePath,
      hasHeader,
      delimiter,
      selectedColumns,
    };
    const algorithmSettings: AlgorithmSettings = {
      autoClusterCount,
      maxClusters,
      clusterCount,
      seed,
      excludedWords,
      advancedOptions,
    };
    console.log("File settings: ", fileSettings);
    console.log("Algorithm settings: ", algorithmSettings);

    console.log("Starting clustering...");
    window.python.startClustering(fileSettings, algorithmSettings);
    setStartTime(Date.now());
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <FileSelectionPage
              filePath={filePath}
              setFilePath={setFilePath}
              setFileSettings={setFileSettings}
            />
          }
        />
        <Route
          path="/file_preview"
          element={
            <FilePreviewPage
              filePath={filePath}
              hasHeader={hasHeader}
              setHasHeader={setHasHeader}
              delimiter={delimiter}
              setDelimiter={setDelimiter}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
            />
          }
        />
        <Route
          path="/algorithm_settings"
          element={
            <AlgorithmSettingsPage
              autoChooseClusters={autoClusterCount}
              setAutoChooseClusters={setAutoChooseClusters}
              maxClusters={maxClusters}
              setMaxClusters={setMaxClusters}
              clusterCount={clusterCount}
              setClusterCount={setClusterCount}
              excludedWords={excludedWords}
              setExcludedWords={setExcludedWords}
              seed={seed}
              setSeed={setSeed}
              advancedOptions={advancedOptions}
              setAdvancedOptions={setAdvancedOptions}
              startClustering={startClustering}
            />
          }
        />
        <Route
          path="/progress"
          element={<ProgressPage startTime={startTime} />}
        />
        <Route
          path="/results"
          element={<ResultsPage resetFileSettings={resetFileSettings} />}
        />
      </Routes>
    </Router>
  );
}
