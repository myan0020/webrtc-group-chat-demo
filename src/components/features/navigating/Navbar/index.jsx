import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { ThemeContext } from "../../../contexts/theme-context";

export default function Navbar() {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <h3 style={{ color: theme.headerTextColor }}>Navigator</h3>
      <nav>
        <Link to="/" style={{ color: theme.headerTextColor }}>
          Home
        </Link>
        &nbsp;&nbsp;
        <Link to="/WebSocket+WebRTC" style={{ color: theme.headerTextColor }}>
          WebSocket + WebRTC
        </Link>
      </nav>
    </>
  );
}
