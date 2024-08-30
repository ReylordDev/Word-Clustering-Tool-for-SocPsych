import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const routes = [
  "",
  "file_preview",
  "algorithm_settings",
  "clustering",
  "results",
];

export function TitleBar({ index }: { index: number }) {
  return (
    <div id="titleBarContainer" className="absolute w-full text-text">
      <div
        id="titleBar"
        className="draggable absolute top-0 flex h-full select-none items-center justify-between border-accent pl-8"
      >
        <Link to={"/"} className="no-drag flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--background)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="7.2"
              cy="14.4"
              r="6"
              fill={
                index % 3 === 0
                  ? `var(--accent)`
                  : index % 3 === 1
                    ? `var(--primary)`
                    : `var(--secondary)`
              }
            />
            <circle
              cx="16.8"
              cy="14.4"
              r="6"
              fill={
                index % 3 === 0
                  ? `var(--secondary)`
                  : index % 3 === 1
                    ? `var(--accent)`
                    : `var(--primary)`
              }
            />
            <circle
              cx="12"
              cy="7.2"
              r="6"
              fill={
                index % 3 === 0
                  ? `var(--primary)`
                  : index % 3 === 1
                    ? `var(--secondary)`
                    : `var(--accent)`
              }
            />
          </svg>
        </Link>
        <div className="flex items-center">
          {index > 0 ? (
            <Link
              to={`/${routes[index - 1]}`}
              className="no-drag rounded p-1 hover:bg-gray-300"
            >
              <ArrowLeft size={24} />
            </Link>
          ) : (
            <div className="rounded p-1 opacity-25">
              <ArrowLeft size={24} />
            </div>
          )}

          {index < routes.length - 1 ? (
            <Link
              to={`/${routes[index + 1]}`}
              className="no-drag rounded p-1 hover:bg-gray-300"
            >
              <ArrowRight size={24} />
            </Link>
          ) : (
            <div className="rounded p-1 opacity-25">
              <ArrowRight size={24} />
            </div>
          )}
        </div>
        <div className="flex">
          <div className="flex flex-col">
            <p className="px-2">File Selection</p>
            {index >= 0 ? (
              <div className="mx-1 h-1 rounded bg-accent"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accent opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">File Preview</p>
            {index >= 1 ? (
              <div className="mx-1 h-1 rounded bg-accent"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accent opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">Algorithm Settings</p>
            {index >= 2 ? (
              <div className="mx-1 h-1 rounded bg-accent"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accent opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">Progress</p>
            {index >= 3 ? (
              <div className="mx-1 h-1 rounded bg-accent"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accent opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">Results</p>
            {index >= 4 ? (
              <div className="mx-1 h-1 rounded bg-accent"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accent opacity-25"></div>
            )}
          </div>
        </div>
        <div id="tutorial-mode"></div>
        {/* <div className="flex items-center gap-4">
          <button onClick={window.control.minimize}>
            <Minus size={28} />
          </button>
          <button onClick={window.control.maximize}>
            <Square size={28} />
          </button>
          <button onClick={window.control.close}>
            <X size={28} />
          </button>
        </div> */}
      </div>
    </div>
  );
}
