import React from 'react';
import { Outlet } from "react-router-dom";
import styles from './AppLayoutRoute.css';

export default function AppLayoutRoute() {

  return (
    <>
      <h3>App Layout Route</h3>
      <Outlet />
    </>
  )
}