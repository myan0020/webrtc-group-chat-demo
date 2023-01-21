import React, { useContext, useRef, useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";

import { messageTypeEnum } from "context/message-context";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import enabledMessageSendBubbleImageUrl from "resource/image/send_message_bubble_enabled_3x.png";
import disabledMessageSendBubbleImageUrl from "resource/image/send_message_bubble_disabled_3x.png";
import messageSendPlaneImageUrl from "resource/image/send_message_plane_3x.png";
import { GlobalContext } from "context/global-context";
import { sendTextMessage } from "store/textChatSlice";

const messageInputTypeEnum = {
  MESSAGE_INPUT_TYPE_TEXT: 1,
  MESSAGE_INPUT_TYPE_FILE: 2,
};

export const MessageSenderPropsBuilder = ({}) => {
  return {};
};

export default function MessageSender({}) {
  const {
    localizedStrings,
    isFileSendingStatusSending,
    inputFiles,
    sendFiles,
    updateInputFiles,
    visibleMessageType,
  } = useContext(GlobalContext);
  return (
    <MemorizedMessageSender
      localizedStrings={localizedStrings}
      isFileSendingStatusSending={isFileSendingStatusSending}
      inputFiles={inputFiles}
      sendFiles={sendFiles}
      updateInputFiles={updateInputFiles}
      visibleMessageType={visibleMessageType}
    />
  );
}

const MemorizedMessageSender = React.memo(MessageSenderToMemo, arePropsEqual);

function MessageSenderToMemo({
  localizedStrings,
  isFileSendingStatusSending,
  inputFiles,
  sendFiles,
  updateInputFiles,
  visibleMessageType,
}) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const messageSendRef = useRef(null);
  const [inputText, setInputText] = useState("");

  const inputFilesCount = inputFiles ? inputFiles.length : 0;

  let contentBorderStyle = "solid";
  let fileInputInfoText = undefined;
  let messageInputDisplayment = "block";
  let messageInputType = messageInputTypeEnum.MESSAGE_INPUT_TYPE_TEXT;
  let messageSendDisabled = false;

  const textInputPlaceholder =
    localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TEXT_INPUT_PLACEHOLDER];

  if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_TEXT) {
    contentBorderStyle = "solid";
    fileInputInfoText = undefined;
    messageInputDisplayment = "block";
    messageInputType = messageInputTypeEnum.MESSAGE_INPUT_TYPE_TEXT;
    messageSendDisabled = false;
  } else if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_FILE) {
    contentBorderStyle = "dashed";
    fileInputInfoText =
      inputFilesCount === 0
        ? localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_IDLE]
        : `${inputFilesCount} ${
            inputFilesCount === 1
              ? localizedStrings[
                  localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE
                ]
              : localizedStrings[
                  localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE
                ] +
                localizedStrings[
                  localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE_PLURAL
                ]
          } ${
            localizedStrings[
              localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_ADDED
            ]
          }`;
    messageInputDisplayment = "none";
    messageInputType = messageInputTypeEnum.MESSAGE_INPUT_TYPE_FILE;
    messageSendDisabled = isFileSendingStatusSending;
  }

  const handleTextInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleFileInputChange = (e) => {
    updateInputFiles(e.target.files);
  };

  const handleMessageInputWrapperClick = () => {
    if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_FILE && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTextInputKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (messageSendRef.current) {
      messageSendRef.current.click();
    }
  };

  const handleMessageSendClick = () => {
    if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_TEXT) {
      dispatch(sendTextMessage(inputText));
      setInputText("");
    } else if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_FILE) {
      sendFiles();
    }
  };

  return (
    <Wrapper>
      <ContentWrapper borderStyle={contentBorderStyle}>
        <MessageInputWrapper onClick={handleMessageInputWrapperClick}>
          {fileInputInfoText && <FileInputInfoWrapper>{fileInputInfoText}</FileInputInfoWrapper>}
          <TextInput
            type='text'
            display={messageInputDisplayment}
            placeholder={textInputPlaceholder}
            onChange={handleTextInputChange}
            value={inputText}
            onKeyDown={handleTextInputKeyDown}
            autoFocus
          />
          <FileInput
            type='file'
            multiple
            ref={fileInputRef}
            onChange={handleFileInputChange}
          />
        </MessageInputWrapper>
        <MessageSendButton
          ref={messageSendRef}
          onClick={handleMessageSendClick}
          disabled={messageSendDisabled}
        />
      </ContentWrapper>
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isIsFileSendingStatusSendingEqual = Object.is(
    prevProps.isFileSendingStatusSending,
    nextProps.isFileSendingStatusSending
  );
  const isInputFilesEqual = Object.is(prevProps.inputFiles, nextProps.inputFiles);
  const isSendFilesEqual = Object.is(prevProps.sendFiles, nextProps.sendFiles);
  const isUpdateInputFilesEqual = Object.is(prevProps.updateInputFiles, nextProps.updateInputFiles);
  const isVisibleMessageTypeEqual = Object.is(
    prevProps.visibleMessageType,
    nextProps.visibleMessageType
  );
  return (
    isLocalizedStringEqual &&
    isIsFileSendingStatusSendingEqual &&
    isInputFilesEqual &&
    isSendFilesEqual &&
    isUpdateInputFilesEqual &&
    isVisibleMessageTypeEqual
  );
};

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
`;

const FileInputInfoWrapper = styled.div`
  &:hover,
  &:active {
    opacity: 0.6;
  }

  width: 100%;
  height: 100%;
  color: rgb(128, 128, 128);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TextInput = styled.input`
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

const FileInput = styled.input`
  display: none;
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
  background-image: url(${enabledMessageSendBubbleImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-color: transparent;
  background-color: transparent;

  &:disabled {
    background-image: url(${disabledMessageSendBubbleImageUrl});
  }
`;
