import React from "react";
import styled from "styled-components";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectRoom } from "../../../redux/roomSlice";
import MediaController from "./MediaController.jsx";
import MediaRenderer from "./MediaRenderer.jsx";
import { MediaRenderingContextProvider } from "../../context/media-rendering-context";
import { selectAuth } from "../../../redux/authSlice";

const sharedStyleValues = {
  messageContainerWidth: 291,
  mediaControllerContainerHeight: 116,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const MediaContainer = styled.div`
  flex: 0 0 calc(100% - ${sharedStyleValues.messageContainerWidth}px);
  height: 100%;
`;

const MediaRendererContainer = styled.div`
  width: 100%;
  height: calc(100% - ${sharedStyleValues.mediaControllerContainerHeight}px);
`;

const MediaControllerContainer = styled.div`
  width: 100%;
  height: ${sharedStyleValues.mediaControllerContainerHeight}px;
  box-sizing: border-box;
  border-top: 1px solid #c4c4c4;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const MessageContainer = styled.div`
  flex: 0 0 ${sharedStyleValues.messageContainerWidth}px;
  width: ${sharedStyleValues.messageContainerWidth}px;
  height: 100%;
`;

export default function ChatRoom() {
  const { authenticatedUserId } = useSelector(selectAuth);
  const { joinedRoomId } = useSelector(selectRoom);

  const shouldLeaveRoom = !joinedRoomId || joinedRoomId.length === 0;
  if (shouldLeaveRoom) {
    return <Navigate to={"/room-list"} />;
  }

  return (
    <Wrapper>
      <MediaContainer>
        <MediaRenderingContextProvider authenticatedUserId={authenticatedUserId}>
          <MediaRendererContainer>
            <MediaRenderer />
          </MediaRendererContainer>
          <MediaControllerContainer>
            <MediaController />
          </MediaControllerContainer>
        </MediaRenderingContextProvider>
      </MediaContainer>
      <MessageContainer>Notification chat here</MessageContainer>
    </Wrapper>
  );
}
