import React from "react";
import classNames from "classnames";
import { IconType } from "react-icons";

interface ButtonGroupProps {
  children: React.ReactNode;
}

const ToggleButtonGroup: React.FC<ButtonGroupProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="flex">
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {React.cloneElement(child as React.ReactElement, {
            isFirst: index === 0,
            isLast: index === childrenArray.length - 1,
          })}
          {/* Remove the separator div */}
        </React.Fragment>
      ))}
    </div>
  );
};

interface ToggleSquareButtonProps {
  Icon: IconType;
  isActive: boolean;
  isDisabled: boolean;
  onClick: (checked: boolean) => void;
  title: string,
  isFirst?: boolean; // New prop to indicate if it's the first button
  isLast?: boolean; // New prop to indicate if it's the last button
}

const ToggleSquareButton: React.FC<ToggleSquareButtonProps> = ({
  Icon,
  isActive,
  isDisabled,
  onClick,
  title,
  isFirst,
  isLast,
}) => {
  const handleClick = () => {
    if (!isDisabled) {
      onClick(!isActive);
    }
  };

  return (
    <button
      className={classNames(
        "w-11 h-11 flex items-center justify-center transition-colors duration-200",
        {
          "bg-green-500 text-white": isActive && !isDisabled,
          "bg-gray-200 hover:bg-[#cacbcd] text-gray-600": !isActive && !isDisabled,
          "bg-gray-100 text-gray-200 cursor-not-allowed": isDisabled,
          // Apply border radius only to the first and last buttons
          "rounded-l-md": isFirst,
          "rounded-r-md": isLast,
          "rounded-none": !isFirst && !isLast, // No border radius for middle buttons
        }
      )}
      title={title}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

export { ToggleButtonGroup, ToggleSquareButton };
