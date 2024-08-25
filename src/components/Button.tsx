const Button = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: [string, JSX.Element?];
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
    >
      <p className="mr-2 font-normal">{children[0]}</p>
      {children[1]}
    </button>
  );
};

export default Button;
