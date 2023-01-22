import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import { requestToSignout, reset as resetAuthSlice } from "store/authSlice";
import * as localizableEnum from "constant/enum/localizable";
import { GlobalContext } from "context/global-context";
import { reset as resetTextChatSlice } from "store/textChatSlice";
import { reset as resetMediaChatSlice } from "store/mediaChatSlice";
import { reset as resetRoomSlice } from "store/roomSlice";

export default function SignoutNavigator() {
  const { localizedStrings, resetMediaRenderingContext, resetMessageContext } =
    useContext(GlobalContext);

  return (
    <MemorizedSignoutNavigator
      localizedStrings={localizedStrings}
      resetMediaRenderingContext={resetMediaRenderingContext}
      resetMessageContext={resetMessageContext}
    />
  );
}

const MemorizedSignoutNavigator = React.memo(SignoutNavigatorToMemo, arePropsEqual);

function SignoutNavigatorToMemo({
  localizedStrings,
  resetMediaRenderingContext,
  resetMessageContext,
}) {
  const dispatch = useDispatch();

  const handleSignoutClicked = () => {
    // media
    dispatch(resetMediaChatSlice());
    resetMediaRenderingContext();

    // message
    dispatch(resetTextChatSlice());
    resetMessageContext();

    // roomList
    dispatch(resetRoomSlice())

    // auth
    dispatch(resetAuthSlice())
    dispatch(requestToSignout());
  };

  return (
    <SignoutNavigatorWrapper>
      <SignoutNavigatorButton onClick={handleSignoutClicked}>
        {localizedStrings[localizableEnum.key.NAVIGATION_SIGN_OUT]}
      </SignoutNavigatorButton>
    </SignoutNavigatorWrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isResetMediaRenderingContextEqual = Object.is(
    prevProps.resetMediaRenderingContext,
    nextProps.resetMediaRenderingContext
  );
  const isResetMessageContextEqual = Object.is(
    prevProps.resetMessageContext,
    nextProps.resetMessageContext
  );
  return isLocalizedStringEqual && isResetMediaRenderingContextEqual && isResetMessageContextEqual;
};

const SignoutNavigatorWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const SignoutNavigatorButton = styled.button`
  width: 100%;
  height: 100%;

  box-sizing: border-box;
  border: 1px solid #ffffff;
  border-radius: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
  font-size: 14px;
  background-color: transparent;
`;