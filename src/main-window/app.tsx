import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import LandingPage from "../components/LandingPage";
import FileSelectionPage from "../components/FileSelectionPage";
import FilePreviewPage from "../components/FilePreviewPage";
import AlgorithmSettingsPage from "../components/AlgorithmSettingsPage";
import ProgressPage from "../components/ProgressPage";
import ResultsPage from "../components/ResultsPage";
import {
  FileSettings,
  AutoAlgorithmSettings,
  ManualAlgorithmSettings,
  AdvancedOptions,
} from "../models";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(",");
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);
  const [autoChooseClusters, setAutoChooseClusters] = useState(true);
  const [maxClusters, setMaxClusters] = useState<number | undefined>(undefined);
  const [clusterCount, setClusterCount] = useState<number | undefined>(
    undefined,
  );
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [seed, setSeed] = useState(0);
  const [advancedOptions, setAdvancedOptions] = useState<
    Record<string, string>
  >({
    nearestNeighbors: "5",
    zScoreThreshold: "1",
    similarityThreshold: "0.95",
    languageModel: "BAAI/bge-large-en-v1.5",
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  console.log("Mother State, File: ", file?.path);
  console.log("Mother State, hasHeader: ", hasHeader);
  console.log("Mother State, delimiter: ", delimiter);
  console.log("Mother State, selectedColumns: ", selectedColumns);

  const startClustering = async () => {
    if (!file) {
      console.error("File not selected");
      return;
    }
    const fileSettings: FileSettings = {
      path: file.path,
      hasHeader,
      delimiter,
      selectedColumns,
    };
    const advancedOptionsTyped: AdvancedOptions = {
      nearestNeighbors: parseInt(advancedOptions.nearestNeighbors),
      zScoreThreshold: parseFloat(advancedOptions.zScoreThreshold),
      similarityThreshold: parseFloat(advancedOptions.similarityThreshold),
      languageModel: advancedOptions.languageModel,
    };
    let algorithm_settings: AutoAlgorithmSettings | ManualAlgorithmSettings;
    if (autoChooseClusters) {
      algorithm_settings = {
        autoClusterCount: true,
        maxClusters: maxClusters as number,
        seed,
        excludedWords,
        advancedOptions: advancedOptionsTyped,
      };
    } else {
      algorithm_settings = {
        autoClusterCount: false,
        clusterCount: clusterCount as number,
        seed,
        excludedWords,
        advancedOptions: advancedOptionsTyped,
      };
    }
    console.log("File settings: ", fileSettings);
    console.log("Algorithm settings: ", algorithm_settings);

    console.log("Starting clustering...");
    window.python.startClustering(fileSettings, algorithm_settings);
    setStartTime(Date.now());
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/file"
          element={<FileSelectionPage selectedFile={file} setFile={setFile} />}
        />
        <Route
          path="/file_preview"
          element={
            <FilePreviewPage
              file={file}
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
              autoChooseClusters={autoChooseClusters}
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
          path="/clustering"
          element={<ProgressPage startTime={startTime} />}
        />
        <Route
          path="/results"
          // path="/"
          element={<ResultsPage startTime={startTime} />}
          // element={<ResultsPage startTime={501590112} />}
        />
      </Routes>
    </Router>
  );
}
