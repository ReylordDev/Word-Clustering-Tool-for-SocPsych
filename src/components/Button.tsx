const Button = ({
  text,
  onClick,
  className = "",
  disabled = false,
  primary = true,
  leftIcon,
  rightIcon,
}: {
  text: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  primary?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex ${primary ? "hover:bg-primary-700 bg-primaryColor" : "hover:bg-secondary-500 bg-secondaryColor"} text-backgroundColor items-center justify-center gap-2 rounded-md px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
    >
      {leftIcon}
      <p className="font-normal">{text}</p>
      {rightIcon}
    </button>
  );
};

export default Button;
