import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";

import {
  selectRoom,
  requestStatus,
  toggleNewRoomPopupVisibility,
  joinRoom,
  createRoom,
} from "../../../store/roomSlice.js";
import closeImageUrl from "./images/close_3x.png";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: scroll;
`;

const PopupBackgroundWrapper = styled.div`
  visibility: ${(props) => props.visibility};
  opacity: ${(props) => props.opacity};
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transform: scale(${(props) => props.transformScale});
  transition: visibility 0s linear 0s, opacity 0.25s 0s, transform 0.25s;
`;

const PopupContentWrapper = styled.div`
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  left: 50%;
  background-color: #ffffff;
  padding: 10px;
  width: 404px;
  border-radius: 15px;
  height: 250px;

  opacity: ${(props) => props.opacity};
  visibility: ${(props) => props.opacity};
  transform: translate(-50%, -50%);
  transition: visibility 0s linear 0s, opacity 0.25s 0s;
`;

const PopupContentCloseButton = styled.button`
  float: right;
  width: 20px;
  height: 20px;
  cursor: pointer;
  background-color: transparent;
  background-image: url(${closeImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  border-color: transparent;
`;

const PopupContentTitle = styled.h4`
  margin-top: 30px;
  margin-bottom: 25px;
  text-align: center;
  font-weight: bold;
  font-size: 28px;
  color: #808080;
`;

const PopupContentInput = styled.input`
  margin-top: 32px;
  display: block;
  height: 50px;
  border-radius: 10px;
  border-color: #808080;
  border-width: 1px;
  width: 340px;
  margin: auto;
  font-size: 24px;
  padding: 0px;
  padding-left: 10px;
  padding-right: 10px;
  font-weight: normal;
  color: #808080;

  &::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #c4c4c4;
    font-size: 22px;
    font-weight: normal;
    opacity: 1; /* Firefox */
  }
  &:focus {
    outline: none;
  }
`;

const PopupContentConfirmButton = styled.button`
  display: block;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #1890ff;
  color: #ffffff;
  border-color: transparent;
  border-radius: 10px;
  width: 150px;
  height: 45px;
  margin: auto;
  margin-top: 25px;
`;

const RoomListWrapper = styled.ul`
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  margin: 0;
  padding-left: 340px;
  padding-right: 340px;
  padding-top: 50px;
  padding-bottom: 50px;
  height: 100%;
  overflow: scroll;
`;

const RoomItemWrapper = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  list-style-type: none;
  border: 1px solid #c4c4c4;
  border-radius: 15px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const RoomItemTitle = styled.div`
  text-align: center;
  margin: 0;
  height: 36px;
  width: 200px;
  font-size: 24px;
  margin-top: 0px;
  margin-bottom: 0px;
  color: #808080;
  font-weight: bold;
  margin-left: 32px;
  text-align: left;
`;

const RoomItemButton = styled.button`
  display: block;
  background-color: #1890ff;
  color: #ffffff;
  border-color: transparent;
  border-radius: 10px;
  height: 40px;
  width: 100px;
  font-size: 20px;
  font-weight: bold;
  margin-right: 38px;
`;

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
  };

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

  const newRoomPopupBackgroundVisibility = isNewRoomPopupVisible ? "visible" : "hidden";
  const newRoomPopupBackgroundOpacity = isNewRoomPopupVisible ? 1 : 0;
  const newRoomPopupBackgroundTransformScale = isNewRoomPopupVisible ? 1 : 1.1;

  const newRoomPopupContentVisibility = isNewRoomPopupVisible ? "visible" : "hidden";
  const newRoomPopupContentOpacity = isNewRoomPopupVisible ? 1 : 0;

  if (hasJoinedRoom) {
    return <Navigate to={"/chat-room"} />;
  }
  return (
    <Wrapper>
      {/* popup background */}

      <PopupBackgroundWrapper
        visibility={newRoomPopupBackgroundVisibility}
        opacity={newRoomPopupBackgroundOpacity}
        transformScale={newRoomPopupBackgroundTransformScale}
        onClick={handleNewRoomPopupVisibilityToggled}
      />

      {/* popup */}

      <PopupContentWrapper
        visibility={newRoomPopupContentVisibility}
        opacity={newRoomPopupContentOpacity}
      >
        <PopupContentCloseButton onClick={handleNewRoomPopupVisibilityToggled} />
        <PopupContentTitle>Create New Room</PopupContentTitle>
        <PopupContentInput
          placeholder='Enter your new room name ...'
          onChange={handleNewRoomNameInputChanged}
          onKeyDown={handleNewRoomNameInputKeyDown}
          value={newRoomNameInputValue}
          ref={(inputDOM) => {
            focusDOM(inputDOM);
          }}
        />
        <PopupContentConfirmButton onClick={handleNewRoomNameConfirmed}>
          Confirm
        </PopupContentConfirmButton>
      </PopupContentWrapper>

      {/* room list */}

      <RoomListWrapper>
        {Object.keys(roomList).map((roomId) => (
          <RoomItemWrapper key={roomId}>
            <RoomItemTitle>{roomList[roomId].name}</RoomItemTitle>
            <RoomItemButton
              onClick={(e) => {
                handleRoomJoined(roomId);
              }}
            >
              Join
            </RoomItemButton>
          </RoomItemWrapper>
        ))}
      </RoomListWrapper>
    </Wrapper>
  );
}
