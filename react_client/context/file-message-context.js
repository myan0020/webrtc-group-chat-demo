import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";
import { selectAuth } from "store/authSlice";

const FileMessageContext = React.createContext();
FileMessageContext.displayName = "FileMessageContext";

const fileMessageContainerBuilder = (
  authenticatedUserId,
  authenticatedUserName,
  isLocalSender,
  oldFileMessageContainer,
  newTransceivingRelatedData
) => {
  const newFileMessageContainer = { ...oldFileMessageContainer };

  if (isLocalSender) {
    const newSendingFileHashToConcatData = newTransceivingRelatedData;

    Object.entries(newSendingFileHashToConcatData).forEach(([fileHash, newConcatData]) => {
      const id = `${authenticatedUserId}-${fileHash}`;

      const oldFileMessage = oldFileMessageContainer ? oldFileMessageContainer[id] : null;

      let newFileMessage;

      let newFileProgress = newConcatData[WebRTCGroupChatService.fileSendingMinProgressSliceKey];
      if (typeof newFileProgress !== "number") {
        newFileProgress = 0;
      }

      if (!oldFileMessage) {
        newFileMessage = {};
        newFileMessage.id = `${authenticatedUserId}-${fileHash}`;
        newFileMessage.userId = authenticatedUserId;
        newFileMessage.userName = authenticatedUserName;
        newFileMessage.fileHash = fileHash;
        newFileMessage.timestamp = Date.parse(new Date());
        newFileMessage.isLocalSender = true;
        newFileMessage.fileSendingCanceller = () => {
          WebRTCGroupChatService.cancelFileSendingToAllPeer(fileHash);
        };

        const newFileMetaData = {
          ...newConcatData[WebRTCGroupChatService.fileSendingMetaDataSliceKey],
        };
        newFileMessage.fileName = newFileMetaData.name;
        newFileMessage.fileSize = newFileMetaData.size;

        newFileMessage.isRead = true;
        newFileMessage.isNew = false;
      } else {
        newFileMessage = oldFileMessage;
      }
      newFileMessage.fileProgress = newFileProgress;
      newFileMessageContainer[id] = newFileMessage;
    });

    return newFileMessageContainer;
  }

  const newReceivingPeerMap = newTransceivingRelatedData;

  newReceivingPeerMap.forEach((hashToConcatData, peerId) => {
    Object.entries(hashToConcatData).forEach(([fileHash, receivingConcatData]) => {
      const id = `${peerId}-${fileHash}`;
      const oldFileMessage = oldFileMessageContainer ? oldFileMessageContainer[id] : null;

      let newFileMessage;

      let newFileProgress =
        receivingConcatData[WebRTCGroupChatService.fileReceivingProgressSliceKey];
      if (typeof newFileProgress !== "number") {
        newFileProgress = 0;
      }

      if (!oldFileMessage) {
        newFileMessage = {};
        newFileMessage.id = `${peerId}-${fileHash}`;
        newFileMessage.userId = peerId;
        newFileMessage.userName = WebRTCGroupChatService.getPeerNameById(peerId);
        newFileMessage.fileHash = fileHash;
        newFileMessage.timestamp = Date.parse(new Date());
        newFileMessage.isLocalSender = false;

        const newFileMetaData = {
          ...receivingConcatData[WebRTCGroupChatService.fileReceivingMetaDataSliceKey],
        };
        newFileMessage.fileName = newFileMetaData.name;
        newFileMessage.fileSize = newFileMetaData.size;

        newFileMessage.isRead = false;
        newFileMessage.isNew = true;
      } else {
        newFileMessage = oldFileMessage;
        newFileMessage.isNew = !oldFileMessage.isRead;
      }

      newFileMessage.fileProgress = newFileProgress;
      newFileMessage.fileExporter =
        receivingConcatData[WebRTCGroupChatService.fileReceivingFileExporterSliceKey];
      newFileMessageContainer[id] = newFileMessage;
    });
  });

  return newFileMessageContainer;
};

