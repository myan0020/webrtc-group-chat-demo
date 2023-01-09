import React from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
// import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import store from "./store/store";
import "./index.css";
import RequireAuth from "./component/feature/require_auth/RequireAuth";
import Signin from "./component/feature/sign_in/Signin";
import RoomList from "./component/feature/room_list/RoomList";
import ChatRoom from "./component/feature/chat/ChatRoom";
import { GlobalContextProvider } from "./context/global-context";

/**
 * Displaying the current environment ('development' or 'production')
 */

console.log(`[In ${process.env.NODE_ENV} mode]`);

/**
 * The root component to render in the application
 */

function App() {
  return (
    <ReduxProvider store={store}>
      <GlobalContextProvider>
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
      </GlobalContextProvider>
    </ReduxProvider>
  );
}

// Renderring this react root component into DOM
// as a child element of a div with the id of 'root'
const container = document.getElementById("root");
const root = createRoot(container);
// ReactDOM.render(<App />, container)
root.render(<App />);
