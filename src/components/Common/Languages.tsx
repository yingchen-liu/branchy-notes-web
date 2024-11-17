import { useTranslation } from "react-i18next";
import { useState } from "react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false); // Close dropdown after selecting a language
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-block font-sfmono px-1 border border-white rounded-md text-white hover:text-blue-200 hover:border-blue-200 focus:outline-none"
      >
        {i18n.language.replace(/en.*/g, "EN").replace("zh-CN", "简").replace("zh-TW", "繁")}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul>
            <li>
              <button
                onClick={() => changeLanguage("en-GB")}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left rounded-tl-lg rounded-tr-lg"
              >
                EN
              </button>
            </li>
            <li>
              <button
                onClick={() => changeLanguage("zh-CN")}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left rounded-bl-lg rounded-br-lg"
              >
                简
              </button>
            </li>
            <li>
              <button
                onClick={() => changeLanguage("zh-TW")}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left rounded-bl-lg rounded-br-lg"
              >
                繁
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
