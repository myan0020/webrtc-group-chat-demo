import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { LocalizationContext } from "context/localization-context";
import { toggleNewRoomPopupVisibility, selectRoom } from "store/roomSlice";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  flex-direction: row;
`;

const Title = styled.h4`
  color: rgb(255, 255, 255);
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  margin-right: 40px;
`;

const Button = styled.button`
  flex: 0 0 80px;
  border: 1px solid rgb(255, 255, 255);
  border-radius: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  background-color: transparent;
  display: inline-block;
  width: 80px;
  height: 35px;
  visibility: ${(props) => props.visibility};
`;

export default function NewRoomNavigator() {
  const dispatch = useDispatch();
  const { localizedStrings } = useContext(LocalizationContext);
  const { isNewRoomPopupVisible, joinedRoomId, joinedRoomName } = useSelector(selectRoom);

  const handleNewRoomPopupVisibilityToggled = () => {
    dispatch(toggleNewRoomPopupVisibility(!isNewRoomPopupVisible));
  };

  const hasJoinedRoom = joinedRoomId && joinedRoomId.length > 0;
  const title = hasJoinedRoom ? joinedRoomName : localizedStrings[localizableStringKeyEnum.NAVIGATION_ROOM_LIST_TITLE];
  const buttonVisibility = hasJoinedRoom ? "hidden" : "visible";

  return (
    <Wrapper>
      <Title>{title}</Title>
      <Button
        visibility={buttonVisibility}
        onClick={handleNewRoomPopupVisibilityToggled}
      >
        {localizedStrings[localizableStringKeyEnum.NAVIGATION_CREATE_NEW_ROOM]}
      </Button>
    </Wrapper>
  );
}
