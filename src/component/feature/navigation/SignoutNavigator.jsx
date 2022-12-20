import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import { requestToSignout } from "store/authSlice";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import { leaveRoom } from "store/roomSlice";
import { GlobalContext } from "context/global-context";

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

function SignoutNavigatorToMemo({
  localizedStrings,
  clearTextMessageContext,
  clearAllFileInput,
  clearFileMessageContext,
}) {
  const dispatch = useDispatch();

  const handleSignoutClicked = () => {
    clearTextMessageContext();
    clearAllFileInput();
    clearFileMessageContext();

    dispatch(leaveRoom());
    dispatch(requestToSignout());
    // dispatch(leaveRoom())
  };

  return (
    <SignoutNavigatorWrapper>
      <SignoutNavigatorButton onClick={handleSignoutClicked}>
        {localizedStrings[localizableStringKeyEnum.NAVIGATION_SIGN_OUT]}
      </SignoutNavigatorButton>
    </SignoutNavigatorWrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isClearTextMessageContextEqual = Object.is(
    prevProps.clearTextMessageContext,
    nextProps.clearTextMessageContext
  );
  const isClearAllFileInputEqual = Object.is(
    prevProps.clearAllFileInput,
    nextProps.clearAllFileInput
  );
  const isClearFileMessageContextEqual = Object.is(
    prevProps.clearFileMessageContext,
    nextProps.clearFileMessageContext
  );
  return (
    isLocalizedStringEqual &&
    isClearTextMessageContextEqual &&
    isClearAllFileInputEqual &&
    isClearFileMessageContextEqual
  );
};

const MemorizedSignoutNavigator = React.memo(SignoutNavigatorToMemo, arePropsEqual);

export default function SignoutNavigator() {
  const { localizedStrings, clearTextMessageContext, clearAllFileInput, clearFileMessageContext } =
    useContext(GlobalContext);

  return (
    <MemorizedSignoutNavigator
      localizedStrings={localizedStrings}
      clearTextMessageContext={clearTextMessageContext}
      clearAllFileInput={clearAllFileInput}
      clearFileMessageContext={clearFileMessageContext}
    />
  );
}
