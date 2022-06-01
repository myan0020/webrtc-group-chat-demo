import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Importing a root component in react component tree
import App from "./app/App.jsx";

// Displaying the current environment ('development' or 'production')
console.log(`[In ${process.env.NODE_ENV} mode]`);

// Renderring this react root component into DOM
// as a child element of a div with the id of 'root'
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);