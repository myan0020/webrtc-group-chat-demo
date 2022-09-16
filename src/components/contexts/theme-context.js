import React, { useState } from "react";

const themes = {
  light: {
    pageBgColor: "#fff",
    headerTextColor: "#101214",
    buttonBgColor: "#3b88ed",
    buttonTxtColor: "#101214",
  },
  dark: {
    pageBgColor: "#1e2830",
    headerTextColor: "#ccd6e3",
    buttonBgColor: "#05244d",
    buttonTxtColor: "#ccd6e3",
  },
};

const ThemeContext = React.createContext(themes.light);
ThemeContext.displayName = "ThemeContextDisplayName";

function TogglableThemeContextProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };
  return (
    <ThemeContext.Provider value={{ theme: themes[theme], toggleTheme }}>
      <div
        style={{
          backgroundColor: themes[theme].pageBgColor,
          padding: '10px'
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export { TogglableThemeContextProvider, ThemeContext };
