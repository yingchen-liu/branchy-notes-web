type ToggleButtonProps = {
  isToggled: boolean;
  onToggle: (newState: boolean) => void;
  labelOn?: string;
  labelOff?: string;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isToggled,
  onToggle,
  labelOn = "On",
  labelOff = "Off",
}) => {
  const handleToggle = () => {
    onToggle(!isToggled);
  };

  return (
    <div className="flex items-center">
      <span
        className={`mr-2 font-normal text-gray-700 ${
          isToggled ? "opacity-100" : "opacity-50"
        }`}
      >
        {isToggled ? labelOn : labelOff}
      </span>
      <button
        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          isToggled ? "bg-blue-900" : "bg-gray-300"
        }`}
        onClick={handleToggle}
      >
        <span
          className={`transform transition-transform duration-200 ease-in-out block w-6 h-6 rounded-full bg-white ${
            isToggled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleButton;
