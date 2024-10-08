import { Settings, X, Undo, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Toggle from "./Toggle";
import Button from "./Button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipContentContainer,
} from "./Tooltip";

const routes = [
  "",
  "file_preview",
  "algorithm_settings",
  "progress",
  "results",
];

function SettingsModal({
  isOpen,
  setIsOpen,
  tutorialMode,
  setTutorialMode,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tutorialMode: boolean;
  setTutorialMode: (state: boolean) => void;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    window.darkMode.get().then((isDark) => {
      setDark(isDark);
    });
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 top-[60px] z-40 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-4xl rounded-lg bg-backgroundColor shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b p-6">
          <h2 className="text-3xl font-semibold">Settings</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-textColor focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        <div className="flex flex-col gap-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Toggle tutorial mode</h3>
              <p>Whether you want additonal explanations.</p>
            </div>
            <div className="flex items-center gap-4">
              <Toggle
                onToggle={(state) => {
                  setTutorialMode(state);
                }}
                initialState={tutorialMode}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Toggle dark mode</h3>
              <p>Whether you want to use light or dark mode.</p>
            </div>
            <div className="flex items-center gap-4">
              <Toggle
                onToggle={(state) => {
                  window.darkMode.toggle();
                  setDark(state);
                }}
                initialState={dark}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Reset to system theme</h3>
              <p>Click to reset the theme to the system settings.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                text="Reset"
                onClick={() => {
                  window.darkMode.system();
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TitleBar({
  index,
  resetState,
  tutorialState,
}: {
  index: number;
  resetState?: () => void;
  tutorialState: {
    tutorialMode: boolean;
    setTutorialMode: (state: boolean) => void;
  };
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const enableSettings = false;

  return (
    <div
      id="titleBarContainer"
      className="dark:dark absolute z-30 w-full bg-backgroundColor text-textColor"
    >
      <SettingsModal
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        tutorialMode={tutorialState.tutorialMode}
        setTutorialMode={tutorialState.setTutorialMode}
      />
      <div
        id="titleBar"
        className="draggable absolute top-0 flex h-full select-none items-center justify-between border-accentColor pl-8"
      >
        <Tooltip offsetValue={10}>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <TooltipContentContainer
              tutorialMode={tutorialState.tutorialMode}
              small
            >
              <p className="text-left">
                Click to return to the beginning of the process.
              </p>
            </TooltipContentContainer>
          </TooltipContent>
        </Tooltip>
        <Tooltip offsetValue={14} placement="bottom">
          <TooltipTrigger asChild>
            {index > 0 ? (
              <Link
                to={`/${routes[index - 1] === "progress" ? routes[index - 2] : routes[index - 1]}`}
                className="no-drag rounded p-1 hover:bg-background-50"
                onClick={resetState}
              >
                <Undo size={24} />
              </Link>
            ) : (
              <div className="rounded p-1 opacity-25">
                <Undo size={24} />
              </div>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <TooltipContentContainer
              tutorialMode={tutorialState.tutorialMode}
              small
            >
              <p className="text-left">
                Click to go back to the previous step.
              </p>
            </TooltipContentContainer>
          </TooltipContent>
        </Tooltip>
        <div className="flex">
          <div className="flex flex-col">
            <p className="px-2">File Selection</p>
            {index >= 0 ? (
              <div className="mx-1 h-1 rounded bg-accentColor"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accentColor opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">File Preview</p>
            {index >= 1 ? (
              <div className="mx-1 h-1 rounded bg-accentColor"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accentColor opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">Algorithm Settings</p>
            {index >= 2 ? (
              <div className="mx-1 h-1 rounded bg-accentColor"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accentColor opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">Progress</p>
            {index >= 3 ? (
              <div className="mx-1 h-1 rounded bg-accentColor"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accentColor opacity-25"></div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="px-2">Results</p>
            {index >= 4 ? (
              <div className="mx-1 h-1 rounded bg-accentColor"></div>
            ) : (
              <div className="mx-1 h-1 rounded bg-accentColor opacity-25"></div>
            )}
          </div>
        </div>
        <div id="tutorial-mode" className="flex items-center">
          <button
            className="no-drag rounded p-1 hover:bg-background-50"
            onClick={() =>
              tutorialState.setTutorialMode(!tutorialState.tutorialMode)
            }
          >
            <Tooltip offsetValue={16}>
              <TooltipTrigger asChild>
                <GraduationCap
                  size={28}
                  className={` ${tutorialState.tutorialMode ? "text-accentColor" : "text-gray-300"} `}
                />
              </TooltipTrigger>
              <TooltipContent>
                <TooltipContentContainer tutorialMode={true} small>
                  <p className="text-left">
                    Click to {tutorialState.tutorialMode ? "hide" : "show"}{" "}
                    additional explanations.
                  </p>
                </TooltipContentContainer>
              </TooltipContent>
            </Tooltip>
          </button>
        </div>
        {enableSettings && (
          <div id="settings" className="flex items-center">
            <button onClick={() => setIsSettingsOpen(true)}>
              <Settings size={28} />
            </button>
          </div>
        )}
        <div></div>
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
