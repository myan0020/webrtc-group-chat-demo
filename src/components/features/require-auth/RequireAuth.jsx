import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import { selectAuth } from "../authSlice.js";
import NavigationBar from "../nav-bar/NavigationBar.jsx";
import style from "./RequireAuth.module.css";

export default function RequireAuth({ children, redirectTo }) {
  const auth = useSelector(selectAuth);
  if (!auth.authenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return (
      <Navigate
        to='/signin'
        // state={{ from: location }}
      />
    );
  }
  return (
    <>
      <NavigationBar />
      <div className={style.container}>
        <Outlet />
      </div>
    </>
  );
}
