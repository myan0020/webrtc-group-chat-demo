import React, { 
  useEffect, 
  useLayoutEffect, 
  useContext, 
  useState 
} from "react";

import logoUrl from "./logo.png";
import style from './index.module.css';
import { randomFruit, pick } from "./pickRandomFruitCreator";
import { ThemeContext } from "../../contexts/theme-context";
import ThemeButton from "./ThemeButton.jsx";

export default function Header() {
  const [fruit, setFruit] = useState(randomFruit);
  const [count, setCount] = useState(0);
  const { toggleTheme, theme } = useContext(ThemeContext);

  const text = `change fruit to: ${fruit}`;
  const obj = {
    some: {
      text,
    },
  };
  const onchange = () => {
    pick();
    setFruit(randomFruit);
  };
  const onPlus = () => {
    setCount(count + 1);
  };
  const onMinus = () => {
    setCount((prevCount) => prevCount - 1);
  };

  useEffect(() => {
    // const ele = document.getElementsByTagName("button")[0];
    // ele.textContent = "useEffect";
    // console.log("useEffect finished");
  }, [obj]);
  useLayoutEffect(() => {
    // const ele = document.getElementsByTagName("button")[0];
    // ele.textContent = "uselayoutEffect";
    // console.log("useLayoutEffect finished");
  }, [obj]);

  return (
    <>
      <header>
        <h1 style={{ color: theme.headerTextColor }} className={style.header}>Header</h1>
      </header>
      <img src={logoUrl} className={style.logo} />
      <ThemeButton text={"toggle theme"} onClick={toggleTheme} />
      <ThemeButton text={text} onClick={onchange} />
      <p className={style.count} style={{ color: theme.buttonTxtColor }}>
        {count}
      </p>
      <ThemeButton text={"+"} onClick={onPlus} />
      <ThemeButton text={"-"} onClick={onMinus} />
    </>
  );
}
