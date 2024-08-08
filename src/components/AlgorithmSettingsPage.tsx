import { Link } from "react-router-dom";
import { Header } from "./Header";
import { useState } from "react";
import ExcludedWordsEditor from "./ExcludedWordsEditor";
import AdvancedOptionsEditor from "./AdvancedOptionsEditor";

export default function AlgorithmSettingsPage({
  autoChooseClusters,
  setAutoChooseClusters,
  maxClusters,
  setMaxClusters,
  clusterCount,
  setClusterCount,
  excludedWords,
  setExcludedWords,
  seed,
  setSeed,
  advancedOptions,
  setAdvancedOptions,
  startClustering,
}: {
  autoChooseClusters: boolean;
  setAutoChooseClusters: (autoChooseClusters: boolean) => void;
  maxClusters?: number;
  setMaxClusters: (maxClusters: number | undefined) => void;
  clusterCount?: number;
  setClusterCount: (clusterCount: number | undefined) => void;
  excludedWords: string[];
  setExcludedWords: (excludedWords: string[]) => void;
  seed: number;
  setSeed: (seed: number) => void;
  advancedOptions: Record<string, string>;
  setAdvancedOptions: (advancedOptions: Record<string, string>) => void;
  startClustering: () => void;
}) {
  const [isExcludedWordsEditorOpen, setIsExcludedWordsEditorOpen] =
    useState(false);
  const [isAdvancedOptionsEditorOpen, setIsAdvancedOptionsEditorOpen] =
    useState(false);

  const submitAlgorithmSettings = () => {
    console.log("Submitting settings...");

    if (autoChooseClusters && !maxClusters) {
      console.error("Max clusters must be set when autoChooseClusters is true");
      return;
    }

    if (!autoChooseClusters && !clusterCount) {
      console.error(
        "Cluster count must be set when autoChooseClusters is false",
      );
      return;
    }

    startClustering();
  };

  // can move this into the component
  const advancedOptionsConfig = [
    {
      key: "nearestNeighbors",
      descriptor:
        "Number of nearest neighbors to consider for outlier detection",
      placeholder: "i.e. 5",
      type: "number" as const,
    },
    {
      key: "zScoreThreshold",
      descriptor: "Z-score threshold for outlier detection",
      placeholder: "i.e. 1",
      type: "number" as const,
    },
    {
      key: "similarityThreshold",
      descriptor: "Similarity threshold for merging clusters",
      placeholder: "i.e. 0.95",
      type: "number" as const,
    },
    {
      key: "languageModel",
      descriptor:
        "Language model to use for clustering (Sentence-Transformers name)",
      placeholder: "i.e. BAAI/bge-large-en-v1.5",
      type: "text" as const,
    },
  ];

  const handleExcludedWordsSave = (newWords: string[]) => {
    setExcludedWords(newWords);
  };

  const handleAdvancedOptionsSave = (values: Record<string, string>) => {
    setAdvancedOptions(values);
  };

  return (
    <>
      <Header>Algorithm Settings</Header>
      <ExcludedWordsEditor
        isOpen={isExcludedWordsEditorOpen}
        onClose={() => setIsExcludedWordsEditorOpen(false)}
        initialWords={excludedWords}
        onSave={handleExcludedWordsSave}
      />
      <AdvancedOptionsEditor
        isOpen={isAdvancedOptionsEditorOpen}
        onClose={() => setIsAdvancedOptionsEditorOpen(false)}
        options={advancedOptionsConfig}
        initialValues={advancedOptions}
        onSave={handleAdvancedOptionsSave}
      />
      <div className="flex flex-col justify-start bg-blue-300 px-24">
        <div className="flex flex-col gap-8 bg-red-300">
          <div></div>
          <div className="h-1 w-full bg-accent"></div>
          <div className="flex items-center justify-between pr-4">
            <h5>Automatically choose number of clusters</h5>
            <input
              type="checkbox"
              checked={autoChooseClusters}
              onChange={() => {
                setAutoChooseClusters(!autoChooseClusters);
                if (autoChooseClusters) {
                  setClusterCount(undefined);
                } else {
                  setMaxClusters(undefined);
                }
              }}
            />
          </div>
          {autoChooseClusters && (
            <div className="flex items-center justify-between pr-4">
              <h5>Max clusters</h5>
              <input
                type="number"
                value={maxClusters || ""}
                onChange={(e) => setMaxClusters(parseInt(e.target.value))}
              />
            </div>
          )}
          {!autoChooseClusters && (
            <div className="flex items-center justify-between pr-4">
              <h5>Clusters</h5>
              <input
                type="number"
                value={clusterCount || ""}
                onChange={(e) => setClusterCount(parseInt(e.target.value))}
              />
            </div>
          )}
          <div className="flex items-center justify-between pr-4">
            <h5>Excluded Words ({excludedWords.length})</h5>
            <button
              onClick={() => setIsExcludedWordsEditorOpen(true)}
              className="w-32 rounded-2xl bg-secondary p-2 px-4 text-background"
            >
              Edit
            </button>
          </div>
          <div className="flex items-center justify-between pr-4">
            <h5>Seed</h5>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value))}
            />
          </div>
          <div className="h-1 w-full bg-accent"></div>
        </div>
        <div className="flex items-center justify-between bg-green-300">
          <button
            className="rounded-2xl bg-secondary p-2 px-4 text-background"
            onClick={() => setIsAdvancedOptionsEditorOpen(true)}
          >
            Show Advanced Options
          </button>
          <Link to="/clustering">
            <button
              className="w-48 rounded-full bg-primary p-4 px-8 text-background"
              onClick={submitAlgorithmSettings}
            >
              <h5>Start</h5>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
