import * as React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import { leaveRoom, updateJoinedRoomId } from "store/roomSlice";
import * as goBackImageUrl from "resource/image/go_back_3x.png";
import { GlobalContext } from "context/global-context";
import { reset as resetTextChatSlice } from "store/textChatSlice";
import { reset as resetMediaChatSlice } from "store/mediaChatSlice";

export default function GoBackNavigator() {
  const { resetMediaRenderingContext, resetMessageContext } = React.useContext(GlobalContext);
  return (
    <MemorizedGoBackNavigator
      resetMediaRenderingContext={resetMediaRenderingContext}
      resetMessageContext={resetMessageContext}
    />
  );
}

const MemorizedGoBackNavigator = React.memo(GoBackNavigatorToMemo, arePropsEqual);

function GoBackNavigatorToMemo({ resetMediaRenderingContext, resetMessageContext }) {
  const dispatch = useDispatch();
  const handleRoomLeaved = () => {
    // media
    dispatch(resetMediaChatSlice());
    resetMediaRenderingContext();

    // message
    dispatch(resetTextChatSlice());
    resetMessageContext();

    // room
    dispatch(updateJoinedRoomId({ roomId: "", roomName: "" }));
    dispatch(leaveRoom());
  };

  return <Wrapper onClick={handleRoomLeaved} />;
}

const arePropsEqual = (prevProps, nextProps) => {
  const isResetMediaRenderingContextEqual = Object.is(
    prevProps.resetMediaRenderingContext,
    nextProps.resetMediaRenderingContext
  );
  const isResetMessageContextEqual = Object.is(
    prevProps.resetMessageContext,
    nextProps.resetMessageContext
  );
  return isResetMediaRenderingContextEqual && isResetMessageContextEqual;
};

const Wrapper = styled.button`
  width: 100%;
  height: 100%;
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
