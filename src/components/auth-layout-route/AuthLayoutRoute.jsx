import React from 'react';
import { Outlet } from "react-router-dom";
import styles from './AuthLayoutRoute.css';

export default function AuthLayoutRoute() {

  return (
    <>
      <h3>Auth Layout Route</h3>
      <Outlet />
    </>
  )
}