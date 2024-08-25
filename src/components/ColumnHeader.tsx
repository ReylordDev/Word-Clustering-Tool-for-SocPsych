import { useState } from "react";
import { Square, Check } from "lucide-react";

const ColumnHeader = ({
  onChange,
  title,
}: {
  onChange: (isOn: boolean) => void;
  title: string;
}) => {
  const [isOn, setIsOn] = useState(false);

  const toggleCheckbox = () => {
    setIsOn(!isOn);
    onChange(!isOn);
  };

  return (
    <div
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-md p-2 ${
        isOn ? "bg-accent text-background" : "hover:bg-pink-200"
      }`}
      onClick={toggleCheckbox}
    >
      <Check size={16} className={`text-background ${isOn ? "" : "hidden"}`} />
      <Square size={16} className={`text-text ${isOn ? "hidden" : ""}`} />
      <p className="select-none font-normal">{title}</p>
      <input
        type="checkbox"
        checked={isOn}
        onChange={toggleCheckbox}
        className="hidden"
      ></input>
    </div>
  );
};

export default ColumnHeader;
