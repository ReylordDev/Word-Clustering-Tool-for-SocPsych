import { useState } from "react";

const Toggle = ({
  initialState = false,
  onToggle,
}: {
  initialState?: boolean;
  onToggle: (isOn: boolean) => void;
}) => {
  const [isOn, setIsOn] = useState(initialState);

  const toggleSwitch = () => {
    setIsOn(!isOn);
    onToggle(!isOn);
  };

  return (
    <button
      className={`flex h-8 w-14 cursor-pointer items-center rounded-full p-1 ${
        isOn ? "bg-primary" : "bg-gray-300"
      }`}
      onClick={toggleSwitch}
    >
      <div
        className={`size-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isOn ? "translate-x-6" : ""
        }`}
      />
    </button>
  );
};

export default Toggle;
