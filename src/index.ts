import { app, BrowserWindow, ipcMain, shell } from "electron";
import { ChildProcess, exec, spawn } from "child_process";
import log from "electron-log/main";
import squirrel from "electron-squirrel-startup";
import fs from "fs";
import path from "path";
import {
  FileSettings,
  AutoAlgorithmSettings,
  ManualAlgorithmSettings,
} from "./models";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const STARTUP_WINDOW_WEBPACK_ENTRY: string;
declare const STARTUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const isDev = () => {
  return process.env["WEBPACK_SERVE"] === "true";
};

let rootDir = path.join(__dirname, "..", "..");
let dataDir = rootDir;
if (!isDev()) {
  // Production
  rootDir = path.join(__dirname, "..", "..", "..", "..");
  dataDir = app.getPath("userData");
  console.log = log.log;
  console.error = log.error;
}

const venvPath = path.join(dataDir, ".venv");
app.setAppLogsPath(path.join(dataDir, "logs"));

console.log(`Root directory: ${rootDir}`);
console.log(`Data directory: ${dataDir}`);

let script: ChildProcess | undefined;
const pendingTasks: string[] = [];
let currentTask: [string, number] | null = null;
const completedTasks: [string, number][] = [];
let mainWindow: BrowserWindow;
let startupScriptHasRun = false;
let outputDir: string | undefined;

// Force single instance application
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrel) {
  app.quit();
}

const parseLogMessage = (messageLog: string, messageType: string) => {
  const delimiter = `${messageType}: `;
  const parts = messageLog.split(delimiter);

  if (parts.length > 1) {
    return parts[1].replace("\x1B[0m\r\n", "");
  }
  return undefined;
};

const parseTodoMessage = (data: string) => {
  return parseLogMessage(data, "TODO");
};

const parseProgressMessage = (data: string) => {
  return parseLogMessage(data, "STARTED");
};

const parseCompletedMessage = (data: string) => {
  return parseLogMessage(data, "COMPLETED");
};

const parseOutputDirMessage = (data: string) => {
  return parseLogMessage(data, "OUTPUT_DIR");
};

