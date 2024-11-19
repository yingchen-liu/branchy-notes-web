import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { HiOutlineLogin, HiOutlineLogout } from "react-icons/hi";
import { Link } from "../Index/Section";
import { saveRedirectPath } from "../../utils/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./Languages";
import { t } from "i18next";
import { loadQueueFromStorage } from "../../services/skillTreeService";
import { MdOutlineSyncProblem, MdSync } from "react-icons/md";
import { IoMdCloudDone } from "react-icons/io";
import { IoCloudOffline } from "react-icons/io5";

interface HeaderMenuProps {
  activeItem: string;
  title?: string;
}

interface MenuItemProps {
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ active, children, onClick }) => {
  return (
    <li
      className={`cursor-pointer text-blue-100 hover:text-white ${
        active ? "text-white " : ""
      } text-sm font-sfmono`}
      onClick={onClick}
    >
      {children}
    </li>
  );
};

const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    // Scroll smoothly to the section
    section.scrollIntoView({ behavior: "smooth" });
  }
};

function LoginButton() {
  const { loginWithRedirect, isAuthenticated, isLoading, logout } = useAuth0();
  const { t } = useTranslation();

  return (
    <div className="mt-[-0.5px]">
      {!isLoading &&
        (isAuthenticated ? (
          <Link
            onClick={() => {
              saveRedirectPath('/');

              logout({
                logoutParams: { returnTo: `${window.location.origin}/logout` },
              });
            }}
            className="flex items-center"
          >
            <HiOutlineLogout className="inline-block mr-1" />
            {t("logout")}
          </Link>
        ) : (
          <Link
            onClick={() => {
              saveRedirectPath();

              loginWithRedirect();
            }}
            className="flex items-center"
          >
            <HiOutlineLogin className="inline-block mr-1" />
            {t("login")}
          </Link>
        ))}
    </div>
  );
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ activeItem, title }) => {
  const navigate = useNavigate();

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useAuth0();
  const { userId } = useParams();

  const handleScroll = () => {
    if (typeof window !== "undefined") {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top of the page
      if (currentScrollY < lastScrollY || currentScrollY < 30) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const [syncState, setSyncState] = useState("complete");

  useEffect(() => {
    // Function to fetch data from localStorage
    const fetchRequestQueue = () => {
      const { requestQueue } = loadQueueFromStorage();
      const isOffline = localStorage.getItem("isOffline") === "true";

      if (isOffline) {
        setSyncState("offline");
      } else if (requestQueue.length > 0) {
        if (requestQueue[0].retries > 3) {
          setSyncState("error");
        } else {
          setSyncState("syncing");
        }
      } else {
        setSyncState("complete");
      }
    };

    // Initial fetch
    fetchRequestQueue();

    // Set an interval to fetch data every 1s
    const intervalId = setInterval(fetchRequestQueue, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  function handleItemClick(name: string) {
    if (name.startsWith("#")) {
      scrollToSection(name.replace("#", ""));
    } else {
      navigate(`/${name}`);
    }
  }

  return (
    <header
      className={`${
        activeItem !== "home" ? "border-b border-b-white border-opacity-20" : ""
      } text-white z-50 bg-gray-800 ${
        activeItem === "home" ? "fixed top-0 left-0" : ""
      } px-6 w-full transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center py-7">
        {/* Menu items on the left */}
        <nav className="flex-1">
          <ul className="flex gap-x-4 gap-y-0 font-sfmono flex-wrap">
            <>
              <MenuItem
                active={activeItem === "my-tree-notes"}
                onClick={() => handleItemClick("#")}
              >
                <span className="text-lg">
                  {title ? title : `🌲 ${t("treeNotes")}`}
                </span>
              </MenuItem>
            </>
          </ul>
        </nav>
        {/* Login button logic */}
        <nav className="mt-4 md:mt-0 md:ml-4">
          <div className="flex gap-4">
            {activeItem === "my-tree-notes" && user && user.sub !== userId && (
              <>
                <ul>
                  <Link href={`/u/${user.sub}`}>
                    {t("myTreeNotes")}
                  </Link>
                </ul>
              </>
            )}
            {activeItem === "my-tree-notes" &&
              user &&
              user.sub === userId &&
              (syncState === "syncing" ? (
                <>
                  <MdSync className="animate-spin text-2xl text-white" />
                </>
              ) : syncState === "complete" ? (
                <>
                  <IoMdCloudDone className="text-2xl text-green-500" />
                </>
              ) : syncState === "offline" ? (
                <>
                  <IoCloudOffline className="text-2xl text-red-500" />
                </>
              ) : (
                <>
                  <MdOutlineSyncProblem className="text-2xl text-red-500" />
                </>
              ))}
            {activeItem === "my-tree-notes" &&
              user &&
              (user.sub !== userId || user.sub === userId) && <div> | </div>}
            <LoginButton />
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default HeaderMenu;
