import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { requestToSignout, selectAuth } from "../../../redux/authSlice.js";

const SignoutNavigatorWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
`;

const SignoutNavigatorUserNameWrapper = styled.div`
  flex: 1 0 200px;
  text-align: end;
  color: rgb(255, 255, 255);
  margin-right: 10px;
`;

const SignoutNavigatorButton = styled.button`
  flex: 0 0 100px;
  box-sizing: border-box;
  border: 1px solid #ffffff;
  border-radius: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
  font-size: 16px;
  background-color: transparent;
  height: 38px;
  margin-left: 10px;
  margin-right: 16px;
`;

export default function SignoutNavigator() {
  const dispatch = useDispatch();
  const { authenticatedUserName } = useSelector(selectAuth);

  const handleSignoutClicked = () => {
    dispatch(requestToSignout());
  };

  return (
    <SignoutNavigatorWrapper>
      <SignoutNavigatorUserNameWrapper>Hi, {authenticatedUserName}</SignoutNavigatorUserNameWrapper>
      <SignoutNavigatorButton onClick={handleSignoutClicked}>Sign out</SignoutNavigatorButton>
    </SignoutNavigatorWrapper>
  );
}
