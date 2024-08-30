import React, { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

const PreviousResultModal = ({
  isOpen,
  setIsOpen,
  onSelect,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelect: (result: string) => void;
}) => {
  const [previousResults, setPreviousResults] = useState<
    {
      name: string;
      date: string;
      original: string;
    }[]
  >([]);

  useEffect(() => {
    window.python
      .fetchPreviousResults()
      .then((results) => {
        console.log("Previous Results: ", results);
        setPreviousResults(results);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleClick = (selectedResult: {
    name: string;
    date: string;
    original: string;
  }) => {
    onSelect(selectedResult.original);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[75vh] w-full max-w-4xl rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between border-b p-6 pb-4">
          <h2 className="text-3xl font-semibold">Select Previous Result</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-text focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        {/* TODO: Turn into a table */}
        <div className="max-h-[65vh] flex-grow overflow-y-auto p-6">
          <ol className="flex flex-wrap items-center gap-8">
            {previousResults
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((item, index) => (
                <li key={index}>
                  <button onClick={() => handleClick(item)}>
                    <div className="flex w-60 items-center justify-start gap-4 rounded-lg bg-white p-4 shadow-md">
                      <div className="text-primary hover:text-violet-900">
                        <Info size={24} />
                      </div>
                      <div className="flex w-full flex-col items-center justify-start gap-1">
                        <h3 className="text-clip text-lg font-semibold">
                          {item.name}
                        </h3>
                        <p className="text-ellipsis text-sm text-gray-400">
                          {item.date}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PreviousResultModal;
