import React from "react";
import { useDispatch, useSelector } from "react-redux";

import style from "./NavigationBar.module.css";
import { requestToSignout, selectAuth } from "../authSlice.js";
import {
  toggleNewRoomPopupVisibility,
  selectRoom,
  leaveRoom,
} from "../roomSlice.js";

export default function NavigationBar() {
  const dispatch = useDispatch();
  const { authenticatedUserName } = useSelector(selectAuth);
  const { isNewRoomPopupVisible, joinedRoomId, joinedRoomName } = useSelector(selectRoom);

  const handleRoomLeaved = () => {
    dispatch(leaveRoom());
  };
  const handleNewRoomPopupVisibilityToggled = () => {
    dispatch(toggleNewRoomPopupVisibility(!isNewRoomPopupVisible));
  };
  const handleSignoutClicked = () => {
    dispatch(requestToSignout());
  };

  const hasJoinedRoom = joinedRoomId && joinedRoomId.length > 0;
  const title = hasJoinedRoom ? joinedRoomName : "Avaliable Chat Rooms";
  const leftPartClassName = !hasJoinedRoom
    ? `${style.leftPartContainer}`
    : `${style.leftPartContainer} ${style.leftPartContainerShow}`;
  const newRoomPopupTriggerClassName = hasJoinedRoom
    ? `${style.newRoomPopupTriggerContainer}`
    : `${style.newRoomPopupTriggerContainer} ${style.newRoomPopupTriggerContainerShow}`;

  const render = (
    <nav className={style.backgroundContainer}>
      {/* left part */}
      <div
        className={leftPartClassName}
        onClick={handleRoomLeaved}
      >
        <button
          className={style.back}
          onClick={handleRoomLeaved}
        />
      </div>

      {/* main part */}
      <div className={style.mainPartContainer}>
        <h4 className={style.titleContainer}>{title}</h4>
        <button
          className={newRoomPopupTriggerClassName}
          onClick={handleNewRoomPopupVisibilityToggled}
        >
          New
        </button>
      </div>

      {/* right part */}
      <div className={style.rightPartContainer}>
        <div className={style.userNameContainer}>Hi, {authenticatedUserName}</div>
        <button
          className={style.signoutContainer}
          onClick={handleSignoutClicked}
        >
          Sign out
        </button>
      </div>
    </nav>
  );

  return <>{render}</>;
}
