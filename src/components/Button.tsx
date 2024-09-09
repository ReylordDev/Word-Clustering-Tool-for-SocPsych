const Button = ({
  text,
  onClick,
  className = "",
  disabled = false,
  primary = true,
  leftIcon,
  rightIcon,
  modalOpen,
}: {
  text: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  primary?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  modalOpen?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex ${primary ? "bg-primaryColor hover:bg-primary-700" : "bg-secondaryColor hover:bg-secondary-500"} items-center justify-center gap-2 rounded-md px-4 py-2 text-backgroundColor disabled:cursor-not-allowed ${!modalOpen ? "disabled:opacity-50" : ""} ${className} `}
    >
      {leftIcon}
      <p className="font-normal">{text}</p>
      {rightIcon}
    </button>
  );
};

export default Button;
