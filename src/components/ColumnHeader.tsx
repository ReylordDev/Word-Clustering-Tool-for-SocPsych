import { Square, Check } from "lucide-react";

const ColumnHeader = ({
  isOn,
  title,
  onChange,
}: {
  isOn: boolean;
  title: string;
  onChange: (isOn: boolean) => void;
}) => {
  return (
    <div
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-md p-2 ${
        isOn ? "bg-accentColor text-backgroundColor" : "hover:bg-accent-200"
      }`}
      onClick={() => onChange(!isOn)}
    >
      <Check size={16} className={`text-background ${isOn ? "" : "hidden"}`} />
      <Square size={16} className={`text-text ${isOn ? "hidden" : ""}`} />
      <p className="w-full select-none font-normal">{title}</p>
      <input
        type="checkbox"
        checked={isOn}
        onChange={() => onChange(!isOn)}
        className="hidden"
      ></input>
    </div>
  );
};

export default ColumnHeader;
