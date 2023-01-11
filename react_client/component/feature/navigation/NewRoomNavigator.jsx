import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import {
  toggleNewRoomPopupVisibility,
  selectHasJoinedRoom,
  selectJoinedRoomName,
} from "store/roomSlice";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import { GlobalContext } from "context/global-context";

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
  margin-right: 20px;
`;

const Button = styled.button`
  flex: 0 0 60px;
  border: 1px solid rgb(255, 255, 255);
  border-radius: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  background-color: transparent;
  display: inline-block;
  width: 60px;
  height: 30px;
  visibility: ${(props) => props.visibility};
  margin-top: 2px;
`;

function NewRoomNavigatorToMemo({ localizedStrings }) {
  const dispatch = useDispatch();

  const hasJoinedRoom = useSelector(selectHasJoinedRoom);
  const joinedRoomName = useSelector(selectJoinedRoomName);

  const handleNewRoomPopupVisibilityToggled = () => {
    dispatch(toggleNewRoomPopupVisibility());
  };

  const title = hasJoinedRoom
    ? joinedRoomName
    : localizedStrings[localizableStringKeyEnum.NAVIGATION_ROOM_LIST_TITLE];
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

const arePropsEqual = (prevProps, nextProps) => {
  return Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
};

const MemorizedNewRoomNavigator = React.memo(NewRoomNavigatorToMemo, arePropsEqual);

export default function NewRoomNavigator() {
  const { localizedStrings } = useContext(GlobalContext);
  return <MemorizedNewRoomNavigator localizedStrings={localizedStrings} />;
}
