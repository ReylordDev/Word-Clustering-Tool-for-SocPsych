import { TitleBar } from "./TitleBar";
import {
  Clock,
  Pencil,
  Save,
  Check,
  ChevronUp,
  ChevronDown,
  FileText,
  List,
  GitCompare,
  AlertTriangle,
  GitMerge,
  CheckCheck,
} from "lucide-react";
import Button from "./Button";
import ClusterAssignmentModal from "./ClusterAssignmentModal";
import { useState, useEffect } from "react";

import { formatTime } from "../utils";

import { Args } from "../models";

import OutliersModal from "./OutliersModal";
import MergedClustersModal from "./MergedClustersModal";
import ClusterSimilarityModal from "./ClusterSimilaritiesModal";

interface TimeStamp {
  name: string;
  time: number;
}

function TotalTimeDropdown({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [timeStamps, setTimeStamps] = useState<TimeStamp[]>([]);

  useEffect(() => {
    window.python
      .readJsonFile(path)
      .then((data) => {
        const obj = data as { timeStamps: TimeStamp[] };
        setTimeStamps(obj.timeStamps);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [path]);

  console.log(timeStamps);

  if (!timeStamps || timeStamps.length === 0) {
    return null;
  }

  return (
    <div className="flex w-2/3 flex-col justify-start">
      <Button
        onClick={() => {
          console.log("Open Total Time");
          setOpen(!open);
        }}
        leftIcon={<Clock />}
        text={`Total Time: ${formatTime(
          Math.floor(
            timeStamps[timeStamps.length - 1].time - timeStamps[0].time,
          ),
        )}`}
        rightIcon={open ? <ChevronUp /> : <ChevronDown />}
      />
      {open && (
        <div className="flex flex-col gap-2 p-2">
          {timeStamps.map((step, index) => {
            if (index === 0) {
              return null;
            }
            return (
              <div key={index} className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Check
                    className="rounded bg-accent text-background"
                    size={20}
                  />
                  {step.name}
                </div>
                <div className="flex min-w-28 items-center justify-start gap-2">
                  <Clock size={20} />
                  {formatTime(
                    Math.floor(step.time - timeStamps[index - 1].time),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const isValidFileName = (name: string) => {
  const condition =
    name.length > 0 &&
    !name.includes("/") &&
    !name.includes("\\") &&
    !name.includes(":") &&
    !name.includes("*") &&
    !name.includes("?") &&
    !name.includes('"') &&
    !name.includes("<") &&
    !name.includes(">") &&
    !name.includes("|");
  return condition;
};

export default function ResultsPage() {
  const [resultsDir, setResultsDir] = useState<string | undefined>(undefined);
  const [runName, setRunName] = useState<string | undefined>(undefined);
  const [runNameInput, setRunNameInput] = useState<string | undefined>(
    undefined,
  );
  const [editingRunName, setEditingRunName] = useState(false);
  const [showInputError, setShowInputError] = useState(false);
  const [args, setArgs] = useState<Args | undefined>(undefined);
  const [clusterAssignmentsModalOpen, setClusterAssignmentsModalOpen] =
    useState(false);
  const [clusterSimilarityModalOpen, setClusterSimilarityModalOpen] =
    useState(false);
  const [outliersModalOpen, setOutliersModalOpen] = useState(false);
  const [mergedClustersModalOpen, setMergedClustersModalOpen] = useState(false);

  useEffect(() => {
    window.python
      .getResultsDir()
      .then((resultsDir) => {
        console.log(`Results dir: ${resultsDir}`);
        setResultsDir(resultsDir);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    window.python
      .getRunName()
      .then((runName) => {
        console.log(`Run name: ${runName}`);
        setRunName(runName);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [resultsDir]);

  useEffect(() => {
    if (!resultsDir) return;
    try {
      window.python
        .readJsonFile(`${resultsDir}/args.json`)
        .then((args) => {
          console.log(args);
          setArgs(args as Args);
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (err) {
      console.error(err);
    }
  }, [resultsDir]);

  if (!args || !resultsDir) {
    return (
      <>
        <TitleBar index={4} />
        <div id="mainContent" className="flex flex-col justify-start px-32">
          <h1 className="text-4xl">{runName}</h1>
          <div className="flex items-center justify-center gap-4">
            <p className="py-2 text-xl font-semibold text-primary">
              No clustering process started.
            </p>
          </div>
        </div>
      </>
    );
  }

  console.log(args);

  return (
    <>
      <TitleBar index={4} />
      <div id="mainContent" className="h-[90vh] w-full">
        <ClusterAssignmentModal
          path={`${resultsDir}/cluster_assignments.csv`}
          delimiter={args.fileSettings.delimiter}
          isOpen={clusterAssignmentsModalOpen}
          setIsOpen={setClusterAssignmentsModalOpen}
        />
        <ClusterSimilarityModal
          similaritiesPath={`${resultsDir}/pairwise_similarities.json`}
          clusterAssignmentsPath={`${resultsDir}/cluster_assignments.csv`}
          delimiter={args.fileSettings.delimiter}
          isOpen={clusterSimilarityModalOpen}
          setIsOpen={setClusterSimilarityModalOpen}
        />
        {(!args.algorithmSettings.advancedOptions.nearestNeighbors ||
          !args.algorithmSettings.advancedOptions.zScoreThreshold) && (
          <OutliersModal
            path={`${resultsDir}/outliers.json`}
            nearestNeighbors={
              args.algorithmSettings.advancedOptions.nearestNeighbors
            }
            zScoreThreshold={
              args.algorithmSettings.advancedOptions.zScoreThreshold
            }
            isOpen={outliersModalOpen}
            setIsOpen={setOutliersModalOpen}
          />
        )}
        {!args.algorithmSettings.advancedOptions.similarityThreshold && (
          <MergedClustersModal
            path={`${resultsDir}/merged_clusters.json`}
            mergeThreshold={
              args.algorithmSettings.advancedOptions.similarityThreshold
            }
            isOpen={mergedClustersModalOpen}
            setIsOpen={setMergedClustersModalOpen}
          />
        )}
        <div className="flex max-h-[90vh] flex-col items-start justify-start gap-8 overflow-y-auto px-32 pt-8">
          <div className="flex w-full flex-col justify-start gap-2">
            <div className="flex w-full items-center gap-4">
              {editingRunName ? (
                <input
                  value={runNameInput}
                  onChange={(e) => setRunNameInput(e.target.value)}
                  className="rounded-md border border-secondary p-2 pl-5 text-4xl font-bold focus:outline-none focus:ring focus:ring-secondary focus:ring-opacity-50 disabled:border-gray-300"
                />
              ) : (
                <h1 className="text-ellipsis p-2 pl-5 text-4xl">{runName}</h1>
              )}
              {editingRunName ? (
                <button
                  onClick={() => {
                    if (!runNameInput) return;
                    if (runNameInput === runName) {
                      setEditingRunName(false);
                      return;
                    }
                    if (!isValidFileName(runNameInput)) {
                      setShowInputError(true);
                      return;
                    }
                    window.python.setRunName(runNameInput);
                    setRunName(runNameInput);
                    setEditingRunName(false);
                  }}
                >
                  <Save className="text-secondary" size={32} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingRunName(true);
                    setRunNameInput(runName);
                  }}
                >
                  <Pencil className="text-secondary" size={32} />
                </button>
              )}
            </div>
            {showInputError && (
              <p className="text-red-500">Input is not a valid file name</p>
            )}
            <div className="flex items-center gap-2 pb-2 text-accent">
              <CheckCheck className="rounded bg-background" size={24} />
              <p className="text-xl font-semibold">
                Your results have been saved.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-8">
            {/* I think the extra dir button is a bit unnecessary. */}
            {/* <Button
              onClick={() =>
                window.python.openResultsDir().then((errorMessage) => {
                  if (errorMessage) {
                    console.error(
                      "Error opening output directory",
                      errorMessage,
                    );
                  }
                })
              }
              leftIcon={<Folder />}
              text="Results Folder"
              className="w-2/3"
            /> */}
            <Button
              onClick={() =>
                window.python.showItemInFolder(resultsDir + "/output.csv")
              }
              text="Updated Input File"
              leftIcon={<FileText />}
              className="w-2/3"
            />
            <Button
              onClick={() => setClusterAssignmentsModalOpen(true)}
              text="Cluster Assignments"
              leftIcon={<List />}
              className="w-2/3"
            />
            <Button
              onClick={() => setClusterSimilarityModalOpen(true)}
              text="Cluster Similarities"
              leftIcon={<GitCompare />}
              className="w-2/3"
            />
            <Button
              onClick={() => setOutliersModalOpen(true)}
              text="Outliers"
              leftIcon={<AlertTriangle />}
              className="w-2/3"
              disabled={
                !args.algorithmSettings.advancedOptions.nearestNeighbors ||
                !args.algorithmSettings.advancedOptions.zScoreThreshold
              }
            />
            <Button
              onClick={() => setMergedClustersModalOpen(true)}
              text="Merged Clusters"
              leftIcon={<GitMerge />}
              className="w-2/3"
              disabled={
                !args.algorithmSettings.advancedOptions.similarityThreshold
              }
            />
            <TotalTimeDropdown path={`${resultsDir}/timestamps.json`} />
          </div>
        </div>
      </div>
    </>
  );
}
