import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import style from "./MediaController.module.css";

export default function MediaController() {
  return (
    <div className={style.backgroundContainer}>
      <VideoEnableButton />
      <AudioEnableButton />
      <CallingButton />
      <MoreButton />
    </div>
  );
}

function CallingButton() {
  return <div className={style.callingBackgroundContainer}>Start Call</div>;
}

function AudioEnableButton() {
  return <div className={style.audioEnableBackgroundContainer}>AudioEn</div>;
}

function VideoEnableButton() {
  return <div className={style.videoEnableBackgroundContainer}>VideoEn</div>;
}

function MoreButton() {
  return <div className={style.moreContainer}>More</div>;
}
