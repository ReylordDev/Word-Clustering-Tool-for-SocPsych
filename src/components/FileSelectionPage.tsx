import { useNavigate } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { Database, FileText, FileSearch, Upload, Info } from "lucide-react";
import Button from "./Button";
import PreviousResultModal from "./PreviousResultModal";
import { useState } from "react";
import { Args, FileSettings } from "../models";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipContentContainer,
} from "./Tooltip";

function FileSelector({
  selectFile,
  tutorialState,
}: {
  selectFile: (path: string) => void;
  tutorialState: {
    tutorialMode: boolean;
    setTutorialMode: (mode: boolean) => void;
  };
}) {
  const checkFiles = (files: FileList | null) => {
    if (files) {
      const file = files[0];
      if (file && file.size > 0 && file.type === "text/csv") {
        console.log("File selected: ", file);
        selectFile(file.path);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    checkFiles(files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    checkFiles(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  function BrowseButton() {
    return (
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primaryColor px-4 py-2 text-backgroundColor hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
        <FileSearch size={24} />
        <p className="font-normal">Browse</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    );
  }

  return (
    <div
      className="flex h-full w-fit flex-col items-center justify-center gap-4 rounded-3xl border-4 border-dashed border-accentColor 2xl:w-1/2"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center justify-start gap-2 p-4">
            <Upload size={48} className="text-primaryColor" />
            <p className="w-full text-nowrap">
              Drag and drop your CSV file here
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <TooltipContentContainer tutorialMode={tutorialState.tutorialMode}>
            <p className="text-left">
              The program requires comma-separated values (CSV) files as input.
              <br></br>
              Most survey or statisics tools provide an option to export the
              data as a CSV file.
            </p>
          </TooltipContentContainer>
        </TooltipContent>
      </Tooltip>
      <div className="flex items-center justify-center gap-2">
        <p>or</p>
        <BrowseButton />
      </div>
    </div>
  );
}

export default function FileSelectionPage({
  setFilePath,
  setFileSettings,
  tutorialState,
}: {
  setFilePath: (path: string) => void;
  setFileSettings: (fileSettings: FileSettings) => void;
  tutorialState: {
    tutorialMode: boolean;
    setTutorialMode: (mode: boolean) => void;
  };
}) {
  const [previousResultModalOpen, setPreviousResultModalOpen] = useState(false);
  const navigate = useNavigate();

  const submitExampleFile = () => {
    window.python.getExampleFilePath().then((path) => {
      setFilePath(path);
      navigate("/file_preview");
    });
  };

  // useEffect(() => {
  //   if (filePath) {
  //     navigate("/file_preview");
  //   }
  // }, [filePath]);

  const handlePreviousResultSelect = async (result: string) => {
    await window.python.loadRun(result);
    const resultsDir = await window.python.getResultsDir();
    const output = await window.python.readJsonFile(`${resultsDir}/args.json`);
    const args = output as Args;
    setFileSettings(args.fileSettings);
    navigate("/results");
  };

  return (
    <>
      <TitleBar index={0} tutorialState={tutorialState} />
      <div
        id="mainContent"
        className="dark:dark flex flex-col bg-backgroundColor px-24 pt-8 text-textColor xl:px-32 xl:pb-8 2xl:px-48 2xl:pb-16"
      >
        <PreviousResultModal
          isOpen={previousResultModalOpen}
          setIsOpen={setPreviousResultModalOpen}
          onSelect={handlePreviousResultSelect}
        />
        <div className="mb-8 flex w-full flex-col gap-2">
          <h1 className="text-5xl">
            <span className="text-accentColor">Word Clustering</span>
            {/* <span className="text-accentColor">Word</span>{" "}
            <span className="font-bold text-primaryColor">Clustering</span> */}
            {/* <span className="bg-gradient-to-r from-primaryColor via-accentColor to-secondaryColor bg-clip-text text-transparent">
              Word Clustering
            </span> */}
            <br></br>
            based on{" "}
            <span className="bg-gradient-to-r from-primaryColor to-secondaryColor bg-clip-text text-transparent">
              LLM Embeddings
            </span>
          </h1>
          <p>Analyze your open-ended survey responses with ease.</p>
        </div>
        <div className="mb-8 flex h-full items-center justify-between 2xl:p-16">
          <FileSelector
            tutorialState={tutorialState}
            selectFile={(path: string) => {
              setFilePath(path);
              navigate("/file_preview");
            }}
          />
          <div className="flex h-full flex-col items-center justify-between gap-8 p-4 text-center 2xl:p-12">
            <div className="flex flex-col gap-2">
              <h5>Start by selecting an input file.</h5>
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="line-clamp-2 max-w-sm">
                  You can also start with the example file if you just want to
                  try the application out.
                </p>
                <Tooltip placement="bottom">
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={submitExampleFile}
                        primary={false}
                        leftIcon={<FileText size={24} />}
                        text="Select Example File"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <TooltipContentContainer
                      tutorialMode={tutorialState.tutorialMode}
                    >
                      <p className="text-left">
                        The example file contains the response data of a study
                        regarding self-generated motives of social casino
                        gamers.
                        <br></br>
                        Full citation: Kim, H.S., Coelho, S., Wohl, M.J. et al.
                        Self-Generated Motives of Social Casino Gamers. J Gambl
                        Stud 39, 299–320 (2023).
                      </p>
                    </TooltipContentContainer>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p>Or you could review a previous result</p>
              <Tooltip placement="bottom">
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      primary={false}
                      leftIcon={<Database size={24} />}
                      text="Review Previous Result"
                      onClick={() => setPreviousResultModalOpen(true)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <TooltipContentContainer
                    tutorialMode={tutorialState.tutorialMode}
                  >
                    <p className="text-left">
                      Reviewing a previous result will load the settings from
                      the previous run.<br></br>This is especially useful if you
                      want to fine-tune the settings or compare the results.
                    </p>
                  </TooltipContentContainer>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
