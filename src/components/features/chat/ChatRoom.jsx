import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import style from "./ChatRoom.module.css";
import { selectRoom } from "../roomSlice";
import MediaController from "./MediaController.jsx";
import MediaRenderer from "./MediaRenderer.jsx";


export default function ChatRoom() {
  const { joinedRoomId } = useSelector(selectRoom);

  const shouldLeaveRoom = !joinedRoomId || joinedRoomId.length === 0;

  if (shouldLeaveRoom) {
    return <Navigate to={"/room-list"} />;
  }

  return (
    <main className={style.mainContainer}>
      <section className={style.mediaSectionContainer}>
        <div className={style.mediaRendererContainer}>
          <MediaRenderer />
        </div>
        <div className={style.mediaControllerContainer}>
          <MediaController />
        </div>
      </section>
      <section className={style.messageSectionContainer}>Message chat here</section>
    </main>
  );
}
