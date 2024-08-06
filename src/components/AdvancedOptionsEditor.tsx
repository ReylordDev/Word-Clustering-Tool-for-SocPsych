import React, { useState } from "react";

interface AdvancedOption {
  key: string;
  descriptor: string;
  placeholder: string;
  type: "text" | "number";
}

interface AdvancedOptionsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  options: AdvancedOption[];
  initialValues: Record<string, string>;
  onSave: (values: Record<string, string>) => void;
}

const AdvancedOptionsEditor: React.FC<AdvancedOptionsEditorProps> = ({
  isOpen,
  onClose,
  options,
  initialValues,
  onSave,
}) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const handleInputChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(values);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 max-w-full rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Advanced Options</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        </div>
        <div className="mb-6 max-h-[60vh] space-y-4 overflow-y-auto">
          {options.map((option) => (
            <div key={option.key} className="space-y-1">
              <label
                htmlFor={option.key}
                className="block text-sm font-medium text-gray-700"
              >
                {option.descriptor}
              </label>
              <input
                type={option.type}
                id={option.key}
                value={values[option.key] || ""}
                onChange={(e) => handleInputChange(option.key, e.target.value)}
                placeholder={option.placeholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

export default AdvancedOptionsEditor;
