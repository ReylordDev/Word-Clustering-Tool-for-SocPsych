import { app, BrowserWindow, ipcMain, shell } from "electron";
import { ChildProcess, spawn } from "child_process";
import log from "electron-log/main";
import squirrel from "electron-squirrel-startup";
import fs from "fs";
import path from "path";
import {
  FileSettings,
  AlgorithmSettings,
  ProgressMessage,
  RunStatus,
  ClusterProgress,
} from "./models";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

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
const outputDir = path.join(dataDir, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// const venvPath = path.join(dataDir, ".venv");
app.setAppLogsPath(path.join(dataDir, "logs"));

console.log(`Root directory: ${rootDir}`);
console.log(`Data directory: ${dataDir}`);
console.log(`Output directory: ${outputDir}`);

let script: ChildProcess | undefined;
let mainWindow: BrowserWindow;

let currentRun: RunStatus = {
  status: "NOT_STARTED",
  progress: {
    pendingTasks: [],
    currentTask: null,
    completedTasks: [],
  },
  name: "",
};

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

const startScript = async (
  fileSettings: FileSettings,
  algorithmSettings: AlgorithmSettings,
) => {
  const advancedOptions = algorithmSettings.advancedOptions;
  // let pythonPath: string;
  let executablePath: string;
  const pythonArguments: string[] = [];
  if (!isDev()) {
    // Launch the compiled executable
    const pyInstallerDestinationDir = path.join(
      rootDir,
      "resources",
      "dist",
      "main",
    );
    if (process.platform === "win32") {
      executablePath = path.join(pyInstallerDestinationDir, "main.exe");
    } else {
      executablePath = path.join(pyInstallerDestinationDir, "main");
    }
  } else {
    // Launch the python script
    // dataDir is equivalent to rootDir in development anyway
    if (process.platform === "win32") {
      executablePath = path.join(dataDir, ".venv", "Scripts", "python.exe");
    } else {
      executablePath = path.join(dataDir, ".venv", "bin", "python");
    }
    const scriptPath = path.join(rootDir, "src", "python", "main.py");
    pythonArguments.push("-u");
    pythonArguments.push(scriptPath);
  }
  pythonArguments.push(
    fileSettings.path,
    "--delimiter",
    fileSettings.delimiter,
    "--language_model",
    algorithmSettings.advancedOptions.languageModel,
    "--output_dir",
    outputDir,
    "--log_dir",
    path.join(dataDir, "logs", "python"),
  );
  if (isDev()) {
    pythonArguments.push("--log_level");
    pythonArguments.push("DEBUG");
  }
  if (fileSettings.hasHeader) {
    pythonArguments.push("--has_headers");
  }
  pythonArguments.push("--selected_columns");
  fileSettings.selectedColumns.forEach((index) => {
    pythonArguments.push(index.toString());
  });
  if (algorithmSettings.autoClusterCount && algorithmSettings.maxClusters) {
    pythonArguments.push("--automatic_k");
    pythonArguments.push("--max_num_clusters");
    pythonArguments.push(algorithmSettings.maxClusters.toString());
  } else {
    if (algorithmSettings.clusterCount) {
      pythonArguments.push("--cluster_count");
      pythonArguments.push(algorithmSettings.clusterCount.toString());
    }
  }
  if (algorithmSettings.seed) {
    pythonArguments.push("--seed");
    pythonArguments.push(algorithmSettings.seed.toString());
  }
  if (algorithmSettings.excludedWords.length > 0) {
    pythonArguments.push("--excluded_words");
    pythonArguments.push(algorithmSettings.excludedWords.join(","));
  }
  if (advancedOptions.nearestNeighbors && advancedOptions.zScoreThreshold) {
    pythonArguments.push("--nearest_neighbors");
    pythonArguments.push(advancedOptions.nearestNeighbors.toString());
    pythonArguments.push("--z_score_threshold");
    pythonArguments.push(advancedOptions.zScoreThreshold.toString());
  }
  if (advancedOptions.similarityThreshold) {
    pythonArguments.push("--merge_threshold");
    pythonArguments.push(advancedOptions.similarityThreshold.toString());
  }

  console.log(
    `Executing Command: ${executablePath} ${pythonArguments.map((arg) => `"${arg}"`).join(" ")}`,
  );

  return new Promise<void>((resolve, reject) => {
    script = spawn(executablePath, pythonArguments, {
      cwd: rootDir,
    });
    script.on("error", (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });
    resolve(); // todo: check if this is correct
    script.stdout?.on("data", (data: Buffer) => {
      const prog = currentRun.progress;
      const message = data.toString().trim();
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "progress") {
          const progress = parsedMessage as ProgressMessage;
          if (progress.status === "TODO") {
            // const progress = JSON.parse(message) as ProgressMessage;
            prog.pendingTasks.push(progress.step);
          }
          if (progress.status === "STARTED") {
            prog.currentTask = [progress.step, Date.parse(progress.timestamp)];
            prog.pendingTasks.map((message, index) => {
              if (message === progress.step) {
                prog.pendingTasks.splice(index, 1);
              }
            });
          }
          if (progress.status === "DONE") {
            prog.pendingTasks.map((message, index) => {
              if (message === progress.step) {
                prog.pendingTasks.splice(index, 1);
              }
            });
            if (prog.currentTask && prog.currentTask[0] === progress.step) {
              prog.currentTask = null;
            }
            prog.completedTasks.push([
              progress.step,
              Date.parse(progress.timestamp),
            ]);
          }
        }
        if (parsedMessage.type === "run_name") {
          currentRun.name = parsedMessage.name;
        }
      } catch (error) {
        console.error(
          `Failed to parse progress message: ${message} because of ${error}`,
        );
        console.log(
          `Failed to parse progress message: ${message} because of ${error}`,
        );
      }
    });
    script.stderr?.on("data", (data: Buffer) => {
      console.error(`Error: ${data.toString()}`);
    });

    script.on("close", (code: number) => {
      console.log(`Python process exited with code ${code}`);
    });
  });
};

