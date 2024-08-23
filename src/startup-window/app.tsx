import { useEffect, useState } from "react";

type Status = "success" | "failure" | "unknown" | "progress";

function MessagesModal({
  messages,
  modalIsOpen,
  setModalIsOpen,
}: {
  messages: string[];
  modalIsOpen: boolean;
  setModalIsOpen: (isOpen: boolean) => void;
}) {
  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <>
      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-12 max-h-[80vh] overflow-y-auto overflow-x-clip rounded-lg border-2 border-accent bg-white p-12">
            <button
              className="absolute right-8 top-8 rounded-full border-2 border-accent bg-background p-2"
              onClick={closeModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex flex-col gap-2">
              {messages.map((message, index) => (
                <>
                  {message.includes("ERROR") ? (
                    <p key={index} className="font-bold text-red-800">
                      {message}
                    </p>
                  ) : (
                    <p key={index}>{message}</p>
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PythonStatus() {
  const [pythonExists, setPythonExists] = useState<Status>("unknown");
  useEffect(() => {
    window.python.isPythonInstalled().then((result) => {
      result ? setPythonExists("success") : setPythonExists("failure");
    });
  }, []);
  switch (pythonExists) {
    case "unknown":
      return (
        <div className="flex items-center gap-4 p-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 flex-grow-0"
          ></svg>
          <p>Checking Python installation...</p>
        </div>
      );
    case "progress":
      return (
        <div className="flex items-center gap-4 p-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 flex-grow-0 animate-spin"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <p>Checking Python installation...</p>
        </div>
      );
    case "success":
      return (
        <div className="flex items-center gap-4 p-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 flex-grow-0 text-green-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          <p>Python is installed</p>
        </div>
      );
    case "failure":
      return (
        <div className="flex flex-col items-start justify-center gap-2 p-4">
          <div className="flex items-center gap-4 text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-red-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>

            <p>Python is not installed!</p>
          </div>
          <div className="flex items-center gap-4 text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <p>
              Please install Python 3.7 or newer from{" "}
              {/* Todo: Turn into a button and handle the opening of the browser from the main process */}
              <a
                href="https://www.python.org/downloads/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-blue-500 underline">python.org</span>
              </a>
            </p>
          </div>
        </div>
      );
    default:
      return <div></div>;
  }
}

function MinimalPythonVersion() {
  const [hasMinimalPythonVersion, setHasMinimalPythonVersion] =
    useState<Status>("unknown");

  useEffect(() => {
    window.python.hasMinimalPythonVersion().then((result) => {
      if (result) {
        setHasMinimalPythonVersion("success");
        window.python.runSetupScript();
      } else {
        setHasMinimalPythonVersion("failure");
      }
    });
  }, []);

  switch (hasMinimalPythonVersion) {
    case "unknown":
      return (
        <div className="flex items-center gap-4 p-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 flex-grow-0"
          ></svg>
          <p>Checking Python version...</p>
        </div>
      );
    case "progress":
      return (
        <div className="flex items-center gap-4 p-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 flex-grow-0 animate-spin"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <p>Checking Python version...</p>
        </div>
      );
    case "success":
      return (
        <div className="flex items-center gap-4 p-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 flex-grow-0 text-green-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          <p>Python 3.7+ is installed</p>
        </div>
      );
    case "failure":
      return (
        <div className="flex flex-col items-start justify-center gap-2 p-4">
          <div className="flex items-center gap-4 text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-red-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>

            <p>Python version is outdated!</p>
          </div>
          <div className="flex items-center gap-4 text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <p>
              Please install Python 3.7 or newer from{" "}
              {/* Todo: Turn into a button and handle the opening of the browser from the main process */}
              <a
                href="https://www.python.org/downloads/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-blue-500 underline">python.org</span>
              </a>
            </p>
          </div>
        </div>
      );
    default:
      return <div></div>;
  }
}

function SetupScript({
  setupScriptMessages,
  setModalIsOpen,
}: {
  setupScriptMessages: string[];
  setModalIsOpen: (isOpen: boolean) => void;
}) {
  // stdout: Creating virtual environment in /path/to/app/.venv
  // stdout: Installing required packages...
  // stdout: Setup completed successfully. The application is ready to use.
  // Startup complete

  if (!setupScriptMessages || setupScriptMessages.length === 0) {
    return (
      <div className="flex items-center gap-4 p-4 text-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 flex-grow-0"
        ></svg>
        <p>Running setup script...</p>
      </div>
    );
  }

  const mostRecentMessage = setupScriptMessages[setupScriptMessages.length - 1];

  if (mostRecentMessage.includes("Creating virtual environment")) {
    return (
      <div className="flex items-center gap-4 p-4 text-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 flex-grow-0 animate-spin"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        <p>Setting up virtual environment...</p>
      </div>
    );
  }

  if (mostRecentMessage.includes("An error occurred")) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-4 text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 flex-grow-0 text-red-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            <p>Setup script failed</p>
          </div>
          <div>
            <button className="" onClick={() => setModalIsOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <p>
            An unexpected error occurred<br></br>
            Please check the output and open an issue on{" "}
            {/* Todo: Turn into a button and handle the opening of the browser from the main process */}
            <a
              href="https://github.com/ReylordDev/Word-Clustering-Tool-for-SocPsych/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-blue-500 underline">GitHub</span>
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  if (
    setupScriptMessages
      .map((msg) => msg.includes("Installing required packages"))
      .includes(true)
  ) {
    return (
      <>
        <div className="flex items-center gap-4 p-4 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 flex-grow-0 text-green-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          <p>Python environment set up</p>
        </div>
        <div className="flex justify-between p-4">
          <div className="flex items-center gap-4 text-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 flex-grow-0 animate-spin"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <p>Installing required packages...</p>
          </div>
          <div>
            <button className="" onClick={() => setModalIsOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>
        </div>
        <p className="px-4 text-lg text-gray-500">
          Note: this may take a while on the first launch
        </p>
      </>
    );
  }

  return <></>;
}

export default function App() {
  const [modalIsOpen, setModelIsOpen] = useState(false);
  const [setupScriptMessages, setSetupScriptMessages] = useState<string[]>([]);

  window.python.onSetupScriptMessage((event, message) => {
    console.log(message);
    setSetupScriptMessages((prevMessages) => {
      if (prevMessages.includes(message)) return prevMessages;
      if (message.includes("The application is ready to use.")) {
        window.startup.complete();
      }
      return [...prevMessages, message];
    });
  });
  return (
    <>
      <MessagesModal
        messages={setupScriptMessages}
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModelIsOpen}
      />
      <div className="p-8">
        <h1 className="">Setting up...</h1>
        <PythonStatus />
        <MinimalPythonVersion />
        <SetupScript
          setupScriptMessages={setupScriptMessages}
          setModalIsOpen={setModelIsOpen}
        />
      </div>
    </>
  );
}
