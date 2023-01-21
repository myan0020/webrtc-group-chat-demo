import React, { useContext, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
// import { RotatingLines } from "react-loader-spinner";

import {
  toggleNewRoomPopupVisibility,
  joinRoom,
  createRoom,
  selectHasJoinedRoom,
  selectNewRoomPopupVisible,
  selectRoomList,
} from "store/roomSlice";
import closeImageUrl from "resource/image/close_3x.png";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import { GlobalContext } from "context/global-context";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
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
  overflow: auto;
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

function RoomListToMemo({
  localizedStrings,
  newRoomNameInputValue,
  setNewRoomNameInputValue,
}) {
  const dispatch = useDispatch();

  const isNewRoomPopupVisible = useSelector(selectNewRoomPopupVisible);
  const roomList = useSelector(selectRoomList);

  const newRoomPopupBackgroundVisibility = isNewRoomPopupVisible ? "visible" : "hidden";
  const newRoomPopupBackgroundOpacity = isNewRoomPopupVisible ? 1 : 0;
  const newRoomPopupBackgroundTransformScale = isNewRoomPopupVisible ? 1 : 1.1;

  const newRoomPopupContentVisibility = isNewRoomPopupVisible ? "visible" : "hidden";
  const newRoomPopupContentOpacity = isNewRoomPopupVisible ? 1 : 0;

  const handleNewRoomPopupVisibilityToggled = () => {
    setNewRoomNameInputValue("");
    dispatch(toggleNewRoomPopupVisibility());
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
    if (!isNewRoomPopupVisible) return;
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
        <PopupContentTitle>
          {localizedStrings[localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_TITLE]}
        </PopupContentTitle>
        <PopupContentInput
          placeholder={
            localizedStrings[localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_INPUT_PLACEHOLDER]
          }
          onChange={handleNewRoomNameInputChanged}
          onKeyDown={handleNewRoomNameInputKeyDown}
          value={newRoomNameInputValue}
          ref={(inputDOM) => {
            focusDOM(inputDOM);
          }}
        />
        <PopupContentConfirmButton onClick={handleNewRoomNameConfirmed}>
          {localizedStrings[localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_COMFIRM]}
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
              {localizedStrings[localizableStringKeyEnum.ROOM_LIST_JOIN_ROOM]}
            </RoomItemButton>
          </RoomItemWrapper>
        ))}
      </RoomListWrapper>
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isNewRoomNameInputValueEqual = Object.is(
    prevProps.newRoomNameInputValue,
    nextProps.newRoomNameInputValue
  );
  const isSetNewRoomNameInputValueEqual = Object.is(
    prevProps.setNewRoomNameInputValue,
    nextProps.setNewRoomNameInputValue
  );
  return (
    isLocalizedStringEqual &&
    isNewRoomNameInputValueEqual &&
    isSetNewRoomNameInputValueEqual
  );
};

const MemorizedRoomList = React.memo(RoomListToMemo, arePropsEqual);

export default function RoomList() {
  const hasJoinedRoom = useSelector(selectHasJoinedRoom);
  const { localizedStrings } = useContext(GlobalContext);
  const [newRoomNameInputValue, setNewRoomNameInputValue] = useState("");

  if (hasJoinedRoom) {
    return <Navigate to={"/chat-room"} />;
  }

  return (
    <MemorizedRoomList
      localizedStrings={localizedStrings}
      newRoomNameInputValue={newRoomNameInputValue}
      setNewRoomNameInputValue={setNewRoomNameInputValue}
    />
  );
}
