import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";

import { requestToSignin, selectAuth, requestStatus } from "../../../store/authSlice.js";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: radial-gradient(at 50% 20%, rgb(255, 255, 255) 70%, rgb(196, 196, 196) 90%);
`;

const ContentWrapper = styled.div`
  position: relative;
  top: 25%;
  margin-left: 50px;
  margin-right: 117px;
  height: calc(217 / 800 * 100%);
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: calc(120 / 1280 * 100%);
`;

const HeadingWrapper = styled.div`
  flex-basis: 522px;
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 48px;
  font-weight: bolder;
`;

const HeadingDescription = styled.p`
  text-align: center;
  font-size: 28px;
  font-weight: normal;
  color: #808080;
`;

const FormWrapper = styled.form`
  flex-basis: 404px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const FormInput = styled.input`
  font-size: 28px;
  padding: 10px;
  border-radius: 10px;
  border-color: #c4c4c4;
  border-width: 1px;
  padding-left: 12px;
  border-width: 1px;
  color: #808080;

  &::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #c4c4c4;
    font-size: 28px;
    font-weight: normal;
    opacity: 1; /* Firefox */
  }
  &:focus {
    outline: none;
  }
`;

const FormButton = styled.button`
  background-color: #52c41a;
  color: white;
  font-size: 28px;
  font-weight: bold;
  height: 54px;

  border-radius: 10px;
  border-width: 1px;
  border-color: aliceblue;
`;

export default function Signin() {
  const dispatch = useDispatch();
  const { requestStatus: loadingStatus, authenticated } = useSelector(selectAuth);
  const [inputUserName, setInputUserName] = useState("");

  const onInputNewUserNameChange = (e) => {
    setInputUserName(e.target.value);
  };
  const onSigninClick = (e) => {
    e.preventDefault();
    dispatch(requestToSignin(inputUserName));
  };
  const onKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (inputUserName.length === 0) return;
    onSigninClick(e);
  };

  const render = (
    <Wrapper>
      <ContentWrapper>
        <HeadingWrapper>
          <Heading>WebRTC Group Chat</Heading>
          <HeadingDescription>Make P2P features possible</HeadingDescription>
        </HeadingWrapper>
        <FormWrapper>
          <FormInput
            placeholder='Enter your username ...'
            onChange={onInputNewUserNameChange}
            value={inputUserName}
            onKeyDown={onKeyDown}
            autoFocus
          />
          <FormButton
            type='button'
            onClick={onSigninClick}
          >
            Sign in
          </FormButton>
        </FormWrapper>
      </ContentWrapper>

      {/* {loadingStatus === requestStatus.loading && (
        <RotatingLines
          strokeColor='grey'
          strokeWidth='5'
          animationDuration='0.75'
          width='20'
          height='20'
          visible={true}
        />
      )} */}
    </Wrapper>
  );

  if (authenticated) {
    return <Navigate to={"/room-list"} />;
  }
  return render;
}