const createMainWindow = () => {
  console.log("Creating main window");
  const mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "rgba(255,255,255,0)",
      symbolColor: "#140621",
      height: 60,
    },
    icon: path.join(rootDir, "assets", "icons", "icon.png"),
    useContentSize: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  console.log(`Main window url: ${MAIN_WINDOW_WEBPACK_ENTRY}`);

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  console.log("App is ready");
  const mainWindow = createMainWindow();

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
      algorithmSettings: AlgorithmSettings,
    ) => {
      startScript(fileSettings, algorithmSettings);
    },
  );

  ipcMain.handle("python:pollClusterProgress", () => {
    return currentRun.progress;
  });

  ipcMain.handle("python:resetClusterProgress", () => {
    currentRun.progress = {
      pendingTasks: [],
      currentTask: null,
      completedTasks: [],
    };
  });

  ipcMain.handle("python:getRunName", async () => {
    if (!currentRun.name) {
      console.error("No current run name");
    }
    return currentRun.name;
  });

  ipcMain.handle("python:setRunName", (event, name: string) => {
    // Rename the results Dir
    if (!currentRun.name) {
      console.error("No current run name");
      return;
    }
    const oldPath = path.join(outputDir, currentRun.name);
    const newPath = path.join(outputDir, name);
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error(err);
      }
    });
    currentRun.name = name;
  });

  ipcMain.handle("python:getResultsDir", () => {
    if (!currentRun.name) {
      console.error("No current run name");
      return;
    }
    return path.join(outputDir, currentRun.name);
  });

  ipcMain.handle("python:openResultsDir", () => {
    if (!currentRun.name) {
      console.error("No current run name");
      return;
    }
    const resultsDir = path.join(outputDir, currentRun.name);
    console.log(`Opening results directory: ${resultsDir}`);
    return shell.openPath(resultsDir);
  });

  ipcMain.handle("python:fetchPreviousResults", async () => {
    return new Promise<
      {
        name: string;
        date: string;
      }[]
    >((resolve, reject) => {
      fs.readdir(outputDir, (err, files) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        const results: {
          name: string;
          date: string;
        }[] = [];
        files.forEach((fileName) => {
          // Read timestamps.json
          const timestampPath = path.join(
            outputDir,
            fileName,
            "timestamps.json",
          );
          if (!fs.existsSync(timestampPath)) {
            console.error(`Timestamps file not found: ${timestampPath}`);
            return;
          }
          const timestamps = fs.readFileSync(timestampPath, "utf-8");
          try {
            const parsedTimestamps = JSON.parse(timestamps);
            const startingTime = parsedTimestamps.timeStamps[0].time;
            results.push({
              name: fileName,
              date: startingTime
                ? formatDate(parseInt(startingTime))
                : "Invalid Date",
            });
          } catch (error) {
            console.error(
              `Failed to parse timestamps file: ${timestampPath} because of ${error}`,
            );
            return;
          }
        });
        resolve(results);
      });
    });
  });

  ipcMain.handle("python:loadRun", (event, runName: string) => {
    fs.readdir(outputDir, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      files.forEach((fileName) => {
        if (fileName === runName) {
          console.log(`Loading run: ${runName}`);
          currentRun = {
            status: "COMPLETED",
            progress: {
              pendingTasks: [],
              currentTask: null,
              completedTasks: [],
            },
            name: runName,
          };
          return;
        }
      });
    });
  });

  ipcMain.handle("python:resetRun", () => {
    currentRun = {
      status: "NOT_STARTED",
      progress: {
        pendingTasks: [],
        currentTask: null,
        completedTasks: [],
      },
      name: "",
    };
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
        algorithmSettings: AlgorithmSettings,
      ) => Promise<void>;
      pollClusterProgress: () => Promise<ClusterProgress>;
      resetClusterProgress: () => void;
      getRunName: () => Promise<string | undefined>;
      setRunName: (name: string) => void;
      getResultsDir: () => Promise<string>;
      openResultsDir: () => Promise<string>;
      fetchPreviousResults: () => Promise<
        {
          name: string;
          date: string;
        }[]
      >;
      loadRun(name: string): void;
      resetRun: () => void;
    };
    control: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(app.getSystemLocale(), {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};
