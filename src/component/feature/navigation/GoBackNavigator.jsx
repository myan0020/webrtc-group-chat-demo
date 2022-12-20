import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { selectRoom, leaveRoom } from "store/roomSlice";
import goBackImageUrl from "resource/image/go_back_3x.png";
import { GlobalContext } from "context/global-context";

const Wrapper = styled.button`
  width: 100%;
  height: 100%;
  visibility: ${(props) => props.visibility};
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(${goBackImageUrl});
  background-color: transparent;
  border-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: calc(100% / 3);
`;

function GoBackNavigatorToMemo({
  visibility,
  clearTextMessageContext,
  clearAllFileInput,
  clearFileMessageContext,
}) {
  const dispatch = useDispatch();
  const handleRoomLeaved = () => {
    clearTextMessageContext();
    clearAllFileInput();
    clearFileMessageContext();
    dispatch(leaveRoom());
  };

  return (
    <Wrapper
      visibility={visibility}
      onClick={handleRoomLeaved}
    />
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isClearTextMessageContextEqual = Object.is(
    prevProps.clearTextMessageContext,
    nextProps.clearTextMessageContext
  );
  const isClearAllFileInputEqual = Object.is(
    prevProps.clearAllFileInput,
    nextProps.clearAllFileInput
  );
  const isClearFileMessageContextEqual = Object.is(
    prevProps.clearFileMessageContext,
    nextProps.clearFileMessageContext
  );
  return (
    isLocalizedStringEqual &&
    isClearTextMessageContextEqual &&
    isClearAllFileInputEqual &&
    isClearFileMessageContextEqual
  );
};

const MemorizedGoBackNavigator = React.memo(GoBackNavigatorToMemo, arePropsEqual);

export default function GoBackNavigator() {
  const { joinedRoomId } = useSelector(selectRoom);
  const { clearTextMessageContext, clearAllFileInput, clearFileMessageContext } =
    useContext(GlobalContext);

  const hasJoinedRoom = joinedRoomId && joinedRoomId.length > 0;
  const visibility = !hasJoinedRoom ? "hidden" : "visible";

  return (
    <MemorizedGoBackNavigator
      visibility={visibility}
      clearTextMessageContext={clearTextMessageContext}
      clearAllFileInput={clearAllFileInput}
      clearFileMessageContext={clearFileMessageContext}
    />
  );
}
