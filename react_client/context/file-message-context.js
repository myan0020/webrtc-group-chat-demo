import * as React from "react";
import { useSelector } from "react-redux";
import GroupChatService, { SendingSliceName, ReceivingSliceName } from "webrtc-group-chat-client";

import { selectAuthenticated, selectAuthenticatedUserName } from "store/authSlice";

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
    const newSendingFileHashToAllSlices = newTransceivingRelatedData;

    Object.entries(newSendingFileHashToAllSlices).forEach(([fileHash, newAllSlices]) => {
      const id = `${authenticatedUserId}-${fileHash}`;

      const oldFileMessage = oldFileMessageContainer ? oldFileMessageContainer[id] : null;

      let newFileMessage;

      let newFileProgress = newAllSlices[SendingSliceName.SENDING_MIN_PROGRESS];
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
          GroupChatService.cancelFileSendingToAllPeer(fileHash);
          // .cancelFileSendingToAllPeer(fileHash);
        };

        const newFileMetaData = {
          ...newAllSlices[SendingSliceName.SENDING_META_DATA],
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

  const newReceivingPeerMapOfHashToAllSlices = newTransceivingRelatedData;

  newReceivingPeerMapOfHashToAllSlices.forEach((fileHashToAllSlices, peerId) => {
    Object.entries(fileHashToAllSlices).forEach(([fileHash, receivingAllSlices]) => {
      const id = `${peerId}-${fileHash}`;
      const oldFileMessage = oldFileMessageContainer ? oldFileMessageContainer[id] : null;

      let newFileMessage;

      let newFileProgress = receivingAllSlices[ReceivingSliceName.RECEIVING_PROGRESS];
      if (typeof newFileProgress !== "number") {
        newFileProgress = 0;
      }

      if (!oldFileMessage) {
        newFileMessage = {};
        newFileMessage.id = `${peerId}-${fileHash}`;
        newFileMessage.userId = peerId;
        newFileMessage.userName = GroupChatService.getPeerNameById(peerId);
        newFileMessage.fileHash = fileHash;
        newFileMessage.timestamp = Date.parse(new Date());
        newFileMessage.isLocalSender = false;

        const newFileMetaData = {
          ...receivingAllSlices[ReceivingSliceName.RECEIVING_META_DATA],
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
      newFileMessage.fileExporter = receivingAllSlices[ReceivingSliceName.RECEIVING_FILE_EXPORTER];
      newFileMessageContainer[id] = newFileMessage;
    });
  });

  return newFileMessageContainer;
};

function FileMessageContextProvider({ children }) {
  const [inputFiles, setInputFiles] = React.useState(null);
  const [isSendingStatusSending, setIsSendingStatusSending] = React.useState(false);
  const [messageContainer, setMessageContainer] = React.useState(null);
  const authenticatedUserId = useSelector(selectAuthenticated);
  const authenticatedUserName = useSelector(selectAuthenticatedUserName);

  const messageContainerRef = React.useRef(messageContainer);
  messageContainerRef.current = messageContainer;

  React.useEffect(() => {
    GroupChatService.onFileSendingRelatedDataChanged(
      (sendingRelatedDataProxy, isSendingStatusSending) => {
        if (isSendingStatusSending !== undefined) {
          setIsSendingStatusSending(isSendingStatusSending);
        }
        if (sendingRelatedDataProxy && sendingRelatedDataProxy.fileHashToAllSlices) {
          const newMessageContainer = fileMessageContainerBuilder(
            authenticatedUserId,
            authenticatedUserName,
            true,
            messageContainerRef.current,
            sendingRelatedDataProxy.fileHashToAllSlices
          );
          setMessageContainer(newMessageContainer);
        }
      }
    );
    GroupChatService.onFileReceivingRelatedDataChanged((receivingRelatedDataProxy) => {
      if (receivingRelatedDataProxy && receivingRelatedDataProxy.peerMapOfHashToAllSlices) {
        const newMessageContainer = fileMessageContainerBuilder(
          authenticatedUserId,
          authenticatedUserName,
          false,
          messageContainerRef.current,
          receivingRelatedDataProxy.peerMapOfHashToAllSlices
        );
        setMessageContainer(newMessageContainer);
      }
    });
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
      GroupChatService.sendFileToAllPeer(inputFiles);
    }
  };
  const cancelAllFileSending = () => {
    GroupChatService.cancelAllFileSending();
  };
  const clearAllFileBuffersReceived = () => {
    GroupChatService.clearAllFileBuffersReceived();
  };
  const clearAllFileReceived = () => {
    GroupChatService.clearAllFilesReceived();
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
