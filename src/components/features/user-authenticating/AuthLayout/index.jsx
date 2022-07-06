import React from 'react';
import { Outlet } from "react-router-dom";

export default function AuthLayout() {

  return (
    <>
      <h3>Auth Layout</h3>
      <Outlet />
    </>
  )
}