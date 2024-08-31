import React, { useState } from "react";
import { Save, X } from "lucide-react";
import Toggle from "./Toggle";
import Button from "./Button";
import { AdvancedOptions } from "../models";

const AdvancedOptionsEditor = ({
  isOpen,
  setIsOpen,
  advancedOptions,
  setAdvancedOptions,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  advancedOptions: AdvancedOptions;
  setAdvancedOptions: (advancedOptions: AdvancedOptions) => void;
}) => {
  const [isOutlierDetectionEnabled, setIsOutlierDetectionEnabled] = useState(
    advancedOptions.outlierDetection,
  );
  const [
    isAgglomerativeClusteringEnabled,
    setIsAgglomerativeClusteringEnabled,
  ] = useState(advancedOptions.agglomerativeClustering);

  const [nearestNeighbors, setNearestNeighbors] = useState<number | undefined>(
    advancedOptions.nearestNeighbors,
  );
  const [zScoreThreshold, setZScoreThreshold] = useState<number | undefined>(
    advancedOptions.zScoreThreshold,
  );
  const [similarityThreshold, setSimilarityThreshold] = useState<
    number | undefined
  >(advancedOptions.similarityThreshold);
  const [languageModel, setLanguageModel] = useState<string>(
    advancedOptions.languageModel,
  );

  const handleSave = () => {
    console.log("Saving advanced options...");
    if (!isOutlierDetectionEnabled) {
      setNearestNeighbors(undefined);
      setZScoreThreshold(undefined);
    }
    if (!isAgglomerativeClusteringEnabled) {
      setSimilarityThreshold(undefined);
    }
    setAdvancedOptions({
      outlierDetection: isOutlierDetectionEnabled,
      agglomerativeClustering: isAgglomerativeClusteringEnabled,
      nearestNeighbors,
      zScoreThreshold,
      similarityThreshold,
      languageModel,
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-w-4xl rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b p-6">
          <h2 className="text-3xl font-semibold">Cluster Assignments</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-text focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        <div className="flex flex-col gap-8 p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p>Outlier Detection</p>
              <Toggle
                initialState={true}
                onToggle={setIsOutlierDetectionEnabled}
              />
            </div>
            <div
              className={`flex flex-col gap-1 pl-4 ${!isOutlierDetectionEnabled && "text-gray-400"}`}
            >
              <div className="flex items-center justify-between">
                <label htmlFor="nearestNeighbors">
                  <p>Number of nearest neighbors to consider</p>
                </label>
                <input
                  type="number"
                  id="nearestNeighbors"
                  value={nearestNeighbors}
                  onChange={(e) => setNearestNeighbors(e.target.valueAsNumber)}
                  className="w-20 rounded-md border border-gray-300 p-2 text-center focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
                  disabled={!isOutlierDetectionEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="nearestNeighbors">
                  <p>Z-score threshold</p>
                </label>
                <input
                  type="number"
                  step={0.1}
                  id="zScoreThreshold"
                  value={zScoreThreshold}
                  onChange={(e) => setZScoreThreshold(e.target.valueAsNumber)}
                  className="w-20 rounded-md border border-gray-300 p-2 text-center focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
                  disabled={!isOutlierDetectionEnabled}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p>Agglomerative Clustering Post-KMeans</p>
              <Toggle
                initialState={true}
                onToggle={setIsAgglomerativeClusteringEnabled}
              />
            </div>
            <div
              className={`flex flex-col gap-1 pl-4 ${!isAgglomerativeClusteringEnabled && "text-gray-400"}`}
            >
              <div className="flex items-center justify-between">
                <label htmlFor="similarityThreshold">
                  <p>Similarity threshold for merging clusters</p>
                </label>
                <input
                  type="number"
                  id="similarityThreshold"
                  step={0.01}
                  value={similarityThreshold}
                  onChange={(e) =>
                    setSimilarityThreshold(e.target.valueAsNumber)
                  }
                  className="w-20 rounded-md border border-gray-300 p-2 text-center focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
                  disabled={!isAgglomerativeClusteringEnabled}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="languageModel">
              <div className="flex flex-col">
                <p>Language Model</p>
                <p className="text-base font-normal text-gray-500">
                  (Sentence-Transformers name)
                </p>
              </div>
            </label>
            <input
              type="text"
              id="languageModel"
              value={languageModel}
              onChange={(e) => setLanguageModel(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-center focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="flex justify-end p-4">
          <Button
            onClick={handleSave}
            text="Save Changes"
            leftIcon={<Save size={20} />}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedOptionsEditor;