const startScript = async (
  fileSettings: FileSettings,
  algorithmSettings: AutoAlgorithmSettings | ManualAlgorithmSettings,
) => {
  let pythonPath: string;
  if (process.platform === "win32") {
    pythonPath = path.join(venvPath, "Scripts", "python.exe");
  } else {
    pythonPath = path.join(venvPath, "bin", "python");
  }
  const pythonArguments: string[] = [
    "-u",
    path.join(rootDir, "python", "main.py"),
    fileSettings.path,
    "--delimiter",
    fileSettings.delimiter,
    "--excluded_words",
    algorithmSettings.excludedWords.join(","),
    "--language_model",
    algorithmSettings.advancedOptions.languageModel,
    "--nearest_neighbors",
    algorithmSettings.advancedOptions.nearestNeighbors.toString(),
    "--z_score_threshold",
    algorithmSettings.advancedOptions.zScoreThreshold.toString(),
    "--seed",
    algorithmSettings.seed.toString(),
    "--merge_threshold",
    algorithmSettings.advancedOptions.similarityThreshold.toString(),
  ];
  if (isDev()) {
    pythonArguments[1] = path.join(rootDir, "src", "python", "main.py");
    pythonArguments.push("--log_level");
    pythonArguments.push("DEBUG");
    pythonArguments.push("--output_dir");
    pythonArguments.push("output");
  } else {
    pythonArguments.push("--log_dir");
    pythonArguments.push(path.join(dataDir, "logs", "python"));
    pythonArguments.push("--output_dir");
    pythonArguments.push(path.join(dataDir, "output"));
  }
  if (fileSettings.hasHeader) {
    pythonArguments.push("--has_headers");
  }
  pythonArguments.push("--selected_columns");
  fileSettings.selectedColumns.forEach((index) => {
    pythonArguments.push(index.toString());
  });
  if (algorithmSettings.autoClusterCount) {
    pythonArguments.push("--automatic_k");
    pythonArguments.push("--max_num_clusters");
    pythonArguments.push(
      (algorithmSettings as AutoAlgorithmSettings).maxClusters.toString(),
    );
  } else {
    pythonArguments.push("--cluster_count");
    pythonArguments.push(
      (algorithmSettings as ManualAlgorithmSettings).clusterCount.toString(),
    );
  }

  console.log(`Running script: ${pythonPath} ${pythonArguments.join(" ")}`);

  return new Promise<void>((resolve, reject) => {
    script = spawn(pythonPath, pythonArguments, {
      cwd: rootDir,
    });
    script.on("error", (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });
    resolve(); // todo: check if this is correct
    script.stderr?.on("data", (data) => {
      if (data.includes("TODO: ")) {
        const todoMessage = parseTodoMessage(data.toString());
        if (!todoMessage) {
          console.log("Todo message parsing failed.");
          return;
        }
        pendingTasks.push(todoMessage);
      }
      if (data.includes("STARTED: ")) {
        const progressMessage = parseProgressMessage(data.toString());
        if (!progressMessage) {
          console.log("Progress message parsing failed.");
          return;
        }
        currentTask = [progressMessage, Date.now()];
        pendingTasks.map((message, index) => {
          if (message === progressMessage) {
            pendingTasks.splice(index, 1);
          }
        });
      }
      if (data.includes("COMPLETED: ")) {
        const completedMessage = parseCompletedMessage(data.toString());
        if (!completedMessage) {
          console.log("Completed message parsing failed.");
          return;
        }
        pendingTasks.map((message, index) => {
          if (message === completedMessage) {
            pendingTasks.splice(index, 1);
          }
        });
        if (currentTask && currentTask[0] === completedMessage) {
          currentTask = null;
        }
        completedTasks.push([completedMessage, Date.now()]);
      }
      if (data.includes("OUTPUT_DIR: ")) {
        console.log("Output dir message received");
        console.log(data.toString());
        outputDir = parseOutputDirMessage(data.toString());
        console.log(outputDir);
        if (!outputDir) {
          console.log("Output dir parsing failed.");
          return;
        }
        console.log(`Output directory: ${outputDir}`);
      }
      const dataString = data.toString() as string;
      console.log(`stderr: ${dataString.replace("\n", "")}`);
    });
    script.stdout?.on("data", (data) => {
      const dataString = data.toString() as string;
      console.log(`stdout: ${dataString.replace("\n", "")}`);
    });
  });
};

const createMainWindow = () => {
  console.log("Creating main window");
  const mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    titleBarStyle: "hidden",
    // titleBarOverlay: {
    //   color: "#f9f4fd",
    //   symbolColor: "#140621",
    //   height: 60,
    // },
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  console.log(`Main window url: ${MAIN_WINDOW_WEBPACK_ENTRY}`);

  return mainWindow;
};

