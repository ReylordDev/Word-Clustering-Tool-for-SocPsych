import { app, BrowserWindow, ipcMain, net } from "electron";
import { ChildProcess, exec, spawn } from "child_process";
import {
  AutoAlgorithmSettings,
  FileSettingsParam,
  ManualAlgorithmSettings,
} from "./models";
import squirrel from "electron-squirrel-startup";
import fs from "fs";
import path from "path";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrel) {
  app.quit();
}

const isDev = () => {
  return process.env["WEBPACK_SERVE"] === "true";
};

let rootDir = path.join(__dirname, "..", "..");
if (!isDev()) {
  rootDir = path.join(__dirname, "..", "..", "..", "..");
}
const venvPath = path.join(rootDir, ".venv");
let server: ChildProcess | undefined;
let serverPid: number | undefined;
let reloaderPid: number | undefined;
// let installerProcess: ChildProcess | undefined;
const progressMessages: string[] = [];
const completedMessages: string[] = [];

const checkPythonEnvironment = () => {
  if (!fs.existsSync(venvPath)) {
    console.error(
      "Python environment not set up. Please run the setup script first.",
    );
    // TODO: Show this to the user
    app.quit();
  }
};

// const installRequirements = async () => {
//   console.log("Installing requirements...");
//   const requirementsPath = "requirements.txt";
//   return new Promise<void>((resolve, reject) => {
//     installerProcess = exec(
//       `python3 -m pip install -r ${requirementsPath}`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error(`Error: ${error.message}`);
//           reject(error);
//           return;
//         }
//         if (stderr) {
//           console.log(stderr);
//         }
//         console.log(stdout);
//         resolve();
//       },
//     );
//     console.log(`Installer PID: ${installerProcess.pid}`);
//   });
// };

const parsePid = (data: string) => {
  // Extract the PID from the log message, e.g. "...[1234]..."
  const pidRegex = /\[(\d+)\]/;
  const match = data.toString().match(pidRegex);
  if (match) {
    return parseInt(match[1]);
  }
  return undefined;
};

const parseProgressMessage = (data: string) => {
  // Extract the progress message from the log message, e.g. "...STARTED: Reading input file..."
  const progressRegex = /STARTED: [a-zA-z\s]*[a-zA-Z]/;
  const match = data.match(progressRegex);
  if (match) {
    return match[0].replace("STARTED: ", "");
  }
  console.log(data);
  return undefined;
};

const parseCompletedMessage = (data: string) => {
  // Extract the progress message from the log message, e.g. "...COMPLETED: Reading input file..."
  const completedRegex = /COMPLETED: [a-zA-z\s]*[a-zA-Z]/;
  const match = data.match(completedRegex);
  if (match) {
    return match[0].replace("COMPLETED: ", "");
  }
  console.log(data);
  return undefined;
};

const startServer = async () => {
  console.log("Starting server...");
  let pythonPath: string;
  if (process.platform === "win32") {
    pythonPath = path.join(venvPath, "Scripts", "python.exe");
  } else {
    pythonPath = path.join(venvPath, "bin", "python");
  }
  const pythonArguments = [
    "-m",
    "uvicorn",
    "python.server:app",
    "--host",
    "127.0.0.1",
    "--port",
    "8154",
  ];
  if (isDev()) {
    // use the development server
    pythonArguments[2] = "src.python.server:app";
    pythonArguments.push("--reload");
  }
  return new Promise<void>((resolve, reject) => {
    server = spawn(pythonPath, pythonArguments, {
      cwd: rootDir,
      shell: true,
    });
    server.on("error", (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });
    server.stderr?.on("data", (data) => {
      // Parse Server Messages
      if (data.includes("Started server process")) {
        serverPid = parsePid(data.toString());
        console.log(`Server PID: ${serverPid}`);
      }
      if (data.includes("Started reloader process")) {
        reloaderPid = parsePid(data.toString());
        console.log(`Reloader PID: ${reloaderPid}`);
      }
      if (data.includes("Application startup complete.")) {
        console.log("Server started successfully.");
        resolve();
      }
      if (data.includes("STARTED: ")) {
        const progressMessage = parseProgressMessage(data.toString());
        if (!progressMessage) {
          console.log("Progress message parsing failed.");
          return;
        }
        progressMessages.push(progressMessage);
      }
      if (data.includes("COMPLETED: ")) {
        const completedMessage = parseCompletedMessage(data.toString());
        if (!completedMessage) {
          console.log("Completed message parsing failed.");
          return;
        }
        completedMessages.push(completedMessage);
      }
      console.log(`stderr: ${data}`);
    });
    server.stdout?.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
  });
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  return mainWindow;
};

