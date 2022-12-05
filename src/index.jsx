import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
// import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// For video.js
import "video.js/dist/video-js.min.css";

import store from "./store";
import "./index.css";
// import { TogglableThemeContextProvider } from "./components/contexts/theme-context.js";
// import VideoPlayer from "./components/features/VideoPlayer/VideoPlayer.jsx";
import RequireAuth from "./components/features/require-auth/RequireAuth.jsx";
import Signin from "./components/features/sign-in/Signin.jsx";
import RoomList from "./components/features/room-list/RoomList.jsx";
import ChatRoom from "./components/features/chat/ChatRoom.jsx";

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

  return (
    <Provider store={store}>
      {/* <TogglableThemeContextProvider> */}
      
        <BrowserRouter>
          <Routes>
            <Route
              path='/'
              element={
                <Navigate
                  to='/signin'
                  replace
                />
              }
            />

            <Route
              path='/signin'
              element={<Signin />}
            />

            <Route element={<RequireAuth />}>
              <Route
                path='/room-list'
                element={<RoomList />}
              />
              <Route
                path='/chat-room'
                element={<ChatRoom />}
              />
            </Route>

            <Route
              path='*'
              element={<Signin />}
            />
          </Routes>
        </BrowserRouter>
      {/* </TogglableThemeContextProvider> */}
    </Provider>
  );
}

// Renderring this react root component into DOM
// as a child element of a div with the id of 'root'
const container = document.getElementById("root");
const root = createRoot(container);
// ReactDOM.render(<App />, container)
root.render(<App />);
