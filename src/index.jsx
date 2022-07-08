import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import Header from './components/generic/Header/index.jsx';
import AppLayout from './components/generic/AppLayout/index.jsx';
import Footer from './components/generic/Footer/index.jsx';
import Navbar from './components/features/navigating/Navbar/index.jsx';


/**
 * Displaying the current environment ('development' or 'production')
 */
console.log(`[In ${process.env.NODE_ENV} mode]`);

/**
 * The root component to render in the application
 */
function App() {

  return (
    <>
      <BrowserRouter>
        <Header />

        {/* <Navigator /> */}

        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navbar />} />
            {/* <Route path="/home" element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} /> */}
          </Route>

          {/* <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route> */}
        </Routes>

        <Footer />
      </BrowserRouter>
    </>
  )
}

// Renderring this react root component into DOM
// as a child element of a div with the id of 'root'
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);