import { useNavigate } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { useState } from "react";
import ExcludedWordsEditor from "./ExcludedWordsEditor";
import AdvancedOptionsEditor from "./AdvancedOptionsEditor";
import { AdvancedOptions } from "../models";
import Toggle from "./Toggle";
import Button from "./Button";
import { SquarePen, ChartScatter } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipContentContainer,
} from "./Tooltip";

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
  tutorialState,
}: {
  autoChooseClusters: boolean;
  setAutoChooseClusters: (autoChooseClusters: boolean) => void;
  maxClusters: number | null | undefined;
  setMaxClusters: (maxClusters: number | null | undefined) => void;
  clusterCount: number | null | undefined;
  setClusterCount: (clusterCount: number | null | undefined) => void;
  excludedWords: string[];
  setExcludedWords: (excludedWords: string[]) => void;
  seed: number | null;
  setSeed: (seed: number | null) => void;
  advancedOptions: AdvancedOptions;
  setAdvancedOptions: (advancedOptions: AdvancedOptions) => void;
  startClustering: () => void;
  tutorialState: {
    tutorialMode: boolean;
    setTutorialMode: (mode: boolean) => void;
  };
}) {
  const [isExcludedWordsEditorOpen, setIsExcludedWordsEditorOpen] =
    useState(false);
  const [isAdvancedOptionsEditorOpen, setIsAdvancedOptionsEditorOpen] =
    useState(false);
  const navigate = useNavigate();
  const anyModalOpen = isExcludedWordsEditorOpen || isAdvancedOptionsEditorOpen;
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const submitAlgorithmSettings = () => {
    console.log("Submitting settings...");

    // TODO: Validate settings
    // if (autoChooseClusters && !maxClusters) {
    //   console.error("Max clusters must be set when autoChooseClusters is true");
    //   return;
    // }

    if (!autoChooseClusters && !clusterCount) {
      console.error(
        "Cluster count must be set when autoChooseClusters is false",
      );
      return;
    }

    startClustering();
    navigate("/progress");
  };

  const resetState = () => {
    console.log("Resetting state");
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

  return (
    <>
      <TitleBar
        index={2}
        resetState={resetState}
        tutorialState={tutorialState}
      />
      <div
        id="mainContent"
        className="dark:dark bg-backgroundColor text-textColor"
      >
        <ExcludedWordsEditor
          isOpen={isExcludedWordsEditorOpen}
          setIsOpen={setIsExcludedWordsEditorOpen}
          excludedWords={excludedWords}
          setExcludedWords={setExcludedWords}
        />
        <AdvancedOptionsEditor
          isOpen={isAdvancedOptionsEditorOpen}
          setIsOpen={setIsAdvancedOptionsEditorOpen}
          advancedOptions={advancedOptions}
          setAdvancedOptions={setAdvancedOptions}
          tutorialState={tutorialState}
          setUnsavedChanges={setUnsavedChanges}
        />
        <div className="mt-8 flex flex-col gap-6 px-24 xl:gap-8 xl:px-32 xl:pb-8">
          <h1 className="flex w-full flex-col text-5xl">Algorithm Settings</h1>
          <div className="flex flex-col gap-4 text-lg xl:gap-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between">
                  <p>Automatically choose number of clusters</p>
                  <Toggle
                    initialState={autoChooseClusters}
                    onToggle={(isOn) => {
                      setAutoChooseClusters(isOn);
                      if (isOn) {
                        setClusterCount(undefined);
                        setMaxClusters(null);
                      } else {
                        setMaxClusters(undefined);
                        setClusterCount(null);
                      }
                    }}
                    modalOpen={anyModalOpen}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <TooltipContentContainer
                  tutorialMode={tutorialState.tutorialMode}
                >
                  <p className="text-left">
                    With this setting enabled, the program will decide the
                    number of clusters by systematically testing different
                    cluster counts and evaluating them using internal cluster
                    validation techniques.
                    <br></br>
                    This setting can increase the computation time, especially
                    when checking a large number of clusters. Therefore, it is
                    recommended to set a maximum number of clusters to consider.
                  </p>
                </TooltipContentContainer>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center justify-between ${!autoChooseClusters && "text-gray-400"}`}
                >
                  <label htmlFor="maxClusterCount">
                    <p>Maximum number of clusters to consider</p>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxClusters || ""}
                    onChange={(e) => setMaxClusters(e.target.valueAsNumber)}
                    id="maxClusterCount"
                    className="w-24 rounded-md border border-primaryColor p-2 pl-5 focus:outline-none focus:ring focus:ring-primaryColor focus:ring-opacity-50 disabled:border-gray-300 dark:bg-backgroundColor dark:disabled:border-gray-800"
                    disabled={!autoChooseClusters}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <TooltipContentContainer
                  tutorialMode={tutorialState.tutorialMode}
                >
                  <p className="text-left">
                    The maximum number of clusters to consider when
                    automatically choosing the number of clusters.
                    <br></br>
                    If not set, the program will consider all possible cluster
                    counts up to the number of data points divided by 2.
                  </p>
                </TooltipContentContainer>
              </TooltipContent>
            </Tooltip>{" "}
            <Tooltip>
              <TooltipTrigger asChild>
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
                    value={clusterCount || ""}
                    onChange={(e) => setClusterCount(e.target.valueAsNumber)}
                    className="w-24 rounded-md border border-primaryColor p-2 pl-5 focus:outline-none focus:ring focus:ring-primaryColor focus:ring-opacity-50 disabled:border-gray-300 dark:bg-backgroundColor dark:disabled:border-gray-800"
                    disabled={autoChooseClusters}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <TooltipContentContainer
                  tutorialMode={tutorialState.tutorialMode}
                >
                  <p className="text-left">
                    The specific number of clusters to use when not
                    automatically choosing the number of clusters.
                    <br></br>
                    This option is required when the automatic cluster count
                    setting is disabled.
                  </p>
                </TooltipContentContainer>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
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
                    value={seed || ""}
                    onChange={(e) => setSeed(parseInt(e.target.value))}
                    className="w-24 rounded-md border border-gray-300 p-2 pl-5 text-center focus:outline-none focus:ring focus:ring-primaryColor focus:ring-opacity-50 dark:bg-backgroundColor"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <TooltipContentContainer
                  tutorialMode={tutorialState.tutorialMode}
                >
                  <p className="text-left">
                    The seed to use for the random number generator. This allows
                    for deterministic results when the same seed is used.
                    <br></br>
                    Leave empty for non-deterministic results.
                  </p>
                </TooltipContentContainer>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p>
                      Excluded Words{" "}
                      {excludedWords.length > 0
                        ? `(${excludedWords.length})`
                        : ""}
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
              </TooltipTrigger>
              <TooltipContent>
                <TooltipContentContainer
                  tutorialMode={tutorialState.tutorialMode}
                >
                  <p className="text-left">
                    The excluded words list allows you to specify words that
                    should not be considered when clustering responses. This can
                    be useful for removing common words or phrases that are not
                    relevant to the clustering.
                    <br></br>
                    This setting is case-insensitive!
                  </p>
                </TooltipContentContainer>
              </TooltipContent>
            </Tooltip>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <p>Advanced algorithm options</p>
                  {unsavedChanges && (
                    <p className="text-base font-normal text-primaryColor">
                      Unsaved changes
                    </p>
                  )}
                </div>
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
            <Button
              leftIcon={<ChartScatter size={24} />}
              onClick={submitAlgorithmSettings}
              text="Start Clustering"
              disabled={!autoChooseClusters && !clusterCount}
              modalOpen={anyModalOpen}
            ></Button>
          </div>
        </div>
      </div>
    </>
  );
}
