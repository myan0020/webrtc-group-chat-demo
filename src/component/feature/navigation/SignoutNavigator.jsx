import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import { LocalizationContext } from "../../../context/localization-context.js";
import { requestToSignout } from "../../../store/authSlice.js";
import { localizableStringKeyEnum } from "../../../util/localizable-strings.js";

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
  font-size: 16px;
  background-color: transparent;
`;

export default function SignoutNavigator() {
  const dispatch = useDispatch();
  const { localizedStrings } = useContext(LocalizationContext);

  const handleSignoutClicked = () => {
    dispatch(requestToSignout());
  };

  return (
    <SignoutNavigatorWrapper>
      <SignoutNavigatorButton onClick={handleSignoutClicked}>
        {localizedStrings[localizableStringKeyEnum.NAVIGATION_SIGN_OUT]}
      </SignoutNavigatorButton>
    </SignoutNavigatorWrapper>
  );
}
