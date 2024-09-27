import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import FileSelectionPage from "../components/FileSelectionPage";
import FilePreviewPage from "../components/FilePreviewPage";
import AlgorithmSettingsPage from "../components/AlgorithmSettingsPage";
import ProgressPage from "../components/ProgressPage";
import ResultsPage from "../components/ResultsPage";
import {
  FileSettings,
  AlgorithmSettings,
  AdvancedOptions,
  Args,
} from "../models";

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

  useEffect(() => {
    window.settings.load().then((settings) => {
      setTutorialMode(settings.tutorialMode);
    });
  }, []);

  const saveTutorialMode = (tutorialMode: boolean) => {
    window.settings.save({ tutorialMode, firstLaunch: false });
    setTutorialMode(tutorialMode);
  };

  const setFileSettings = (fileSettings: FileSettings) => {
    setFilePath(fileSettings.path);
    setHasHeader(fileSettings.hasHeader);
    setDelimiter(fileSettings.delimiter);
    setSelectedColumns(fileSettings.selectedColumns);
  };

  const setAlgorithmSettings = (algorithmSettings: AlgorithmSettings) => {
    setAutoChooseClusters(algorithmSettings.autoClusterCount);
    setMaxClusters(algorithmSettings.maxClusters);
    setClusterCount(algorithmSettings.clusterCount);
    setExcludedWords(algorithmSettings.excludedWords);
    setSeed(algorithmSettings.seed);
    setAdvancedOptions(algorithmSettings.advancedOptions);
  };

  const resetFileSettings = () => {
    setFilePath(null);
    setHasHeader(true);
    setDelimiter(",");
    setSelectedColumns([]);
  };

  const resetAlgorithmSettings = () => {
    setAutoChooseClusters(true);
    setMaxClusters(null);
    setClusterCount(undefined);
    setExcludedWords([]);
    setSeed(null);
    setAdvancedOptions({
      outlierDetection: true,
      agglomerativeClustering: true,
      nearestNeighbors: 5,
      zScoreThreshold: 3,
      similarityThreshold: 0.95,
      languageModel: "BAAI/bge-large-en-v1.5",
    });
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

  const loadPrevousResult = async (result: string) => {
    await window.python.loadRun(result);
    const resultsDir = await window.python.getResultsDir();
    const output = await window.python.readJsonFile(`${resultsDir}/args.json`);
    const args = output as Args;
    setFileSettings(args.fileSettings);
    setAlgorithmSettings(args.algorithmSettings);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <FileSelectionPage
              setFilePath={setFilePath}
              loadPrevousResult={loadPrevousResult}
              tutorialState={{
                tutorialMode,
                setTutorialMode: saveTutorialMode,
              }}
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
              tutorialState={{
                tutorialMode,
                setTutorialMode: saveTutorialMode,
              }}
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
              tutorialState={{
                tutorialMode,
                setTutorialMode: saveTutorialMode,
              }}
            />
          }
        />
        <Route
          path="/progress"
          element={
            <ProgressPage
              startTime={startTime}
              tutorialState={{
                tutorialMode,
                setTutorialMode: saveTutorialMode,
              }}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ResultsPage
              resetFileSettings={resetFileSettings}
              resetAlgorithmSettings={resetAlgorithmSettings}
              tutorialState={{
                tutorialMode,
                setTutorialMode: saveTutorialMode,
              }}
            />
          }
        />
      </Routes>
    </Router>
  );
}
