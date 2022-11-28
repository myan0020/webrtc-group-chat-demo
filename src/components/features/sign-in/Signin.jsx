import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";

import style from "./Signin.module.css";
import { requestToSignin, selectAuth, requestStatus } from "../authSlice.js";

export default function Signin() {
  const dispatch = useDispatch();
  const { requestStatus: loadingStatus, authenticated } = useSelector(selectAuth);
  const [inputUserName, setInputUserName] = useState("");

  const onInputNewUserNameChange = (e) => {
    setInputUserName(e.target.value);
  };
  const onSigninClick = (e) => {
    dispatch(requestToSignin(inputUserName));
  };
  const onKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (inputUserName.length === 0) return;
    onSigninClick(e);
  };

  const render = (
    <div className={style.backgroundContainer}>
      <div className={style.contentContainer}>
        <section className={style.titleContainer}>
          <h1 className={style.title}>WebRTC Group Chat</h1>
          <p className={style.titleDesc}>Make P2P group chat features possible</p>
        </section>
        <section className={style.formContainer}>
          <input
            placeholder='Enter your username ...'
            onChange={onInputNewUserNameChange}
            value={inputUserName}
            className={style.siginInput}
            onKeyDown={onKeyDown}
            autoFocus
          />
          <button
            type='button'
            onClick={onSigninClick}
            className={style.siginButton}
          >
            Sign in
          </button>
        </section>
      </div>

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
    </div>
  );

  if (authenticated) {
    return <Navigate to={"/room-list"} />;
  }
  return render;
}
