import { Sigma, ArrowLeft, ArrowRight, Minus, X, Square } from "lucide-react";
import { Link } from "react-router-dom";

const routes = [
  "",
  "file",
  "file_preview",
  "algorithm_settings",
  "clustering",
  "results",
];

export function Header({ index }: { index: number }) {
  return (
    <div className="draggable flex h-16 items-center justify-between border-b-4 border-accent p-4 text-text">
      <Link to={"/"} className="no-drag">
        <Sigma size={32} />
      </Link>
      <div className="flex items-center">
        <Link
          to={index > 0 ? `/${routes[index - 1]}` : `/${routes[0]}`}
          className="no-drag"
        >
          <ArrowLeft size={24} />
        </Link>
        <Link
          to={
            index < routes.length - 1
              ? `/${routes[index + 1]}`
              : `/${routes[routes.length - 1]}`
          }
          className="no-drag"
        >
          <ArrowRight size={24} />
        </Link>
      </div>
      <div className="flex">
        <Link to={"/file"} className="no-drag">
          <div className="flex flex-col">
            <p className="px-2">File Selection</p>
            {index >= 1 ? (
              <div className="mx-1 h-1 rounded bg-primary"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-primary opacity-25"></div>
            )}
          </div>
        </Link>
        <Link to={"/file_preview"} className="no-drag">
          <div className="flex flex-col">
            <p className="px-2">File Preview</p>
            {index >= 2 ? (
              <div className="mx-1 h-1 rounded bg-primary"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-primary opacity-25"></div>
            )}
          </div>
        </Link>
        <Link to={"/algorithm_settings"} className="no-drag">
          <div className="flex flex-col">
            <p className="px-2">Algorithm Settings</p>
            {index >= 3 ? (
              <div className="mx-1 h-1 rounded bg-primary"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-primary opacity-25"></div>
            )}
          </div>
        </Link>
        <Link to={"/clustering"} className="no-drag">
          <div className="flex flex-col">
            <p className="px-2">Progress</p>
            {index >= 4 ? (
              <div className="mx-1 h-1 rounded bg-primary"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-primary opacity-25"></div>
            )}
          </div>
        </Link>
        <Link to={"/results"} className="no-drag">
          <div className="flex flex-col">
            <p className="px-2">Results</p>
            {index >= 5 ? (
              <div className="mx-1 h-1 rounded bg-primary"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-primary opacity-25"></div>
            )}
          </div>
        </Link>
      </div>
      <div id="tutorial-mode"></div>
      <div className="flex items-center gap-2">
        <button onClick={window.control.minimize}>
          <Minus size={24} />
        </button>
        <button onClick={window.control.maximize}>
          <Square size={24} />
        </button>
        <button onClick={window.control.close}>
          <X size={24} />
        </button>
      </div>
    </div>
  );
}
