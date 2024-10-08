import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatDate } from "../utils";

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
      timestamp: number;
    }[]
  >([]);
  const [locale, setLocale] = useState("en-US");

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

  const handleClick = (selectedResult: { name: string; timestamp: number }) => {
    onSelect(selectedResult.name);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    window.settings.getSystemLocale().then(setLocale);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="mt-[60px] w-full max-w-4xl rounded-lg bg-backgroundColor shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-6 pb-4">
          <h2 className="text-3xl font-semibold">Select Previous Result</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-textColor focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        <div className="scrollbar max-h-[70vh] flex-grow overflow-y-auto p-6">
          <table className="w-full rounded-lg">
            <thead>
              <tr>
                <th className="border-b border-r border-dashed border-b-textColor border-r-textColor p-1">
                  Name
                </th>

                <th className="border-b border-r border-dashed border-b-textColor border-r-textColor p-1">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {previousResults
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((item, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer hover:bg-primary-100"
                    onClick={() => handleClick(item)}
                  >
                    <td className="border border-dashed border-textColor p-2 pl-4">
                      <p className="text-ellipsis font-semibold">{item.name}</p>
                    </td>
                    <td className="border border-dashed border-textColor p-2 pl-4">
                      <p className="text-md text-ellipsis">
                        {formatDate(item.timestamp, locale)}
                      </p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreviousResultModal;
