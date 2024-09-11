import { useState } from "react";

const Toggle = ({
  initialState = false,
  onToggle,
  modalOpen,
}: {
  initialState?: boolean;
  onToggle: (isOn: boolean) => void;
  modalOpen?: boolean;
}) => {
  const [isOn, setIsOn] = useState(initialState);

  const toggleSwitch = () => {
    setIsOn(!isOn);
    onToggle(!isOn);
  };

  return (
    <button
      className={`z-10 flex h-8 w-14 cursor-pointer items-center rounded-full p-1 ${
        isOn ? "bg-primaryColor" : "bg-background-200"
      }`}
      onClick={toggleSwitch}
    >
      <div
        className={`size-6 transform rounded-full bg-backgroundColor shadow-md transition-transform duration-300 ease-in-out ${
          isOn ? "translate-x-6" : ""
        }`}
      />
    </button>
  );
};

export default Toggle;
