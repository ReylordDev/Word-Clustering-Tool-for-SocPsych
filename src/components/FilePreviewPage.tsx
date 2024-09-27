import { Link } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { useEffect, useState } from "react";
import Toggle from "./Toggle";
import ColumnHeader from "./ColumnHeader";
import Button from "./Button";
import { ArrowRightCircle } from "lucide-react";
import { findDelimiter, parseCSVLine } from "../utils";
import {
  Tooltip,
  TooltipContent,
  TooltipContentContainer,
  TooltipTrigger,
} from "./Tooltip";

export default function FilePreviewPage({
  filePath,
  hasHeader,
  setHasHeader,
  delimiter,
  setDelimiter,
  selectedColumns,
  setSelectedColumns,
  tutorialState,
}: {
  filePath: string | null;
  hasHeader: boolean;
  setHasHeader: (hasHeader: boolean) => void;
  delimiter: string;
  setDelimiter: (delimiter: string) => void;
  selectedColumns: number[];
  setSelectedColumns: (selectedColumns: number[]) => void;
  tutorialState: {
    tutorialMode: boolean;
    setTutorialMode: (mode: boolean) => void;
  };
}) {
  const [previewData, setPreviewData] = useState<string[][]>([]);

  useEffect(() => {
    const findBestDelimiter = async () => {
      if (!filePath) {
        return;
      }
      try {
        const input = await window.python.readFile(filePath);
        const lines = input.split("\n");
        const bestDelimiter = findDelimiter(lines);
        console.log("Best delimiter: ", bestDelimiter);
        setDelimiter(bestDelimiter);
      } catch (error) {
        console.error("Error finding best delimiter:", error);
      }
    };

    findBestDelimiter();
  }, [filePath]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!delimiter || !filePath) {
        return;
      }
      try {
        const input = await window.python.readFile(filePath);
        const lines = input.split("\n");
        const parsedData = lines
          .slice(0, lines.length > 100 ? 100 : lines.length)
          .map((line) => parseCSVLine(line, delimiter));
        // Fill in missing values by copying the last non-empty value
        const fillIndexes = Array(parsedData.length).fill(
          parsedData.length - 1,
        );
        for (let i = 0; i < parsedData.length; i++) {
          for (let j = 0; j < parsedData[i].length; j++) {
            if (!parsedData[i][j]) {
              for (let k = fillIndexes[j]; k >= 0; k--) {
                if (parsedData[k][j]) {
                  parsedData[i][j] = parsedData[k][j];
                  fillIndexes[j] = k - 1;
                  break;
                }
              }
            }
          }
        }
        setPreviewData(parsedData.slice(0, 6)); // Get first 6 rows (including header if present)
      } catch (error) {
        console.error("Error fetching preview data:", error);
      }
    };

    fetchPreviewData();
  }, [filePath, delimiter]);

  const displayData = hasHeader
    ? previewData.slice(1)
    : previewData.slice(0, 5);
  const headers = hasHeader ? previewData[0] : [];
  const columnCount = displayData.length > 0 ? displayData[0].length : 0;

  const toggleColumn = (index: number) => {
    selectedColumns.includes(index)
      ? setSelectedColumns(selectedColumns.filter((col) => col !== index))
      : setSelectedColumns([...selectedColumns, index]);
  };

  const resetState = () => {
    console.log("Resetting state");
    setHasHeader(true);
    setDelimiter(",");
    setSelectedColumns([]);
  };

  console.log("Selected columns: ", selectedColumns);
  console.log("Has header: ", hasHeader);
  console.log("Display data: ", displayData);

  if (!filePath) {
    return (
      <>
        <TitleBar index={1} tutorialState={tutorialState} />
        <div
          id="mainContent"
          className="dark:dark flex flex-col items-center justify-start gap-4 bg-backgroundColor px-24"
        >
          <div className="mt-24 flex w-full justify-center p-8">
            <h1 className="text-4xl">
              No file selected. Please select a file first.
            </h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TitleBar
        index={1}
        resetState={resetState}
        tutorialState={tutorialState}
      />
      <div
        id="mainContent"
        className="dark:dark flex flex-col justify-start gap-4 bg-backgroundColor px-24 pt-8 text-textColor xl:gap-8 xl:px-32 xl:pb-8"
      >
        <h1 className="flex w-full flex-col text-5xl">File Preview</h1>
        <div className="flex flex-col gap-2 border-b pb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex w-full items-start justify-between">
                <div className="flex flex-col">
                  <p>Header row</p>
                  <p className="text-wrap text-base font-normal text-gray-500">
                    Whether the first line of data already contains responses.
                  </p>
                </div>
                <Toggle initialState={hasHeader} onToggle={setHasHeader} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipContentContainer
                tutorialMode={tutorialState.tutorialMode}
              >
                <p className="text-left">
                  The header row is the first row of the file that contains the
                  names of each column. Some CSV files may not have a header
                  row. In that case, disable this option.
                </p>
              </TooltipContentContainer>
            </TooltipContent>
          </Tooltip>
          <Tooltip placement="bottom">
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between">
                <label htmlFor="delimiter">
                  <div className="flex flex-col">
                    <p>Line separator</p>
                    <p className="text-base font-normal text-gray-500">
                      Enter the character that separates each column
                    </p>
                  </div>
                </label>
                <input
                  id="delimiter"
                  value={delimiter || ""}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-20 rounded-md border border-gray-300 p-2 text-center focus:outline-none focus:ring focus:ring-primaryColor focus:ring-opacity-50 dark:bg-backgroundColor"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipContentContainer
                tutorialMode={tutorialState.tutorialMode}
              >
                <p className="text-left">
                  The line separator is the character that separates each column
                  in the file.
                  <br></br>
                  Common separators include commas (","), tabs ("\t"), and
                  semicolons (";").
                  <br></br>
                  The application will automatically detect the separator for
                  you based on the first few lines of the file.
                  <br></br>
                  You should only need to change this if the preview data looks
                  incorrect.
                </p>
              </TooltipContentContainer>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <p>
                  Select all columns that contain responses to open-ended
                  questions:
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <TooltipContentContainer
                  tutorialMode={tutorialState.tutorialMode}
                  small
                >
                  <p className="text-left">
                    Only the selected columns will be used in the analysis.
                  </p>
                </TooltipContentContainer>
              </TooltipContent>
            </Tooltip>
            <div>
              <Button
                onClick={() => {
                  setSelectedColumns(
                    selectedColumns.length === 0
                      ? [...Array(headers.length).keys()]
                      : [],
                  );
                }}
                text="Toggle all"
                className="rounded-md"
              />
            </div>
          </div>
          <div className="scrollbar overflow-x-auto">
            <table className="w-full overflow-hidden">
              <thead>
                <tr>
                  {hasHeader &&
                    headers &&
                    headers.map((header, index) => (
                      <th
                        key={index}
                        className="border-x border-b border-dashed border-textColor p-1"
                      >
                        <ColumnHeader
                          key={index}
                          onChange={() => toggleColumn(index)}
                          title={header}
                          isOn={selectedColumns.includes(index)}
                        />
                      </th>
                    ))}
                  {!hasHeader &&
                    Array(columnCount)
                      .fill(0)
                      .map((_, index) => (
                        <th
                          key={index}
                          className="border-x border-b border-dashed border-textColor p-1"
                        >
                          <ColumnHeader
                            key={index}
                            onChange={() => toggleColumn(index)}
                            title={`Column ${index}`}
                            isOn={selectedColumns.includes(index)}
                          />
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {displayData &&
                  displayData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border-x border-dashed border-textColor p-1"
                        >
                          <p className="line-clamp-1 max-w-64 text-center">
                            {cell}
                          </p>
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="my-2"></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          {selectedColumns.length !== 1 ? (
            <p>{selectedColumns.length} columns selected</p>
          ) : (
            <p>{selectedColumns.length} column selected</p>
          )}
          <Link to="/algorithm_settings">
            <Button
              onClick={() =>
                console.log(
                  "Selected columns: ",
                  selectedColumns.map((col) => headers[col]),
                )
              }
              className="rounded-md"
              disabled={selectedColumns.length <= 0}
              text="Continue"
              rightIcon={<ArrowRightCircle size={20} />}
            />
          </Link>
        </div>
      </div>
    </>
  );
}
