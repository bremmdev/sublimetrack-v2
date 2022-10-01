import { createContext, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

const prefersDarkMQ = "(prefers-color-scheme: dark)";
const getPreferredTheme = () =>
  window.matchMedia(prefersDarkMQ).matches ? Theme.DARK : Theme.LIGHT;

//THEME CONTEXT
export type ThemeCtx = [Theme | null, Dispatch<SetStateAction<Theme | null>>];

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(() => {
    // the client must calculate theme before hydration.
    if (typeof window !== "object") {
      //on server so return null
      return null;
    }

    //check for stored preference
    const storedThemePreference = localStorage.getItem("theme");

    if (storedThemePreference === "light" || storedThemePreference === "dark") {
      return storedThemePreference === "light" ? Theme.LIGHT : Theme.DARK;
    }

    //return clients's preferred theme based on media query
    return getPreferredTheme();
  });

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

//add dark or light class BEFORE HYDRATION depending on the user preference
const clientThemeCode = `
;(() => {
  const validThemes = ['light', 'dark'];

  //check for stored preference
  const storedThemePreference = localStorage.getItem('theme');
  const cl = document.documentElement.classList;

  if(validThemes.includes(storedThemePreference)){
    cl.add(storedThemePreference);
    return;
  }

  //no stored preference, so get preference from media query
  const theme = window.matchMedia(${JSON.stringify(prefersDarkMQ)}).matches
    ? 'dark'
    : 'light';
  cl.add(theme);
})();
`;

function NonFlashOfWrongThemeEls() {
  return <script dangerouslySetInnerHTML={{ __html: clientThemeCode }} />;
}

export { NonFlashOfWrongThemeEls, Theme, ThemeProvider, useTheme };
