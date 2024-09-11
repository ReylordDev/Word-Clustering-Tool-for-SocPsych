import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

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
  const [maxClusters, setMaxClusters] = useState<number | null | undefined>(
    null,
  );
  const [clusterCount, setClusterCount] = useState<number | null | undefined>(
    undefined,
  );
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [seed, setSeed] = useState<number | null>(null);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    outlierDetection: true,
    agglomerativeClustering: true,
    nearestNeighbors: 5,
    zScoreThreshold: 3,
    similarityThreshold: 0.95,
    languageModel: "BAAI/bge-large-en-v1.5",
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [tutorialMode, setTutorialMode] = useState(true);

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
              setFilePath={setFilePath}
              setFileSettings={setFileSettings}
              tutorialState={{ tutorialMode, setTutorialMode }}
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
              tutorialState={{ tutorialMode, setTutorialMode }}
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
              tutorialState={{ tutorialMode, setTutorialMode }}
            />
          }
        />
        <Route
          path="/progress"
          element={
            <ProgressPage
              startTime={startTime}
              tutorialState={{ tutorialMode, setTutorialMode }}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ResultsPage
              resetFileSettings={resetFileSettings}
              tutorialState={{ tutorialMode, setTutorialMode }}
            />
          }
        />
      </Routes>
    </Router>
  );
}
