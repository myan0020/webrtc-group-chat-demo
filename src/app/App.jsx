import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayoutRoute from '../components/app-layout-route/AppLayoutRoute.jsx';
import AuthLayoutRoute from '../components/auth-layout-route/AuthLayoutRoute.jsx';
import HomeRoute from '../components/home-route/HomeRoute.jsx';
import ContactRoute from '../components/contact-route/ContactRoute.jsx';
import LoginRoute from '../components/login-route/LoginRoute.jsx';
import SignupRoute from '../components/signup-route/SignupRoute.jsx';
import Header from '../components/header/Header.jsx';
import Navigator from '../components/navigator/Navigator.jsx';
import Footer from '../components/footer/Footer.jsx';

import styles from './App.css';

export default function App() {

  return (
    <>
      <BrowserRouter>
        <Header />

        <Navigator />

        <Routes>
          <Route element={<AppLayoutRoute />}>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<HomeRoute />} />
            <Route path="/contact" element={<ContactRoute />} />
          </Route>

          <Route element={<AuthLayoutRoute />}>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/signup" element={<SignupRoute />} />
          </Route>
        </Routes>

        <Footer />
      </BrowserRouter>
    </>
  )
}