import * as React from "react";
import { useSelector } from "react-redux";

import { selectAllTextMessages } from "store/textChatSlice";
import { FileMessageContext, FileMessageContextProvider } from "context/file-message-context";
import * as messageChatEnum from "constant/enum/message-chat";

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
  const [visibleMessageType, setVisibleMessageType] = React.useState(
    messageChatEnum.type.MESSAGE_TYPE_TEXT
  );
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
    clearAllFileBuffersReceived,
    clearAllFileReceived,

    resetFileMessageContext,
  } = React.useContext(FileMessageContext);
  const textMessageContainer = useSelector(selectAllTextMessages);

  const textMessageList = [];
  if (textMessageContainer) {
    for (let message of Object.values(textMessageContainer)) {
      textMessageList.push({
        ...message,
        type: messageChatEnum.type.MESSAGE_TYPE_TEXT,
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
        type: messageChatEnum.type.MESSAGE_TYPE_FILE,
      });
    }
  }
  const orderedFileMessageList = Object.values(fileMessageList).sort((a, b) => {
    return a.timestamp - b.timestamp;
  });

  const resetMessageContext = () => {
    if (typeof resetFileMessageContext === "function") {
      resetFileMessageContext();
    }
    setVisibleMessageType(messageChatEnum.type.MESSAGE_TYPE_TEXT);
  };

  const contextValue = {
    visibleMessageType,
    updateVisibleMessageType: setVisibleMessageType,

    orderedTextMessageList,

    orderedFileMessageList,
    isFileSendingStatusSending,
    unreadFileMessageCount,
    readAllFileMessage,
    inputFiles,
    updateInputFiles,
    sendFiles,
    cancelAllFileSending,
    clearAllFileInput,
    clearAllFileBuffersReceived,
    clearAllFileReceived,

    resetFileMessageContext,
    resetMessageContext,
  };

  return <MessageContext.Provider value={contextValue}>{children}</MessageContext.Provider>;
}

export { MessageContextProviderWrapper as MessageContextProvider, MessageContext };
