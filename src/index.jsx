import React from "react";
import { createRoot } from "react-dom/client";
// import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// For video.js
import "video.js/dist/video-js.min.css";

import "./index.css";
import AppLayout from "./components/generic/AppLayout/index.jsx";
import Navbar from "./components/features/navigating/Navbar/index.jsx";
import { TogglableThemeContextProvider } from "./components/contexts/theme-context.js";
import VideoPlayer from "./components/features/VideoPlayer/VideoPlayer.jsx";
import WebSocketClient from "./components/features/WebSocketClient/WebSocketClient.jsx";

/**
 * Displaying the current environment ('development' or 'production')
 */
console.log(`[In ${process.env.NODE_ENV} mode]`);

/**
 * The root component to render in the application
 */
function App() {
  // For VideoPlayer Component
  const videoId = "sintel.m3u8"; // or named as 'sintel.m3u8' for HLS
  const clipFromInSeconds = 30; // ignored for HLS
  const clipToInSeconds = 50; //  ignored for HLS

  // For WebSocketClient Component
  const webSocketHost = "localhost";
  const webSocketPort = "3002"; // same as mock express server port number
  const webSocketUrl = `ws://${webSocketHost}:${webSocketPort}`;

  return (
    <TogglableThemeContextProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <VideoPlayer
                  videoId={videoId}
                  clipFromInSeconds={clipFromInSeconds}
                  clipToInSeconds={clipToInSeconds}
                />
              }
            />
            <Route
              path="/WebSocket+WebRTC"
              element={<WebSocketClient url={webSocketUrl} />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </TogglableThemeContextProvider>
  );
}

// Renderring this react root component into DOM
// as a child element of a div with the id of 'root'
const container = document.getElementById("root");
const root = createRoot(container);
// ReactDOM.render(<App />, container)
root.render(<App />);
