import { TitleBar } from "./TitleBar";
import {
  Clock,
  Check,
  ChevronUp,
  ChevronDown,
  Folder,
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
import { useLocation } from "react-router-dom";

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

export default function ResultsPage() {
  const [resultsDir, setResultsDir] = useState<string | undefined>(undefined);
  const [args, setArgs] = useState<Args | undefined>(undefined);
  const [clusterAssignmentsModalOpen, setClusterAssignmentsModalOpen] =
    useState(false);
  const [clusterSimilarityModalOpen, setClusterSimilarityModalOpen] =
    useState(false);
  const [outliersModalOpen, setOutliersModalOpen] = useState(false);
  const [mergedClustersModalOpen, setMergedClustersModalOpen] = useState(false);

  if (!resultsDir) {
    const state = useLocation().state;
    if (state && state.resultsDir) {
      setResultsDir(state.resultsDir);
    }
  }

  useEffect(() => {
    window.python
      .getResultsDir()
      .then((dir) => {
        if (dir) setResultsDir(dir);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

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
          <h1 className="text-5xl">Results</h1>
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
        <MergedClustersModal
          path={`${resultsDir}/merged_clusters.json`}
          mergeThreshold={
            args.algorithmSettings.advancedOptions.similarityThreshold
          }
          isOpen={mergedClustersModalOpen}
          setIsOpen={setMergedClustersModalOpen}
        />
        <div className="flex max-h-[90vh] flex-col items-start justify-start gap-8 overflow-y-auto px-32 pt-8">
          <div className="flex flex-col justify-start gap-2">
            <h1 className="text-5xl">Results</h1>
            <div className="flex items-center gap-2 pb-2 text-accent">
              <CheckCheck className="rounded bg-background" size={24} />
              <p className="text-xl font-semibold">
                Your results have been saved.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-8">
            <Button
              onClick={() =>
                window.python
                  .openResultsDir(resultsDir)
                  .then((errorMessage) => {
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
            />
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
