import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";

import style from "./RoomList.module.css";
import {
  selectRoom,
  requestStatus,
  toggleNewRoomPopupVisibility,
  joinRoom,
  createRoom,
} from "../roomSlice.js";

export default function RoomList() {
  const dispatch = useDispatch();
  const {
    roomList,
    requestStatus: loadingStatus,
    isNewRoomPopupVisible,
    joinedRoomId,
  } = useSelector(selectRoom);
  const [newRoomNameInputValue, setNewRoomNameInputValue] = useState("");

  const handleNewRoomPopupVisibilityToggled = () => {
    setNewRoomNameInputValue("");
    dispatch(toggleNewRoomPopupVisibility(!isNewRoomPopupVisible));
  };
  const handleNewRoomNameInputChanged = (e) => {
    setNewRoomNameInputValue(e.target.value);
  };
  const handleNewRoomNameConfirmed = (e) => {
    handleNewRoomPopupVisibilityToggled();
    dispatch(createRoom(newRoomNameInputValue));
  };
  const handleNewRoomNameInputKeyDown = (e) => {
    if (e.key !== "Enter") return;
    handleNewRoomNameConfirmed();
  };
  const handleRoomJoined = (roomId) => {
    dispatch(joinRoom(roomId));
  };
  const focusDOM = (someDOM) => {
    if (someDOM && someDOM.focus) {
      someDOM.focus();
    }
  }

  if (loadingStatus === requestStatus.loading) {
    return (
      <RotatingLines
        strokeColor='grey'
        strokeWidth='5'
        animationDuration='0.75'
        width='20'
        height='20'
        visible={true}
      />
    );
  }

  const hasJoinedRoom = joinedRoomId && joinedRoomId.length > 0;
  const newRoomPopupBackgroundClassName = !isNewRoomPopupVisible
    ? `${style.popupBackground}`
    : `${style.popupBackground} ${style.popupBackgroundShow}`;
  const newRoomPopupContentClassName = !isNewRoomPopupVisible
    ? `${style.popupContent}`
    : `${style.popupContent} ${style.popupConentShow}`;
  const render = (
    <>
      {/* popup background */}
      <div
        className={newRoomPopupBackgroundClassName}
        onClick={handleNewRoomPopupVisibilityToggled}
      />
      {/* popup */}
      <div className={newRoomPopupContentClassName}>
        <button
          className={style.popupClose}
          onClick={handleNewRoomPopupVisibilityToggled}
        />
        <h4 className={style.popupTitle}>Create New Room</h4>
        <input
          className={style.popupInput}
          placeholder='Enter your new room name ...'
          onChange={handleNewRoomNameInputChanged}
          onKeyDown={handleNewRoomNameInputKeyDown}
          value={newRoomNameInputValue}
          ref={(inputDOM) => {
            focusDOM(inputDOM)
          }}
        />
        <button
          className={style.popupConfirm}
          onClick={handleNewRoomNameConfirmed}
        >
          Confirm
        </button>
      </div>
      {/* room list */}
      <ul className={style.roomListContainer}>
        {Object.keys(roomList).map((roomId) => (
          <li
            key={roomId}
            className={style.roomItemContainer}
          >
            <h4 className={style.roomItemTitle}>{roomList[roomId].name}</h4>
            <button
              className={style.roomItemJoiningButton}
              onClick={(e) => {
                handleRoomJoined(roomId);
              }}
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </>
  );

  if (hasJoinedRoom) {
    return <Navigate to={"/chat-room"} />;
  }
  return <>{render}</>;
}
