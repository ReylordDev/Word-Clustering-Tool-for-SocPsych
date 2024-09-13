import { useNavigate } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { useState, useEffect } from "react";
import { Clock, Check, Square, TriangleAlert, FileClock } from "lucide-react";
import { formatTime } from "../utils";
import IndeterminateLoadingBar from "./IndeterminateLoadingBar";
import Button from "./Button";

// Potential improvement: Sync this with the python code
const progression_messages: { [key: string]: string } = {
  process_input_file: "Reading input file",
  download_model: "Downloading language model",
  load_model: "Loading language model",
  embed_responses: "Embedding responses",
  detect_outliers: "Detecting outliers",
  find_number_of_clusters: "Finding number of clusters",
  cluster: "Clustering",
  merge: "Merging clusters",
  results: "Saving clustering results",
};

export default function ProgressPage({
  startTime,
  tutorialState,
}: {
  startTime: number | null;
  tutorialState: {
    tutorialMode: boolean;
    setTutorialMode: (mode: boolean) => void;
  };
}) {
  const [complete, setComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [pendingTasks, setPendingTasks] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<[string, number] | null>(null);
  const [completedTasks, setCompletedTasks] = useState<[string, number][]>([]);
  const [currentTaskTimer, setCurrentTaskTimer] = useState<number>(0);
  const [errorEncountered, setErrorEncountered] = useState(false);
  const navigate = useNavigate();
  const [logsPath, setLogsPath] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (complete) {
      navigate("/results");
    }
  }, [complete]);

  useEffect(() => {
    window.python.getLogsPath().then((path) => {
      setLogsPath(path);
    });
  }, [logsPath]);

  useEffect(() => {
    let currentTaskInterval: NodeJS.Timeout;
    const interval = setInterval(() => {
      window.python.pollRunStatus().then((run) => {
        if (run.status === "COMPLETED") {
          setComplete(true);
          clearInterval(interval);
        } else if (run.status === "ERROR") {
          setErrorEncountered(true);
          clearInterval(interval);
        }
        const progress = run.progress;
        setPendingTasks(progress.pendingTasks);
        if (progress.currentTask) {
          clearInterval(currentTaskInterval);
          currentTaskInterval = setInterval(() => {
            if (progress.currentTask)
              setCurrentTaskTimer(
                Math.floor((Date.now() - progress.currentTask[1]) / 1000),
              );
            else {
              clearInterval(currentTaskInterval);
            }
          }, 500);
        }
        setCurrentTask(progress.currentTask);
        setCompletedTasks(progress.completedTasks);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!startTime) {
    return (
      <>
        <TitleBar index={3} tutorialState={tutorialState} />
        <div
          id="mainContent"
          className="dark:dark flex flex-col items-center justify-start gap-4 bg-backgroundColor px-24"
        >
          <div className="mt-24 flex w-full justify-center p-8">
            <h1 className="text-4xl">No Clustering in Progress</h1>
          </div>
        </div>
      </>
    );
  }

  if (errorEncountered) {
    return (
      <>
        <TitleBar index={3} tutorialState={tutorialState} />
        <div
          id="mainContent"
          className="dark:dark flex flex-col items-center justify-start gap-4 bg-backgroundColor px-24"
        >
          <div className="mt-24 flex w-full justify-center p-4">
            <div className="flex items-center gap-2">
              <TriangleAlert size={32} className="text-red-600" />
              <h1 className="text-4xl">Error Encountered</h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p>
              Try again or check the logs for more information on the error
              encountered.
            </p>
            <Button
              onClick={() => window.python.showItemInFolder(logsPath || "")}
              disabled={!logsPath}
              text="View Logs"
              leftIcon={<FileClock />}
            />
          </div>
        </div>
      </>
    );
  }

  console.log(completedTasks);

  return (
    <>
      <TitleBar index={3} tutorialState={tutorialState} />
      <div
        id="mainContent"
        className="dark:dark flex flex-col items-center justify-start gap-4 bg-backgroundColor px-24 text-textColor"
      >
        <div className="flex w-full items-center justify-between p-8">
          <h1 className="text-4xl">Clustering in Progress</h1>
          <div className="flex items-center justify-start gap-2">
            <Clock size={32} />
            <p className="text-right text-xl">{formatTime(timeElapsed)}</p>
          </div>
        </div>
        <div className="flex min-w-[500px] flex-col justify-start gap-4 p-4">
          <div className="flex w-full flex-col gap-2">
            {completedTasks.map((message, index) => {
              const previousTime = completedTasks[index - 1]
                ? completedTasks[index - 1][1]
                : startTime;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Check
                      size={24}
                      className="rounded bg-text-800 text-backgroundColor"
                    />
                    <div className="text-lg line-through">
                      {progression_messages[message[0]]}
                    </div>
                  </div>
                  <div className="flex justify-start gap-2">
                    <Clock />
                    <p className="min-w-28">
                      {formatTime(
                        Math.floor((message[1] - previousTime) / 1000),
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {currentTask && (
            <div className="flex flex-col justify-start gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Square
                    size={24}
                    className="rounded border-2 border-primaryColor bg-backgroundColor text-backgroundColor"
                  />
                  <div className="text-lg">
                    {progression_messages[currentTask[0]]}
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <Clock className="text-primaryColor" />
                  <p className="min-w-28">{formatTime(currentTaskTimer)}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col justify-start gap-2">
            {pendingTasks.map((message, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex gap-4">
                  <Check
                    size={24}
                    className="rounded border-2 border-text-800 bg-backgroundColor text-backgroundColor"
                  />
                  <div className="text-lg">{progression_messages[message]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full px-24">
          <IndeterminateLoadingBar />
        </div>
        <p className="text-md px-24 text-center opacity-75">
          Hint: Before using a model for the first time, a time-intensive
          download has to be completed during the model-loading step.
        </p>
      </div>
    </>
  );
}
