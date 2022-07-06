import React from 'react';
import { Outlet } from "react-router-dom";

export default function AppLayout() {

  return (
    <>
      <h3>App Layout aaa</h3>
      <Outlet />
    </>
  )
}