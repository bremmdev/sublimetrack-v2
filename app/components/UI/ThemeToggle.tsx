import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";

type Props = {
  setTheme: (v: string) => void;
};

const ThemeToggle = (props: Props) => {
  return (
    <div className="theme-toggle flex">
      <FiSun className="theme-icon" onClick={() => props.setTheme("light")} />
      <FiMoon className="theme-icon" onClick={() => props.setTheme("dark")} />
    </div>
  );
};

export default ThemeToggle;
