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
      className={`flex ${primary ? "bg-primary hover:bg-purple-800" : "bg-secondary hover:bg-pink-500"} items-center justify-center gap-2 rounded-md px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
    >
      {leftIcon}
      <p className="font-normal">{text}</p>
      {rightIcon}
    </button>
  );
};

export default Button;
