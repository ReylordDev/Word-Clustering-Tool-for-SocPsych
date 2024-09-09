import { Link } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { useEffect, useState } from "react";
import Toggle from "./Toggle";
import ColumnHeader from "./ColumnHeader";
import Button from "./Button";
import { ArrowRightCircle } from "lucide-react";

export default function FilePreviewPage({
  filePath,
  hasHeader,
  setHasHeader,
  delimiter,
  setDelimiter,
  selectedColumns,
  setSelectedColumns,
}: {
  filePath: string | null;
  hasHeader: boolean;
  setHasHeader: (hasHeader: boolean) => void;
  delimiter: string;
  setDelimiter: (delimiter: string) => void;
  selectedColumns: number[];
  setSelectedColumns: (selectedColumns: number[]) => void;
}) {
  const [previewData, setPreviewData] = useState<string[][]>([]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!delimiter || !filePath) {
        return;
      }
      try {
        const input = await window.python.readFile(filePath);
        const lines = input.split("\n");
        const parsedData = lines.map((line) => line.split(delimiter));
        setPreviewData(parsedData.slice(0, 6)); // Get first 6 rows (including header if present)
      } catch (error) {
        console.error("Error fetching preview data:", error);
      }
    };

    fetchPreviewData();
  }, [filePath, delimiter]);

  const displayData = hasHeader ? previewData.slice(1) : previewData;
  const headers = hasHeader ? previewData[0] : [];

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

  if (!filePath) {
    return (
      <>
        <TitleBar index={1} />
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
      <TitleBar index={1} resetState={resetState} />
      <div
        id="mainContent"
        className="dark:dark flex flex-col justify-start gap-4 bg-backgroundColor px-24 pt-8 text-textColor xl:gap-8 xl:px-32 xl:pb-8"
      >
        <h1 className="flex w-full flex-col text-5xl">File Preview</h1>
        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col">
              <p>Header row</p>
              <p className="text-wrap text-base font-normal text-gray-500">
                Whether the first line of data already contains responses.
              </p>
            </div>
            <Toggle initialState={hasHeader} onToggle={setHasHeader} />
          </div>
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
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-gray-500">
            Select all columns that contain responses to open-ended questions:
          </p>
          <div className="scrollbar overflow-x-auto">
            <table className="w-full overflow-hidden">
              <thead>
                <tr>
                  {headers &&
                    headers.map((header, index) => (
                      <th
                        key={index}
                        className="border-x border-b border-dashed border-textColor p-1"
                      >
                        <ColumnHeader
                          key={index}
                          onChange={() => toggleColumn(index)}
                          title={header}
                          initialState={selectedColumns.includes(index)}
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
          {/* TODO: fix the case for 1 column selected */}
          <p>{selectedColumns.length} columns selected</p>
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
