import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectAllTextMessages,
  sendTextMessage,
  readAllTextMessages,
  selectUnreadTextMessageCount,
  clearTextMessage,
} from "store/textChatSlice";
import { FileMessageContext, FileMessageContextProvider } from "context/file-message-context";

export const messageTypeEnum = {
  MESSAGE_TYPE_TEXT: 1,
  MESSAGE_TYPE_FILE: 2,
};

const MessageContext = React.createContext();
MessageContext.displayName = "MessageContext";

function MessageContextProviderWrapper({ children }) {
  return (
    <FileMessageContextProvider>
      <MessageContextProviderContent>{children}</MessageContextProviderContent>
    </FileMessageContextProvider>
  );
}

function MessageContextProviderContent({ children }) {
  const [visibleMessageType, setVisibleMessageType] = useState(messageTypeEnum.MESSAGE_TYPE_TEXT);

  const dispatch = useDispatch();
  const {
    messageContainer: fileMessageContainer,
    unreadMessageCount: unreadFileMessageCount,
    isSendingStatusSending: isFileSendingStatusSending,

    readAllMessage: readAllFileMessage,
    inputFiles,
    updateInputFiles,
    sendFiles,
    cancelAllFileSending,
    clearAllFileInput,
    clearMessageContext: clearFileMessageContext,
    clearAllFileBuffersReceived,
    clearAllFileReceived,
  } = useContext(FileMessageContext);
  const textMessageContainer = useSelector(selectAllTextMessages);
  const unreadTextMessageCount = useSelector(selectUnreadTextMessageCount);

  const textMessageList = [];
  if (textMessageContainer) {
    for (let message of Object.values(textMessageContainer)) {
      textMessageList.push({
        ...message,
        type: messageTypeEnum.MESSAGE_TYPE_TEXT,
      });
    }
  }
  const orderedTextMessageList = Object.values(textMessageList).sort((a, b) => {
    return a.timestamp - b.timestamp;
  });

  const fileMessageList = [];
  if (fileMessageContainer) {
    for (let message of Object.values(fileMessageContainer)) {
      fileMessageList.push({
        ...message,
        type: messageTypeEnum.MESSAGE_TYPE_FILE,
      });
    }
  }
  const orderedFileMessageList = Object.values(fileMessageList).sort((a, b) => {
    return a.timestamp - b.timestamp;
  });

  const sendTextToAllPeer = (text) => {
    dispatch(sendTextMessage(text));
  };

  const contextValue = {
    visibleMessageType,
    updateVisibleMessageType: setVisibleMessageType,

    orderedTextMessageList,
    unreadTextMessageCount,
    sendTextToAllPeer,

    // Incorrect: should not dispatch redux actions inside a react context provider
    readAllTextMessages: () => {
      if (unreadTextMessageCount === 0) {
        return;
      }
      dispatch(readAllTextMessages());
    },
    clearTextMessageContext: () => {
      dispatch(clearTextMessage());
    },

    orderedFileMessageList,
    isFileSendingStatusSending,
    unreadFileMessageCount,
    readAllFileMessage,
    inputFiles,
    updateInputFiles,
    sendFiles,
    cancelAllFileSending,
    clearAllFileInput,
    clearFileMessageContext,
    clearAllFileBuffersReceived,
    clearAllFileReceived,
  };

  return <MessageContext.Provider value={contextValue}>{children}</MessageContext.Provider>;
}

export { MessageContextProviderWrapper as MessageContextProvider, MessageContext };
