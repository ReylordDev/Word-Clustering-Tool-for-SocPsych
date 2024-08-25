import { Link } from "react-router-dom";
import { Header } from "./Header";
import { useEffect, useState } from "react";
import Toggle from "./Toggle";

export default function FilePreviewPage({
  file,
  hasHeader,
  setHasHeader,
  delimiter,
  setDelimiter,
  selectedColumns,
  setSelectedColumns,
}: {
  file: File | null;
  hasHeader: boolean;
  setHasHeader: (hasHeader: boolean) => void;
  delimiter: string;
  setDelimiter: (delimiter: string) => void;
  selectedColumns: number[];
  setSelectedColumns: (selectedColumns: number[]) => void;
}) {
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const filePath = file?.path;

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

  if (!file) {
    return (
      <>
        <Header index={2} />
        <div className="flex flex-col justify-start px-24">
          <h1 className="text-center text-2xl font-bold">
            No file selected. Please select a file first.
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Header index={2} />
      <div className="flex flex-col justify-start px-24">
        <h1 className="flex items-center justify-center p-10 text-4xl">
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
              className="rounded-md border border-gray-300 p-2 pl-5"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {headers &&
                  headers.map((header, index) => (
                    <th key={index} className="border border-gray-300 p-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(index)}
                          onChange={() => toggleColumn(index)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span>{header}</span>
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {displayData &&
                displayData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 p-2"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 p-4">
          {/* TODO: fix the case for 1 column selected */}
          <p>{selectedColumns.length} columns selected</p>
          <Link to="/algorithm_settings">
            <button className="w-48 rounded-full bg-primary p-4 px-8 text-background">
              <h5>Continue</h5>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
