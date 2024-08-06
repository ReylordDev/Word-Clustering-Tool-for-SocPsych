import { Link } from "react-router-dom";
import { Header } from "./Header";
import { FileSelector } from "./FileSelector";
import { useState } from "react";

export default function FileSelectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const submitFile = () => {
    if (selectedFile) {
      console.log(selectedFile.path);
      window.python.submitFilePath(selectedFile.path);
    }
  };

  const exampleFile = () => {
    window.python.chooseExampleFile();
  };

  return (
    <>
      <Header>File Selection</Header>
      <div className="my-12"></div>
      <div className="flex items-center justify-around gap-12">
        <FileSelector
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
        <div className="flex flex-col items-center text-center">
          <div className="my-2"></div>
          <h5>Start by selecting an input file.</h5>
          <p>
            If your file type is not supported, go{" "}
            <a href="https://github.com/ReylordDev/Word-Clustering-Tool-for-SocPsych/issues">
              <span className="font-bold italic text-secondary">here</span>
            </a>{" "}
            and
            <br /> you can request it.
          </p>
          <div className="my-6"></div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p>
              You can also start with an example file if you <br />
              just want to try the application out.
            </p>
            <button
              className="rounded-full bg-secondary p-4 px-8 text-background"
              onClick={exampleFile}
            >
              <p>Choose Example File</p>
            </button>
          </div>
        </div>
      </div>
      <div className="my-12"></div>
      <div className="flex items-center justify-center">
        <Link
          to={selectedFile ? "/file_preview" : ""}
          state={selectedFile?.path}
        >
          {selectedFile ? (
            <button
              className="w-48 rounded-full bg-primary p-4 px-8 text-background"
              onClick={submitFile}
            >
              <h5>Confirm</h5>
            </button>
          ) : (
            <button
              className="w-48 rounded-full bg-gray-400 p-4 px-8 text-background"
              disabled
            >
              <h5>Confirm</h5>
            </button>
          )}
        </Link>
      </div>
    </>
  );
}
