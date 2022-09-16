import React, { useContext } from "react";

import style from "./index.module.css";
import { ThemeContext } from "../../contexts/theme-context.js";

export default function ThemeButton({ text, onClick }) {
  const { theme } = useContext(ThemeContext);
  return (
    <button
      className={style.changeState}
      onClick={onClick}
      style={{
        backgroundColor: theme.buttonBgColor,
        color: theme.buttonTxtColor,
      }}
    >
      {text}
    </button>
  );
}
