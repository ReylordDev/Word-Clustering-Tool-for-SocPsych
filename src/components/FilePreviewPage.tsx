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

  console.log(filePath);
  console.log(hasHeader);
  console.log(delimiter);
  console.log(previewData);
  console.log(selectedColumns);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!delimiter || !filePath) {
        return;
      }
      try {
        const input = await window.python.readFile(filePath);
        console.log(input.length);
        const lines = input.split("\n");
        console.log(lines.length);
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

  console.log(displayData);
  console.log(headers);

  const toggleColumn = (index: number) => {
    selectedColumns.includes(index)
      ? setSelectedColumns(selectedColumns.filter((col) => col !== index))
      : setSelectedColumns([...selectedColumns, index]);
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
      <TitleBar index={1} />
      <div
        id="mainContent"
        className="dark:dark flex flex-col justify-start gap-4 bg-backgroundColor px-24 text-textColor"
      >
        <h1 className="flex items-center justify-center p-8 text-4xl">
          File Preview
        </h1>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-start">
            <div className="flex max-w-72 flex-col">
              <p>The file contains a header row</p>
              <p className="text-wrap text-sm font-normal text-gray-500">
                Whether the first line of data already contains responses.
              </p>
            </div>
            <Toggle initialState={hasHeader} onToggle={setHasHeader} />
          </div>
          <div className="flex w-60 flex-col">
            <label htmlFor="separator" className="px-2">
              <p>Select the line separator</p>
            </label>
            <input
              type="text"
              id="separator"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="rounded-md border border-gray-300 p-2 pl-5 focus:outline-none focus:ring focus:ring-primaryColor focus:ring-opacity-50 dark:bg-backgroundColor"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p>
            Select all columns that contain responses to open-ended questions
          </p>
          <div className="scrollbar overflow-x-auto">
            <table className="w-full overflow-hidden rounded-lg">
              <thead>
                <tr>
                  {headers &&
                    headers.map((header, index) => (
                      <th
                        key={index}
                        className="border-b border-r border-dashed border-b-textColor border-r-textColor p-1"
                      >
                        <ColumnHeader
                          key={index}
                          onChange={() => toggleColumn(index)}
                          title={header}
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
                          className="border-r border-dashed border-r-textColor p-1"
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
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-4">
          {/* TODO: fix the case for 1 column selected */}
          <p>{selectedColumns.length} columns selected</p>
          <Link to="/algorithm_settings">
            <Button
              onClick={() => null}
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
