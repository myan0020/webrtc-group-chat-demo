import React from "react";
import styled from "styled-components";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectRoom } from "../../../store/roomSlice";
import MediaController from "./media-chat/MediaController.jsx";
import MediaRenderer from "./media-chat/MediaRenderer.jsx";
import { MediaRenderingContextProvider } from "../../../context/media-rendering-context";
import MessageTypeSwitch from "./message-chat/MessageTypeSwitch.jsx";
import MessageBox from "./message-chat/MessageBox.jsx";
import MessageSender from "./message-chat/MessageSender.jsx";
import { MessageContextProvider } from "../../../context/message-context";

const sharedStyleValues = {
  mediaControllerContainerHeight: 116,
  messageContainerWidth: 328,
  messageTypeSwitchContainerHeight: 60,
  messageSenderContainerHeight: 120,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: rgb(250, 250, 250);
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
  justify-content: end;
  flex-direction: column;
`;

const MessageContainer = styled.div`
  flex: 0 0 ${sharedStyleValues.messageContainerWidth}px;
  height: 100%;
`;

const MessageTypeSwitchContainer = styled.div`
  height: ${sharedStyleValues.messageTypeSwitchContainerHeight}px;
`;

const MessageBoxContainer = styled.div`
  height: calc(
    100% -
      ${sharedStyleValues.messageTypeSwitchContainerHeight +
      sharedStyleValues.mediaControllerContainerHeight}px
  );
`;

const MessageSenderContainer = styled.div`
  height: ${sharedStyleValues.messageSenderContainerHeight}px;
`;

export default function ChatRoom() {
  const { joinedRoomId } = useSelector(selectRoom);

  const shouldLeaveRoom = !joinedRoomId || joinedRoomId.length === 0;
  if (shouldLeaveRoom) {
    return <Navigate to={"/room-list"} />;
  }

  return (
    <Wrapper>
      <MediaContainer>
        <MediaRenderingContextProvider>
          <MediaRendererContainer>
            <MediaRenderer />
          </MediaRendererContainer>
          <MediaControllerContainer>
            <MediaController />
          </MediaControllerContainer>
        </MediaRenderingContextProvider>
      </MediaContainer>
      <MessageContainer>
        <MessageContextProvider>
          <MessageTypeSwitchContainer>
            <MessageTypeSwitch />
          </MessageTypeSwitchContainer>
          <MessageBoxContainer>
            <MessageBox />
          </MessageBoxContainer>
          <MessageSenderContainer>
            <MessageSender />
          </MessageSenderContainer>
        </MessageContextProvider>
      </MessageContainer>
    </Wrapper>
  );
}
