import React from "react";
import styled from "styled-components";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectHasJoinedRoom } from "store/roomSlice";
import MediaController from "./media_chat/MediaController";
import MediaRenderer from "./media_chat/MediaRenderer";
import MessageTypeSwitch from "./message_chat/MessageTypeSwitch";
import MessageBox from "./message_chat/MessageBox";
import MessageSender from "./message_chat/MessageSender";

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
  const hasJoinedRoom = useSelector(selectHasJoinedRoom,);

  if (!hasJoinedRoom) {
    return <Navigate to={"/room-list"} />;
  }

  return (
    <Wrapper>
      {/* media chat */}
      <MediaContainer>
        <MediaRendererContainer>
          <MediaRenderer />
        </MediaRendererContainer>
        <MediaControllerContainer>
          <MediaController />
        </MediaControllerContainer>
      </MediaContainer>

      {/* message chat */}
      <MessageContainer>
        <MessageTypeSwitchContainer>
          <MessageTypeSwitch />
        </MessageTypeSwitchContainer>
        <MessageBoxContainer>
          <MessageBox />
        </MessageBoxContainer>
        <MessageSenderContainer>
          <MessageSender />
        </MessageSenderContainer>
      </MessageContainer>
    </Wrapper>
  );
}
