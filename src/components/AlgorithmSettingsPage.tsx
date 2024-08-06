import { Link } from "react-router-dom";
import { Header } from "./Header";
import { useState } from "react";
import ExcludedWordsEditor from "./ExcludedWordsEditor";
import AdvancedOptionsEditor from "./AdvancedOptionsEditor";

export default function AlgorithmSettingsPage() {
  const [autoChooseClusters, setAutoChooseClusters] = useState(true);
  const [maxClusters, setMaxClusters] = useState<number | undefined>(undefined);
  const [clusterCount, setClusterCount] = useState<number | undefined>(
    undefined,
  );
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [isExcludedWordsEditorOpen, setIsExcludedWordsEditorOpen] =
    useState(false);
  const [seed, setSeed] = useState(0);
  const [advancedOptions, setAdvancedOptions] = useState<
    Record<string, string>
  >({
    nearestNeighbors: "5",
    zScoreThreshold: "1",
    similarityThreshold: "0.95",
    languageModel: "BAAI/bge-large-en-v1.5",
  });
  const [isAdvancedOptionsEditorOpen, setIsAdvancedOptionsEditorOpen] =
    useState(false);

  const submitAlgorithmSettings = () => {
    console.log("Submitting settings...");
    console.log({
      autoChooseClusters,
      maxClusters,
      clusterCount,
      excludedWords,
      seed,
      language_model: advancedOptions.languageModel,
      nearest_neighbors: parseInt(advancedOptions.nearestNeighbors),
      z_score_threshold: parseFloat(advancedOptions.zScoreThreshold),
      similarity_threshold: parseFloat(advancedOptions.similarityThreshold),
    });

    window.python.setAlgorithmSettings(
      autoChooseClusters,
      maxClusters,
      clusterCount,
      excludedWords,
      seed,
      advancedOptions.languageModel,
      parseInt(advancedOptions.nearestNeighbors),
      parseFloat(advancedOptions.zScoreThreshold),
      parseFloat(advancedOptions.similarityThreshold),
    );

    window.python.startClustering();
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
    // You might want to save this to your backend or local storage here
  };

  const handleAdvancedOptionsSave = (values: Record<string, string>) => {
    setAdvancedOptions(values);
    // You might want to save this to your backend or local storage here
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