const createStartupWindow = () => {
  console.log("Creating startup window");
  const startupWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: STARTUP_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  startupWindow.loadURL(STARTUP_WINDOW_WEBPACK_ENTRY);
  console.log(`Startup window url: ${STARTUP_WINDOW_WEBPACK_ENTRY}`);

  return startupWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  console.log("App is ready");
  const mainWindow = createMainWindow();
  let startupWindow: any;
  // const startupWindow = createStartupWindow();

  // // IPC communication between main and renderer processes

  // ipcMain.handle("startup:complete", () => {
  //   console.log("Startup complete");
  //   if (!mainWindow) {
  //     mainWindow = createMainWindow();
  //     startupWindow.hide();
  //     mainWindow.on("close", () => {
  //       startupWindow.close();
  //     });
  //   }
  // });

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

  ipcMain.handle("python:showItemInFolder", async (event, path: string) => {
    return shell.showItemInFolder(path);
  });

  ipcMain.handle("python:readJsonFile", async (event, path: string) => {
    return new Promise<unknown>((resolve, reject) => {
      fs.readFile(path, "utf-8", (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });
  });

  ipcMain.handle(
    "python:startClustering",
    (
      event,
      fileSettings: FileSettings,
      algorithmSettings: ManualAlgorithmSettings | AutoAlgorithmSettings,
    ) => {
      startScript(fileSettings, algorithmSettings);
    },
  );

  ipcMain.handle("python:pollClusterProgress", () => {
    return {
      pendingTasks,
      currentTask,
      completedTasks,
    };
  });

  ipcMain.handle("python:isPythonInstalled", async () => {
    return new Promise<boolean>((resolve, reject) => {
      if (process.platform === "win32") {
        exec("python -V", (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            reject(error);
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            reject(stderr);
          }
          if (stdout) {
            console.log(`stdout: ${stdout}`);
          }
          resolve(true);
        });
      } else {
        exec("command -v python3", (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            reject(error);
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            reject(stderr);
          }
          if (stdout) {
            resolve(true);
          }
        });
      }
    });
  });

  ipcMain.handle("python:hasMinimalPythonVersion", async () => {
    return new Promise<boolean>((resolve, reject) => {
      exec(
        'python3 -c "import sys; print(sys.version_info>=(3, 7))"',
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            reject(error);
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            reject(stderr);
          }
          if (stdout) {
            if (stdout.includes("True")) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        },
      );
    });
  });

  ipcMain.handle("python:runSetupScript", async () => {
    if (startupScriptHasRun) {
      return;
    }
    startupScriptHasRun = true;
    const setupScript = spawn(
      "python3",
      ["-u", "setup_python_backend.py", "--data_dir", dataDir],
      {
        cwd: rootDir,
      },
    );

    setupScript.on("error", (error) => {
      console.error(`Error: ${error.message}`);
    });

    setupScript.stderr?.on("data", (data) => {
      console.log(`stderr: ${data}`);
      startupWindow.webContents.send(
        "python:setupScriptMessage",
        data.toString(),
      );
    });

    setupScript.stdout?.on("data", (data) => {
      if (data.includes("Requirement already satisfied")) {
        return;
      }
      startupWindow.webContents.send(
        "python:setupScriptMessage",
        data.toString(),
      );
      const dataString = data.toString() as string;
      console.log(`stdout: ${dataString.replace("\n", "")}`);
    });
  });

  ipcMain.handle("python:getOutputDir", async () => {
    return outputDir;
  });

  ipcMain.handle("python:openOutputDir", () => {
    if (outputDir) {
      return shell.openPath(outputDir);
    }
  });

  ipcMain.on("control:minimize", () => mainWindow.minimize());
  ipcMain.on("control:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on("control:close", () => mainWindow.close());
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
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

declare global {
  interface Window {
    startup: {
      complete: () => Promise<void>;
    };
    python: {
      readFile: (path: string) => Promise<string>;
      showItemInFolder: (path: string) => Promise<void>;
      readJsonFile: (path: string) => Promise<unknown>;
      startClustering: (
        fileSettings: FileSettings,
        AlgorithmSettings: AutoAlgorithmSettings | ManualAlgorithmSettings,
      ) => Promise<void>;
      pollClusterProgress: () => Promise<{
        pendingTasks: string[];
        currentTask: [string, number] | null;
        completedTasks: [string, number][];
      }>;
      isPythonInstalled: () => Promise<boolean>;
      hasMinimalPythonVersion: () => Promise<boolean>;
      runSetupScript: () => Promise<void>;
      getOutputDir: () => Promise<string | undefined>;
      openOutputDir: () => Promise<string>;
      onSetupScriptMessage: (
        listener: (event: unknown, message: string) => void,
      ) => void;
    };
    control: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}
