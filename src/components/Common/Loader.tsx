import { t } from "i18next";

const LoadingSpinner = ({
  size = "sm",
  dark = true,
  message = t("loading"),
}) => {
  let spinnerSizer = "w-4 h-4 border-2"; // Default size for small
  let textSize = "text-sm"; // Default text size
  let color = "border-gray-700"; // Default color for dark theme

  switch (size) {
    case "lg":
      spinnerSizer = "w-5 h-5 border-4"; // Use larger size
      textSize = "text-lg"; // Larger text
      break;
    case "sm":
    default:
      spinnerSizer = "w-4 h-4 border-2"; // Small spinner
  }

  if (!dark) {
    color = "border-white text-white"; // Change color for light theme
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin ${spinnerSizer} ${color} border-t-transparent rounded-full`}
      ></div>
      <span className={`ml-2 ${color} ${textSize}`}>{message}</span>
    </div>
  );
};

export default LoadingSpinner;
