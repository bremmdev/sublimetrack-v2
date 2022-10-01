import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import type { Dispatch, SetStateAction } from "react";
import { Theme } from "../../utils/theme-context";

type Props = {
  theme: Theme | null;
  setTheme: Dispatch<SetStateAction<Theme | null>>;
};

const ThemeToggle = (props: Props) => {
  const { theme, setTheme } = props;

  const handleLightClick = () => {
    if (!theme || theme !== "light") {
      localStorage.setItem("theme", "light");
      setTheme(Theme.LIGHT);
    }
  };

  const handleDarkClick = () => {
    if (!theme || theme !== "dark") {
      localStorage.setItem("theme", "dark");
      setTheme(Theme.DARK);
    }
  };

  return (
    <div className="theme-toggle flex">
      <FiSun className="theme-icon" onClick={handleLightClick} />
      <FiMoon className="theme-icon" onClick={handleDarkClick} />
    </div>
  );
};

export default ThemeToggle;
