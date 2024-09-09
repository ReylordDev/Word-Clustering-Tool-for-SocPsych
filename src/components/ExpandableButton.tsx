import { useState } from "react";
import { ChevronDown, ChevronUp, Undo2 } from "lucide-react";
import Button from "./Button";

const ExpandableButton = ({
  text,
  option1,
  onClick1,
  option2,
  onClick2,
}: {
  text: string;
  option1: string;
  onClick1: () => void;
  option2: string;
  onClick2: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        text={text}
        leftIcon={<Undo2 />}
        onClick={toggleExpand}
        rightIcon={isExpanded ? <ChevronUp /> : <ChevronDown />}
      />
      {/* <button
        onClick={toggleExpand}
        className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-purple-800"
      >
        <span>{text}</span>
        {isExpanded ? (
          <ChevronUp className="ml-2" />
        ) : (
          <ChevronDown className="ml-2" />
        )}
      </button> */}
      {isExpanded && (
        <div className="mt-4 flex w-max flex-col items-center gap-4">
          <button
            className="w-full rounded-md bg-secondaryColor px-4 py-2 text-backgroundColor hover:bg-secondary-500"
            onClick={onClick1}
          >
            {option1}
          </button>
          <button
            className="w-full rounded-md bg-secondaryColor px-4 py-2 text-backgroundColor hover:bg-secondary-500"
            onClick={onClick2}
          >
            {option2}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpandableButton;
