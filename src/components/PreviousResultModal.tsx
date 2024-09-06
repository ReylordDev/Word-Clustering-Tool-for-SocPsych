import { useEffect, useState } from "react";
import { X } from "lucide-react";

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

  const handleClick = (selectedResult: { name: string; date: string }) => {
    onSelect(selectedResult.name);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[75vh] w-full max-w-4xl rounded-lg bg-backgroundColor shadow-xl">
        <div className="flex items-center justify-between border-b p-6 pb-4">
          <h2 className="text-3xl font-semibold">Select Previous Result</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-textColor focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        {/* TODO: Turn into a table */}
        <div className="max-h-[65vh] flex-grow overflow-y-auto p-6">
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
                .sort((a, b) => b.date.localeCompare(a.date))
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
                      <p className="text-md text-ellipsis">{item.date}</p>
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
