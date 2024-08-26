import { Link } from "react-router-dom";
import { Header } from "./Header";
import { useState, useEffect } from "react";
import { Clock, Check, Square } from "lucide-react";
import { formatTime } from "../utils";

export default function ProgressPage({
  startTime,
}: {
  startTime: number | null;
}) {
  startTime = 1724679359899;
  const [complete, setComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [progress, setProgress] = useState<{
    todoMessages: string[];
    progressMessages: string[];
    completedMessages: string[];
  }>({
    todoMessages: [],
    progressMessages: [],
    completedMessages: [],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Poll the backend here
      window.python.pollClusterProgress().then((progress) => {
        console.log(progress);
        setProgress(progress);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!startTime) {
    return (
      <>
        <Header index={4} />
        <div className="flex flex-col items-center justify-start gap-4 px-24">
          <div className="mt-24 flex w-full justify-center p-8">
            <h1 className="text-4xl">No Clustering in Progress</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header index={4} />
      <div className="flex flex-col items-center justify-start gap-4 px-24">
        <div className="flex w-full items-center justify-between p-8">
          <h1 className="text-4xl">Clustering in Progress</h1>
          <div className="flex items-center justify-start gap-2">
            <Clock size={32} />
            <p className="text-right text-xl">{formatTime(timeElapsed)}</p>
          </div>
        </div>
        <div className="flex flex-col justify-start gap-4">
          <div className="flex flex-col justify-start gap-2">
            {progress.completedMessages.map((message, index) => (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Check
                    size={24}
                    className="rounded bg-slate-800 text-background"
                  />
                  <div key={index} className="text-lg line-through">
                    {message}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-start gap-2">
            {progress.todoMessages.map((message, index) => (
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <Check
                    size={24}
                    className="rounded border-2 border-slate-800 bg-background text-background"
                  />
                  <div key={index} className="text-lg">
                    {message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>Loading Bar</div>
        <div>Hints</div>
      </div>
    </>
  );
}
