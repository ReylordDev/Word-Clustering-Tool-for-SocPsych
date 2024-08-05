import { Link } from "react-router-dom";
import { Header } from "./Header";
import { useState } from "react";

export default function AlgorithmSettingsPage() {
  const [autoChooseClusters, setAutoChooseClusters] = useState(true);
  const [maxClusters, setMaxClusters] = useState(10);
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [seed, setSeed] = useState(0);

  const submitAlgorithmSettings = () => {
    console.log("Submitting settings...");
    window.python.setAlgorithmSettings(
      autoChooseClusters,
      maxClusters,
      excludedWords,
      seed,
    );
  };

  return (
    <>
      <Header>
        <h1>Algorithm Settings</h1>
      </Header>
      <div className="flex flex-col justify-start bg-blue-300 px-24">
        <div className="flex flex-col gap-8 bg-red-300">
          <div></div>
          <div className="h-1 w-full bg-accent"></div>
          <div className="flex items-center justify-between pr-4">
            <h5>Automatically choose number of clusters</h5>
            <input
              type="checkbox"
              checked={autoChooseClusters}
              onChange={() => setAutoChooseClusters(!autoChooseClusters)}
            />
          </div>
          <div className="flex items-center justify-between pr-4">
            <h5>Max clusters</h5>
            <input
              type="number"
              value={maxClusters}
              onChange={(e) => setMaxClusters(parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between pr-4">
            <h5>Excluded Words</h5>
            <button
              onClick={() => console.log("edit")}
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
          <div>Show Advanced Options</div>
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
