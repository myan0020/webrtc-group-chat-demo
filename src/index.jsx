import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
// import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import store from "./redux/store";
import "./index.css";
import RequireAuth from "./components/feature/require-auth/RequireAuth.jsx";
import Signin from "./components/feature/sign-in/Signin.jsx";
import RoomList from "./components/feature/room-list/RoomList.jsx";
import ChatRoom from "./components/feature/media-chat/ChatRoom.jsx";

/**
 * Displaying the current environment ('development' or 'production')
 */
console.log(`[In ${process.env.NODE_ENV} mode]`);

/**
 * The root component to render in the application
 */
function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

// Renderring this react root component into DOM
// as a child element of a div with the id of 'root'
const container = document.getElementById("root");
const root = createRoot(container);
// ReactDOM.render(<App />, container)
root.render(<App />);
