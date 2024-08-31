import { useNavigate } from "react-router-dom";
import { TitleBar } from "./TitleBar";
// import { FileSelector } from "./FileSelector";
import { Database, FileText, FileSearch, Upload } from "lucide-react";
import Button from "./Button";
import PreviousResultModal from "./PreviousResultModal";
import { useState } from "react";

function FileSelector({
  setFilePath,
}: {
  setFilePath: (path: string) => void;
}) {
  const checkFiles = (files: FileList | null) => {
    if (files) {
      const file = files[0];
      if (file && file.size > 0 && file.type === "text/csv") {
        console.log("File selected: ", file);
        setFilePath(file.path);
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
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50">
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
      className="flex h-full w-fit flex-col items-center justify-center gap-4 rounded-3xl border-4 border-dashed border-accent"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center justify-start gap-2 p-4">
        <Upload size={48} className="text-primary" />
        <p className="w-full text-nowrap">Drag and drop your CSV file here</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <p>or</p>
        <BrowseButton />
      </div>
    </div>
  );
}

export default function FileSelectionPage({
  filePath,
  setFilePath,
}: {
  filePath: string | null;
  setFilePath: (path: string) => void;
}) {
  const [previousResultModalOpen, setPreviousResultModalOpen] = useState(false);

  const submitExampleFile = () => {
    console.log("not implemented");
  };

  const navigate = useNavigate();

  if (filePath) {
    navigate("/file_preview");
  }

  return (
    <>
      <TitleBar index={0} />
      <div id="mainContent" className="mt-8 flex flex-col gap-12 px-24">
        <PreviousResultModal
          isOpen={previousResultModalOpen}
          setIsOpen={setPreviousResultModalOpen}
          onSelect={(result) =>
            navigate("/results", { state: { resultsDir: result } })
          }
        />
        <div className="flex w-full flex-col gap-2">
          <h1 className="text-5xl">
            <span className="text-accent">Word</span>{" "}
            <span className="font-bold text-primary">Clustering</span>
            <br></br>
            based on LLM <span className="text-accent">Embeddings</span>
          </h1>
          <p>Analyze your open-ended survey responses with ease.</p>
        </div>
        <div className="mb-36 flex h-full items-center justify-between">
          <FileSelector setFilePath={setFilePath} />
          <div className="flex h-full flex-col items-center justify-between gap-8 p-4 text-center">
            <div className="flex flex-col gap-2">
              <h5>Start by selecting an input file.</h5>
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="line-clamp-2 max-w-sm">
                  You can also start with the example file if you just want to
                  try the application out.
                </p>
                <Button
                  onClick={submitExampleFile}
                  primary={false}
                  leftIcon={<FileText size={24} />}
                  text="Select Example File"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p>Or you could review a previous result</p>
              <Button
                primary={false}
                leftIcon={<Database size={24} />}
                text="Review Previous Result"
                onClick={() => setPreviousResultModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
