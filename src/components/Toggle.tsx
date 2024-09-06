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
        isOn ? "bg-primaryColor" : "bg-background-300"
      }`}
      onClick={toggleSwitch}
    >
      <div
        className={`bg-backgroundColor size-6 transform rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          isOn ? "translate-x-6" : ""
        }`}
      />
    </button>
  );
};

export default Toggle;