function makeRequest(method: "get" | "put", endpoint: string, body?: string) {
  console.log(`Making ${method} request to ${endpoint}`);
  console.log(body);
  return net.fetch(`http://localhost:8154/${endpoint}`, {
    method,
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  checkPythonEnvironment();
  await startServer();
  console.log("App is ready.");

  createWindow();

  // IPC communication between main and renderer processes
  ipcMain.handle("python:submitFilePath", (event, path: string) => {
    makeRequest("put", "file", JSON.stringify({ path })).then((response) => {
      if (!response.ok) {
        console.error(response.statusText);
      }
    });
  });

  ipcMain.handle("python:chooseExampleFile", async () => {
    return new Promise<void>((resolve, reject) => {
      makeRequest("put", "file/example").then((response) => {
        if (!response.ok) {
          console.error(response.statusText);
          reject(response.statusText);
        }
        resolve();
      });
    });
  });

  ipcMain.handle("python:fetchFilePath", async () => {
    return new Promise<string>((resolve, reject) => {
      makeRequest("get", "file").then(async (response) => {
        if (!response.ok) {
          console.error(response.statusText);
          reject(response.statusText);
        }
        const data = await response.json();
        resolve(data.path);
      });
    });
  });

  ipcMain.handle("python:readFile", async (event, path: string) => {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path, "utf-8", (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(data);
      });
    });
  });

  ipcMain.handle(
    "python:setFileSettings",
    (event, fileSettings: FileSettingsParam) => {
      makeRequest("put", "file/settings", JSON.stringify(fileSettings)).then(
        (response) => {
          if (!response.ok) {
            console.error(response.statusText);
          }
        },
      );
    },
  );

  ipcMain.handle(
    "python:setAlgorithmSettings",
    (
      event,
      algorithmSettings: AutoAlgorithmSettings | ManualAlgorithmSettings,
    ) => {
      makeRequest(
        "put",
        "algorithm/settings",
        JSON.stringify(algorithmSettings),
      ).then((response) => {
        if (!response.ok) {
          console.error(response.statusText);
        }
      });
    },
  );

  ipcMain.handle("python:startClustering", () => {
    makeRequest("put", "start").then((response) => {
      if (!response.ok) {
        console.error(response.statusText);
      }
    });
  });

  ipcMain.handle("python:pollClusterProgress", () => {
    const currentTask = progressMessages[progressMessages.length - 1];
    const progress = {
      currentTask: currentTask,
      completedMessages: completedMessages,
    };
    return progress;
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (server) {
    if (serverPid) {
      console.log("Killing server process...");
      exec(`taskkill /F /PID ${serverPid}`);
    }

    if (reloaderPid) {
      console.log("Killing reloader process...");
      exec(`taskkill /F /PID ${reloaderPid}`);
    }

    console.log("Killing uvicorn process...");
    if (!server.kill()) {
      console.error("Failed to kill uvicorn process.");
    }
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

declare global {
  interface Window {
    python: {
      submitFilePath: (path: string) => void;
      chooseExampleFile: () => Promise<void>;
      fetchFilePath: () => Promise<string>;
      readFile: (path: string) => Promise<string>;
      setFileSettings: (fileSettings: FileSettingsParam) => void;
      setAlgorithmSettings: (
        algorithmSettings: AutoAlgorithmSettings | ManualAlgorithmSettings,
      ) => void;
      startClustering: () => void;
      pollClusterProgress: () => Promise<{
        currentTask: string;
        completedMessages: string[];
      }>;
    };
  }
}
