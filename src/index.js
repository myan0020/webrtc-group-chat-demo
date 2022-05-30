import React from "react";
import { createRoot } from 'react-dom/client';
import './index.css'

// Import the outerest react component
import App from "./components/App/App.jsx";

// Display the current environment ('development' or 'production')
console.log(`[In ${process.env.NODE_ENV} mode]`);

//  Client root rendering
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);