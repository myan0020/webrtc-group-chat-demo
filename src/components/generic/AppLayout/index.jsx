import React from 'react';
import { Outlet } from "react-router-dom";

import Header from '../Header/index.jsx';
import Footer from '../Footer/index.jsx';
import Navbar from '../../features/navigating/Navbar/index.jsx';

export default function AppLayout() {

  return (
    <>
      <Header />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}