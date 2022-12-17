import React, { useContext, useRef, useState } from "react";
import styled from "styled-components";
import { LocalizationContext } from "../../../../context/localization-context";

import { MessageContext, messageTypeEnum } from "../../../../context/message-context";
import { localizableStringKeyEnum } from "../../../../util/localizable-strings";
import messageSendBubbleImageUrl from "./images/send_message_bubble_3x.png";
import messageSendPlaneImageUrl from "./images/send_message_plane_3x.png";

const sharedStyleValues = {
  contentHeight: 48,
  contentMarginBottom: 30,
  contentHorizontalMargin: 15,
  contentBorderRadius: 10,

  messageInputMarginLeft: 10,
  messageInputVerticalMargin: 6,

  messageSendMarginRight: 2,
  messageSendVerticalMargin: 5,
  messageSendWidth: 44,
};

const messageInputTypeEnum = {
  MESSAGE_INPUT_TYPE_TEXT: 1,
  MESSAGE_INPUT_TYPE_FILE: 2,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: end;
`;

const ContentWrapper = styled.div`
  margin-left: ${sharedStyleValues.contentHorizontalMargin}px;
  margin-right: ${sharedStyleValues.contentHorizontalMargin + 100}px;
  margin-bottom: ${sharedStyleValues.contentMarginBottom}px;
  box-sizing: border-box;
  width: calc(100% - ${sharedStyleValues.contentHorizontalMargin * 2}px);
  height: ${sharedStyleValues.contentHeight}px;
  border: 1px ${(props) => props.borderStyle} rgb(196, 196, 196);
  border-radius: ${sharedStyleValues.contentBorderRadius}px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const MessageInputWrapper = styled.div`
  box-sizing: border-box;
  border-color: transparent;
  width: calc(
    100% -
      ${sharedStyleValues.messageSendWidth +
      sharedStyleValues.messageSendMarginRight +
      sharedStyleValues.messageInputMarginLeft}px
  );
  height: calc(100% - ${sharedStyleValues.messageInputVerticalMargin * 2}px);
  margin: ${sharedStyleValues.messageInputVerticalMargin}px 0
    ${sharedStyleValues.messageInputVerticalMargin}px ${sharedStyleValues.messageInputMarginLeft}px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(128, 128, 128);
`;

const MessageInput = styled.input.attrs((props) => {
  if (
    props.inputType === messageInputTypeEnum.MESSAGE_INPUT_TYPE_TEXT &&
    typeof props.inputTextValue === "string"
  ) {
    return {
      type: "text",
      value: props.inputTextValue,
    };
  } else if (props.inputType === messageInputTypeEnum.MESSAGE_INPUT_TYPE_FILE) {
    return {
      type: "file",
      multiple: true,
    };
  }
})`
  display: ${(props) => props.display};
  box-sizing: border-box;
  border-color: transparent;
  color: rgb(128, 128, 128);
  background-color: transparent;
  width: 100%;
  height: 100%;
  &::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: rgb(196, 196, 196);
    font-size: 16px;
    font-weight: normal;
    opacity: 1; /* Firefox */
  }
  &:focus {
    outline: none;
  }
`;

const MessageSendButton = styled.button`
  box-sizing: border-box;
  width: ${sharedStyleValues.messageSendWidth}px;
  height: calc(100% - ${sharedStyleValues.messageSendVerticalMargin * 2}px);
  flex: 0 0 ${sharedStyleValues.messageSendWidth}px;
  margin-left: 0px;
  margin-right: ${sharedStyleValues.messageSendMarginRight}px;
  margin-top: ${sharedStyleValues.messageSendVerticalMargin}px;
  margin-bottom: ${sharedStyleValues.messageSendVerticalMargin}px;
  background-image: url(${messageSendBubbleImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-color: transparent;
  background-color: transparent;
`;

export const MessageSenderPropsBuilder = ({}) => {
  return {};
};

export default function MessageSender({}) {
  const { localizedStrings } = useContext(LocalizationContext);
  const { inputFiles, sendFiles, updateInputFiles, visibleMessageType, sendTextToAllPeer } =
    useContext(MessageContext);
  const messageInputRef = useRef(null);
  const messageSendRef = useRef(null);
  const [inputText, setInputText] = useState("");

  const inputFilesCount = inputFiles ? inputFiles.length : 0;

  let contentBorderStyle = "solid";
  let messageInputWrapperText = undefined;
  let messageInputDisplayment = "block";
  let messageInputType = messageInputTypeEnum.MESSAGE_INPUT_TYPE_TEXT;

  const messageInputTextAligment = "start";
  const messageInputPlaceholder =
    localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TEXT_INPUT_PLACEHOLDER];

  if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_TEXT) {
    contentBorderStyle = "solid";
    messageInputWrapperText = undefined;
    messageInputDisplayment = "block";
    messageInputType = messageInputTypeEnum.MESSAGE_INPUT_TYPE_TEXT;
  } else if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_FILE) {
    contentBorderStyle = "dashed";
    messageInputWrapperText =
      inputFilesCount === 0
        ? localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_IDLE]
        : `${inputFilesCount} ${
            inputFilesCount === 1
              ? localizedStrings[
                  localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE
                ]
              : localizedStrings[
                  localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE
                ] + localizedStrings[
                  localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE_PLURAL
                ]
          } ${localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_ADDED]}`;
    messageInputDisplayment = "none";
    messageInputType = messageInputTypeEnum.MESSAGE_INPUT_TYPE_FILE;
  }

  const handleMessageInputChange = (e) => {
    if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_TEXT) {
      const text = e.target.value;
      setInputText(text);
    } else if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_FILE) {
      const inputFiles = e.target.files;
      updateInputFiles(inputFiles);
    }
  };

  const handleMessageInputWrapperClick = () => {
    if (visibleMessageType !== messageTypeEnum.MESSAGE_TYPE_FILE) {
      return;
    }
    if (messageInputRef.current) {
      messageInputRef.current.click();
    }
  };

  const handleMessageInputKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (messageSendRef.current) {
      messageSendRef.current.click();
    }
  };

  const handleMessageSendClick = () => {
    if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_TEXT) {
      sendTextToAllPeer(inputText);
      setInputText("");
    } else if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_FILE) {
      sendFiles();
    }
  };

  return (
    <Wrapper>
      <ContentWrapper borderStyle={contentBorderStyle}>
        <MessageInputWrapper onClick={handleMessageInputWrapperClick}>
          {messageInputWrapperText && messageInputWrapperText}
          <MessageInput
            display={messageInputDisplayment}
            ref={messageInputRef}
            placeholder={messageInputPlaceholder}
            textAligment={messageInputTextAligment}
            inputType={messageInputType}
            onChange={handleMessageInputChange}
            inputTextValue={inputText}
            onKeyDown={handleMessageInputKeyDown}
            autoFocus
          />
        </MessageInputWrapper>
        <MessageSendButton
          ref={messageSendRef}
          onClick={handleMessageSendClick}
        />
      </ContentWrapper>
    </Wrapper>
  );
}
