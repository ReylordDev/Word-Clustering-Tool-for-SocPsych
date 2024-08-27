import { Header } from "./Header";
import {
  Clock,
  Check,
  ChevronUp,
  ChevronDown,
  Folder,
  File,
  Maximize2,
  X,
  AlertCircle,
} from "lucide-react";
import Button from "./Button";
import { useState, useEffect } from "react";
import { formatTime } from "../utils";

function OutliersModal({
  path,
  nearest_neighbors,
  modalIsOpen: isOpen,
  setModalIsOpen: setIsOpen,
}: {
  path: string;
  nearest_neighbors: number;
  modalIsOpen: boolean;
  setModalIsOpen: (isOpen: boolean) => void;
}) {
  const [outliers, setOutliers] = useState<
    { response: string; similarity: number }[]
  >([]);
  const [threshold, setThreshold] = useState<number>(0.95);
  const precision = 3;

  useEffect(() => {
    window.python.readJsonFile(path).then((value: unknown) => {
      const data = value as {
        response: string;
        similarity: number;
        threshold: number;
      }[];
      setOutliers(
        data.map((outlier) => ({
          response: outlier.response,
          similarity: outlier.similarity,
        })),
      );
      setThreshold(data[0].threshold);
    });
  }, []);

  const OutlierCard = ({
    outlier,
  }: {
    outlier: { response: string; similarity: number };
    threshold: number;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = outlier.response.length > 68;

    return (
      <div className="rounded-lg border border-dashed border-accent p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-accent" size={20} />
          <div className="flex-grow">
            <p
              className={`${shouldTruncate && !isExpanded ? "line-clamp-2" : ""}`}
            >
              "{outlier.response}"
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 flex items-center text-sm text-blue-500"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Read more</span>
                  </>
                )}
              </button>
            )}
            <div className="mt-2 flex justify-between px-2 text-sm">
              <p>
                Similarity:{" "}
                <span className="font-semibold">
                  {outlier.similarity.toFixed(precision)}
                </span>
              </p>
              <p>
                Threshold:{" "}
                <span className="font-semibold">
                  {threshold.toFixed(precision)}
                </span>
              </p>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="h-2.5 rounded-full bg-accent"
                style={{
                  width: `${(outlier.similarity / threshold) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-3xl font-semibold">Response Outliers</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-text focus:outline-none"
              >
                <X size={36} />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
              {outliers.map((outlier, index) => (
                <OutlierCard
                  key={index}
                  outlier={outlier}
                  threshold={threshold}
                />
              ))}
            </div>
            <div className="rounded-b-lg border-t px-6 py-4">
              <p>
                Displaying{" "}
                <span className="font-semibold">{outliers.length}</span> outlier
                responses.<br></br> These responses have a lower similarity to
                their <span className="font-semibold">{nearest_neighbors}</span>{" "}
                nearest neighbors compared to the threshold.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TotalTimeDropdown({
  processSteps,
  startTime,
}: {
  processSteps: { name: string; time: number }[];
  startTime: number;
}) {
  const [open, setOpen] = useState(false);

  if (processSteps.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col justify-start">
      <div className="flex w-full items-center justify-between">
        <p>Total Time</p>
        <Button
          primary={false}
          onClick={() => {
            console.log("Open Total Time");
            setOpen(!open);
          }}
          leftIcon={<Clock />}
          text={formatTime(
            Math.floor(
              (processSteps[processSteps.length - 1].time - startTime) / 1000,
            ),
          )}
          rightIcon={open ? <ChevronDown /> : <ChevronUp />}
        />
      </div>
      {open && (
        <div className="flex flex-col gap-1 p-4 pl-8">
          {processSteps.map((step, index) => {
            const previousTime =
              index > 0 ? processSteps[index - 1].time : startTime;
            return (
              <div key={index} className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Check
                    className="rounded bg-slate-800 text-background"
                    size={20}
                  />
                  {step.name}
                </div>
                <div className="flex min-w-28 items-center gap-2">
                  <Clock size={20} />
                  {formatTime(Math.floor((step.time - previousTime) / 1000))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage({
  outputDir = "./outputs/example_short",
  startTime,
  nearest_neighbors,
}: {
  outputDir: string;
  startTime: number | null;
  nearest_neighbors: number;
}) {
  const [outliersModalOpen, setOutliersModalOpen] = useState(false);
  const [processSteps, setProcessSteps] = useState<
    { name: string; time: number }[]
  >([]);
  useEffect(() => {
    window.python.pollClusterProgress().then((progress) => {
      progress.completedTasks.map((task) => {
        setProcessSteps((prev) => [...prev, { name: task[0], time: task[1] }]);
      });
    });
  }, []);

  if (!startTime) {
    return (
      <>
        <Header index={5} />
        <div className="my-8" />
        <div className="flex flex-col justify-start px-32">
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

  return (
    <>
      <OutliersModal
        path={`${outputDir}/outliers.json`}
        nearest_neighbors={nearest_neighbors}
        modalIsOpen={outliersModalOpen}
        setModalIsOpen={setOutliersModalOpen}
      />
      <Header index={5} />
      <div className="my-8" />
      <div className="flex flex-col items-start justify-start gap-4 px-32">
        <h1 className="text-5xl">Results</h1>
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <p className="py-2 text-xl font-semibold text-primary">
              Your results have been saved.
            </p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Folder");
              }}
              rightIcon={<Folder />}
              text="Open Folder"
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Updated Input File</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Updated Input File");
              }}
              text="View File"
              rightIcon={<File />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Cluster Assignments</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Cluster Assignments");
              }}
              text="View Table"
              rightIcon={<Maximize2 />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Pairwise Cluster Similarities</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Pairwise Cluster Similarities");
              }}
              text="View Table"
              rightIcon={<Maximize2 />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Outlier Responses</p>
            <Button
              primary={false}
              onClick={() => {
                setOutliersModalOpen(true);
              }}
              text="View List"
              rightIcon={<Maximize2 />}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <p>Merged Clusters</p>
            <Button
              primary={false}
              onClick={() => {
                console.log("Open Merged Clusters");
              }}
              text="View List"
              rightIcon={<Maximize2 />}
            />
          </div>
          <TotalTimeDropdown
            processSteps={processSteps}
            startTime={startTime}
          />
        </div>
      </div>
    </>
  );
}
