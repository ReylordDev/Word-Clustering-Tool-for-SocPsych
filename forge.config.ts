import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerWix } from "@electron-forge/maker-wix";
import { PublisherGithub } from "@electron-forge/publisher-github";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import path from "path";
import { cp } from "fs/promises";

import dotenv from "dotenv";

dotenv.config();

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerWix({}),
    new MakerZIP({}),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: "ReylordDev",
        name: "Word-Clustering-Tool-for-SocPsych",
      },
      prerelease: true,
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/main-window/index.html",
            js: "./src/main-window/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/main-window/preload.ts",
            },
          },
          // {
          //   html: "./src/startup-window/index.html",
          //   js: "./src/startup-window/renderer.ts",
          //   name: "startup_window",
          //   preload: {
          //     js: "./src/startup-window/preload.ts",
          //   },
          // },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    postPackage: async (forgeConfig, options) => {
      const { outputPaths } = options;

      const pythonFolderPath = "./src/python";

      for (const outputPath of outputPaths) {
        const destinationPath = path.join(outputPath, "python");
        await cp(pythonFolderPath, destinationPath, { recursive: true });
        console.log(`Copied ${pythonFolderPath} to ${destinationPath}`);

        await cp("requirements.txt", path.join(outputPath, "requirements.txt"));
        console.log(`Copied requirements.txt to ${outputPath}`);

        await cp("example_data", path.join(outputPath, "example_data"), {
          recursive: true,
        });
        console.log(`Copied example_data to ${outputPath}`);

        await cp(
          "setup_python_backend.py",
          path.join(outputPath, "setup_python_backend.py"),
        );
      }
    },
  },
};

export default config;
