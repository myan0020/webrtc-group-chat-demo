import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { leaveRoom, selectHasJoinedRoom } from "store/roomSlice";
import goBackImageUrl from "resource/image/go_back_3x.png";
import { GlobalContext } from "context/global-context";
import { reset as resetTextChatSlice } from "store/textChatSlice";
import { reset as resetMediaChatSlice } from "store/mediaChatSlice";

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

function GoBackNavigatorToMemo({ visibility, resetMediaRenderingContext, resetMessageContext }) {
  const dispatch = useDispatch();
  const handleRoomLeaved = () => {
    // media
    dispatch(resetMediaChatSlice());
    resetMediaRenderingContext();

    // message
    dispatch(resetTextChatSlice());
    resetMessageContext();

    // room
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
  const isVisibilityEqual = Object.is(prevProps.visibility, nextProps.visibility);
  const isResetMediaRenderingContextEqual = Object.is(
    prevProps.resetMediaRenderingContext,
    nextProps.resetMediaRenderingContext
  );
  const isResetMessageContextEqual = Object.is(
    prevProps.resetMessageContext,
    nextProps.resetMessageContext
  );
  return isVisibilityEqual && isResetMediaRenderingContextEqual && isResetMessageContextEqual;
};

const MemorizedGoBackNavigator = React.memo(GoBackNavigatorToMemo, arePropsEqual);

export default function GoBackNavigator() {
  const hasJoinedRoom = useSelector(selectHasJoinedRoom);
  const { resetMediaRenderingContext, resetMessageContext } = useContext(GlobalContext);

  const visibility = !hasJoinedRoom ? "hidden" : "visible";

  return (
    <MemorizedGoBackNavigator
      visibility={visibility}
      resetMediaRenderingContext={resetMediaRenderingContext}
      resetMessageContext={resetMessageContext}
    />
  );
}
