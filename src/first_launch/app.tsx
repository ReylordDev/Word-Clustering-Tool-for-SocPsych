import { useEffect, useState } from "react";
import IndeterminateLoadingBar from "../components/IndeterminateLoadingBar";
import Button from "../components/Button";
import { FileClock, AlertTriangle } from "lucide-react";

// This is the window that shows while the defalt model is being downloaded.
export default function App() {
  const [error, setError] = useState(false);
  const [logsPath, setLogsPath] = useState<string | null>(null);

  useEffect(() => {
    window.python.getLogsPath().then((path) => {
      setLogsPath(path);
    });
  }, [logsPath]);

  window.firstLaunch.onError(() => {
    setError(true);
  });

  if (error) {
    return (
      <div className="draggable flex h-screen w-screen flex-col items-center justify-center gap-8 bg-backgroundColor p-24 text-textColor">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={32} />
          <h1 className="text-3xl font-bold">
            Error downloading default model
          </h1>
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
            className="no-drag"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="draggable flex h-screen w-screen flex-col items-center justify-center gap-8 bg-backgroundColor p-24 text-textColor">
      <h1 className="text-3xl font-bold">
        Downloading default model... (1.24 GB)
      </h1>
      <div className="flex flex-col items-center gap-4">
        <p>This may take a while depending on your internet connection.</p>
        <p>
          This step only happens once, the next time you open the app it will be
          much faster.
        </p>
      </div>
      <IndeterminateLoadingBar />
    </div>
  );
}
