import * as React from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { RouterProvider, createBrowserRouter, redirect } from "react-router-dom";

import store from "store/store";
import "./index.css";
import { GlobalContextProvider } from "context/global-context";
import Loading from "component/generic/loading/Loading";
import ErrorPage from "component/generic/error/ErrorPage";

const Signin = React.lazy(() =>
  import(/* webpackChunkName: "sign_in_component" */ "component/feature/sign_in/Signin")
);
const RequireAuth = React.lazy(() =>
  import(
    /* webpackChunkName: "require_auth_component" */ "component/feature/require_auth/RequireAuth"
  )
);
const RoomList = React.lazy(() =>
  import(/* webpackChunkName: "room_list_component" */ "component/feature/room_list/RoomList")
);
const ChatRoom = React.lazy(() =>
  import(/* webpackChunkName: "chat_room_component" */ "component/feature/chat/ChatRoom")
);

/**
 * Displaying the current environment ('development' or 'production')
 */

console.debug(`[In ${process.env.NODE_ENV} mode]`);

/**
 * The root component to render in the application
 */

function App() {
  const router = createBrowserRouter([
    {
      path: "/signin",
      element: (
        <React.Suspense fallback={<Loading />}>
          <Signin />
        </React.Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      element: (
        <React.Suspense fallback={<Loading />}>
          <RequireAuth />
        </React.Suspense>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/room-list",
          element: (
            <React.Suspense fallback={<Loading />}>
              <RoomList />
            </React.Suspense>
          ),
        },
        {
          path: "/chat-room",
          element: (
            <React.Suspense fallback={<Loading />}>
              <ChatRoom />
            </React.Suspense>
          ),
        },
      ],
    },
    {
      path: "*",
      loader: () => {
        throw redirect("/signin");
      },
      errorElement: <ErrorPage />,
    },
  ]);

  return (
    <ReduxProvider store={store}>
      <GlobalContextProvider>
        <RouterProvider router={router} />
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