function FileMessageContextProvider({ children }) {
  const [inputFiles, setInputFiles] = useState(null);
  const [isSendingStatusSending, setIsSendingStatusSending] = useState(false);
  const [messageContainer, setMessageContainer] = useState(null);
  const { authenticatedUserId, authenticatedUserName } = useSelector(selectAuth);

  const messageContainerRef = useRef(messageContainer);
  messageContainerRef.current = messageContainer;

  useEffect(() => {
    WebRTCGroupChatService.onFileSendingRelatedDataChanged(
      (sendingRelatedDataContainer, isSendingStatusSending) => {
        if (isSendingStatusSending !== undefined) {
          setIsSendingStatusSending(isSendingStatusSending);
        }
        if (
          sendingRelatedDataContainer &&
          sendingRelatedDataContainer[WebRTCGroupChatService.fileSendingSliceContainerKey]
        ) {
          const sendingRelatedData =
            sendingRelatedDataContainer[WebRTCGroupChatService.fileSendingSliceContainerKey];
          const newMessageContainer = fileMessageContainerBuilder(
            authenticatedUserId,
            authenticatedUserName,
            true,
            messageContainerRef.current,
            sendingRelatedData
          );
          setMessageContainer(newMessageContainer);
        }
      }
    );
    WebRTCGroupChatService.onFileReceivingRelatedDataChanged(
      (fileReceivingRelatedDataContainer) => {
        if (
          fileReceivingRelatedDataContainer &&
          fileReceivingRelatedDataContainer[WebRTCGroupChatService.fileReceivingSliceContainerKey]
        ) {
          const receivingRelatedData =
            fileReceivingRelatedDataContainer[
              WebRTCGroupChatService.fileReceivingSliceContainerKey
            ];
          const newMessageContainer = fileMessageContainerBuilder(
            authenticatedUserId,
            authenticatedUserName,
            false,
            messageContainerRef.current,
            receivingRelatedData
          );
          setMessageContainer(newMessageContainer);
        }
      }
    );
  }, []);

  let unreadMessageCount = 0;
  if (messageContainer) {
    unreadMessageCount = Object.values(messageContainer).filter(
      (message) => !message.isRead
    ).length;
  }

  // config
  const readAllMessage = () => {
    if (unreadMessageCount === 0) {
      return;
    }

    const newMessageContainer = { ...messageContainerRef.current };
    Object.keys(messageContainerRef.current).forEach((id) => {
      const newMessage = { ...newMessageContainer[id] };
      newMessage.isRead = true;
      newMessageContainer[id] = newMessage;
    });

    setMessageContainer(newMessageContainer);
  };
  const updateInputFiles = (files) => {
    setInputFiles(files);
  };
  const sendFiles = () => {
    if (inputFiles) {
      WebRTCGroupChatService.sendFileToAllPeer(inputFiles);
    }
  };
  const cancelAllFileSending = () => {
    WebRTCGroupChatService.cancelAllFileSending();
  };
  const clearAllFileBuffersReceived = () => {
    WebRTCGroupChatService.clearAllFileBuffersReceived();
  };
  const clearAllFileReceived = () => {
    WebRTCGroupChatService.clearAllFilesReceived();
  };
  const resetFileMessageContext = () => {
    setInputFiles(null);
    setIsSendingStatusSending(false);
    setMessageContainer(null);
  };

  const contextValue = {
    messageContainer,
    unreadMessageCount,
    isSendingStatusSending,

    readAllMessage,
    inputFiles,
    updateInputFiles,
    sendFiles,
    cancelAllFileSending,
    clearAllFileBuffersReceived,
    clearAllFileReceived,

    resetFileMessageContext,
  };

  return <FileMessageContext.Provider value={contextValue}>{children}</FileMessageContext.Provider>;
}

export { FileMessageContextProvider, FileMessageContext };
