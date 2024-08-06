import React, { useState } from "react";

interface ExcludedWordsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialWords: string[];
  onSave: (words: string[]) => void;
}

const ExcludedWordsEditor: React.FC<ExcludedWordsEditorProps> = ({
  isOpen,
  onClose,
  initialWords,
  onSave,
}) => {
  const [words, setWords] = useState<string[]>(initialWords);
  const [newWord, setNewWord] = useState("");

  const addWord = () => {
    if (newWord && !words.includes(newWord)) {
      setWords([...words, newWord]);
      setNewWord("");
    }
  };

  const removeWord = (wordToRemove: string) => {
    setWords(words.filter((word) => word !== wordToRemove));
  };

  const handleSave = () => {
    onSave(words);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 max-w-full rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Excluded Words</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWord()}
            placeholder="Add a new word"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addWord}
            className="mt-2 w-full rounded-md bg-blue-500 px-4 py-2 text-white transition duration-200 hover:bg-blue-600"
          >
            Add Word
          </button>
        </div>
        <div className="mb-4 max-h-60 overflow-y-auto">
          {words.map((word, index) => (
            <div
              key={index}
              className="mb-2 flex items-center justify-between rounded-md bg-gray-100 px-3 py-2"
            >
              <span>{word}</span>
              <button
                onClick={() => removeWord(word)}
                className="text-red-500 hover:text-red-700"
              >
                X
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-md bg-green-500 px-4 py-2 text-white transition duration-200 hover:bg-green-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcludedWordsEditor;
