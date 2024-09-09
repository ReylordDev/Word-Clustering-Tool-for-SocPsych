import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";

const ExcludedWordsEditor = ({
  isOpen,
  setIsOpen,
  excludedWords,
  setExcludedWords,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  excludedWords: string[];
  setExcludedWords: (excludedWords: string[]) => void;
}) => {
  const [newWord, setNewWord] = useState("");

  const addWord = () => {
    if (newWord && !excludedWords.includes(newWord)) {
      excludedWords.push(newWord);
      setExcludedWords(excludedWords);
      setNewWord("");
    }
  };

  const removeWord = (wordToRemove: string) => {
    setExcludedWords(excludedWords.filter((word) => word !== wordToRemove));
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="mt-[60px] w-full max-w-2xl rounded-lg bg-backgroundColor shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-3xl font-semibold">Excluded Words</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:text-text text-gray-400 focus:outline-none"
          >
            <X size={36} />
          </button>
        </div>
        <div className="flex items-center justify-between border-b px-6 pb-4">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWord()}
            placeholder="Add a new word"
            className="w-48 rounded-md border border-gray-300 p-2 text-center focus:outline-none focus:ring focus:ring-primaryColor focus:ring-opacity-50 dark:bg-backgroundColor"
          />
          <Button
            onClick={addWord}
            text="Add Word"
            leftIcon={<Plus size={20} />}
          />
        </div>
        <div className="scrollbar flex max-h-[55vh] flex-grow flex-col gap-4 overflow-y-auto p-6">
          {excludedWords.length > 0 ? (
            excludedWords.map((word, index) => (
              <div
                key={index}
                className="flex w-full items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-md dark:bg-zinc-900"
              >
                <p className="text-lg">{word}</p>
                <button
                  onClick={() => removeWord(word)}
                  className="text-secondaryColor hover:text-red-800 focus:outline-none"
                >
                  <X size={32} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-lg text-gray-400">No words added</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcludedWordsEditor;
