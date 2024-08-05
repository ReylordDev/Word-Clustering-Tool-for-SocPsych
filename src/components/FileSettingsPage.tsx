import { Link, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { FileSelector } from "./FileSelector";
import { useEffect, useState } from "react";

export default function FileSettingsPage() {
  const [hasHeader, setHasHeader] = useState(true);
  const [separator, setSeparator] = useState(",");
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const filePath = useLocation().state;

  console.log(filePath);
  console.log(hasHeader);
  console.log(separator);
  console.log(previewData);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!separator || !filePath) {
        return;
      }
      try {
        const input = await window.python.readFile(filePath);
        console.log(input.length);
        const lines = input.split("\n");
        console.log(lines.length);
        const parsedData = lines.map((line) => line.split(separator));
        setPreviewData(parsedData.slice(0, 6)); // Get first 6 rows (including header if present)
      } catch (error) {
        console.error("Error fetching preview data:", error);
      }
    };

    fetchPreviewData();
  }, [filePath, separator]);

  const displayData = hasHeader ? previewData.slice(1) : previewData;
  const headers = hasHeader ? previewData[0] : [];

  console.log(displayData);
  console.log(headers);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">CSV Preview</h2>
      <div className="mb-4 space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasHeader"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
          />
          <label htmlFor="hasHeader">Has header row</label>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="separator">Separator:</label>
          <input
            type="text"
            id="separator"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-16"
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            {hasHeader &&
              headers &&
              headers.map((header, index) => <th key={index}>{header}</th>)}
            {!hasHeader &&
              displayData[0] &&
              displayData[0].map((_, index) => (
                <th key={index}>Column {index + 1}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {displayData.slice(0, 5).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
