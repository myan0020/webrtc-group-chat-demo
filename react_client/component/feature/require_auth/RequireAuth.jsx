import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";

import { requestToSignout, selectAuthenticated, selectAuthLoadingStatus } from "store/authSlice";
import NavigationBar from "../navigation/NavigationBar";
import useBeforeunload from "hook/use-beforeunload";
import Loading from "component/generic/loading/Loading";
import * as loadingStatusEnum from "constant/enum/loading-status";
import { selectRoomLoadingStatus } from "store/roomSlice";

export default function RequireAuth({ children, redirectTo }) {
  const dispatch = useDispatch();
  const authenticated = useSelector(selectAuthenticated);
  const authLoadingStatus = useSelector(selectAuthLoadingStatus);
  const roomLoadingStatus = useSelector(selectRoomLoadingStatus);
  const isLoading =
    authLoadingStatus === loadingStatusEnum.status.LOADING ||
    roomLoadingStatus === loadingStatusEnum.status.LOADING;

  useBeforeunload(() => {
    dispatch(requestToSignout());
  });

  if (!authenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.

    return (
      <Navigate
        to='/signin'
        // state={{ from: location }}
      />
    );
  }

  return (
    <Wrapper>
      <NavigationContainer>
        <NavigationBar />
      </NavigationContainer>
      <OutletContainer>
        <Outlet />
      </OutletContainer>
      {isLoading && <Loading />}
    </Wrapper>
  );
}

const sharedStyleValues = {
  navigationContainerHeight: 60,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const NavigationContainer = styled.nav`
  width: 100%;
  height: ${sharedStyleValues.navigationContainerHeight}px;
`;

const OutletContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: calc(100% - ${sharedStyleValues.navigationContainerHeight}px);
  background-color: rgb(255, 255, 255); ;
`;
