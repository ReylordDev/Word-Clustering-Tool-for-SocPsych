import { Link } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { useState } from "react";
import ExcludedWordsEditor from "./ExcludedWordsEditor";
import AdvancedOptionsEditor from "./AdvancedOptionsEditor";
import Toggle from "./Toggle";
import Button from "./Button";
import { SquarePen, ChartScatter } from "lucide-react";

interface AdvancedOptions {
  nearestNeighbors: number | undefined;
  zScoreThreshold: number | undefined;
  similarityThreshold: number | undefined;
  languageModel: string;
}

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

  console.log("Auto Choose Clusters: ", autoChooseClusters);
  console.log("Max Clusters: ", maxClusters);
  console.log("Cluster Count: ", clusterCount);
  console.log("Excluded Words: ", excludedWords);
  console.log("Seed: ", seed);
  console.log("Advanced Options: ", advancedOptions);

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

  const handleAdvancedOptionsSave = (values: Record<string, string>) => {
    setAdvancedOptions(values);
  };

  return (
    <>
      <TitleBar index={2} />
      <div id="mainContent">
        <ExcludedWordsEditor
          isOpen={isExcludedWordsEditorOpen}
          setIsOpen={setIsExcludedWordsEditorOpen}
          excludedWords={excludedWords}
          setExcludedWords={setExcludedWords}
        />
        <AdvancedOptionsEditor
          isOpen={isAdvancedOptionsEditorOpen}
          onClose={() => setIsAdvancedOptionsEditorOpen(false)}
          options={advancedOptionsConfig}
          initialValues={advancedOptions}
          onSave={handleAdvancedOptionsSave}
        />
        <div className="mt-8 flex flex-col gap-12 px-24">
          <h1 className="flex w-full flex-col gap-2 text-5xl">
            Algorithm Settings
          </h1>
          <div className="flex flex-col gap-8 text-lg">
            <div className="flex items-center justify-between">
              <p>Automatically choose number of clusters</p>
              <Toggle
                initialState={autoChooseClusters}
                onToggle={setAutoChooseClusters}
              />
            </div>
            <div
              className={`flex items-center justify-between ${!autoChooseClusters && "text-gray-400"}`}
            >
              <label htmlFor="maxClusterCount">
                <p>Maximum number of clusters to consider</p>
              </label>
              <input
                type="number"
                min={1}
                onChange={(e) => setMaxClusters(e.target.valueAsNumber)}
                id="maxClusterCount"
                className="w-24 rounded-md border border-gray-300 p-2 pl-5 focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
                disabled={!autoChooseClusters}
              />
            </div>
            <div
              className={`flex items-center justify-between ${autoChooseClusters && "text-gray-400"}`}
            >
              <label htmlFor="clusterCount">
                <p>Specific cluster count</p>
              </label>
              <input
                type="number"
                id="clusterCount"
                min={1}
                onChange={(e) => setMaxClusters(e.target.valueAsNumber)}
                className="w-24 rounded-md border border-gray-300 p-2 pl-5 focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
                disabled={autoChooseClusters}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="seed">
                <div className="flex flex-col">
                  <p>Deterministic Seed</p>
                  <p className="text-base font-normal text-gray-500">
                    Leave empty for non-deterministic results
                  </p>
                </div>
              </label>
              <input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value))}
                className="w-24 rounded-md border border-gray-300 p-2 pl-5 text-center focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p>
                  Excluded Words{" "}
                  {excludedWords.length > 0 ? `(${excludedWords.length})` : ""}
                </p>
                <p className="text-base font-normal text-gray-500">
                  Disregard any responses containing these words
                </p>
              </div>
              <Button
                onClick={() => setIsExcludedWordsEditorOpen(true)}
                primary={false}
                leftIcon={<SquarePen size={24} />}
                text="Edit"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p>Advanced algorithm options</p>
                <p className="text-base font-normal text-gray-500">
                  More granular control over the algorithm
                </p>
              </div>
              <Button
                onClick={() => setIsAdvancedOptionsEditorOpen(true)}
                primary={false}
                leftIcon={<SquarePen size={24} />}
                text="Edit"
              />
            </div>
          </div>
          <div className="flex w-full justify-end">
            <Link to="/clustering">
              <Button
                leftIcon={<ChartScatter size={24} />}
                onClick={submitAlgorithmSettings}
                text="Start Clustering"
              ></Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
