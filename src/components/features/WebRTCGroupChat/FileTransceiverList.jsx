import React from "react";

import FileDataUtil from "./FileDataUtil.js";
import WebRTCGroupChatController from "./WebRTCGroupChatController.js";

function FileTransceiver(props) {
  const {
    isSender,

    transceivingFileHash,
    transceivingMetaData,
    transceivingProgress,

    receivingFileExporter,
  } = props;

  // validating
  if (
    !transceivingMetaData ||
    !(typeof transceivingProgress === "number") ||
    transceivingProgress < 0
  ) {
    return <></>;
  }

  // transceiving progress
  const curTransProgress = transceivingProgress;
  let maxTransProgress = curTransProgress;
  if (transceivingMetaData.size >= 0) {
    maxTransProgress = Math.max(curTransProgress, transceivingMetaData.size);
  }

  // transceiving file name
  let transFileName = "Unknown File Name";
  if (transceivingMetaData.name && transceivingMetaData.name.length > 0) {
    transFileName = transceivingMetaData.name;
  }

  // sending cancellation
  const sendingCancellable =
    isSender &&
    transceivingProgress > 0 &&
    transceivingProgress < transceivingMetaData.size &&
    transceivingFileHash &&
    transceivingFileHash.length > 0;
  const onCancelSendingClick = (e) => {
    if (sendingCancellable) {
      WebRTCGroupChatController.cancelFileSendingToAllPeer(transceivingFileHash);
    }
  };

  // receiving downloading
  const receivingDownloadable =
    !isSender &&
    receivingFileExporter &&
    transceivingMetaData &&
    transceivingProgress >= transceivingMetaData.size;
  let handleReceivingDownload;
  if (receivingDownloadable) {
    handleReceivingDownload = () => {
      const handleFileExportSuccess = (file) => {
        if (file instanceof File === false) {
          console.log(`FileTransceiver: unexpected params received from file Export handler`, file);
          return;
        }
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        a.remove();
      }
      receivingFileExporter().then(handleFileExportSuccess).catch(console.error);
    };
  }

  return (
    <div>
      <div>{transFileName}</div>
      <div>
        <progress
          value={curTransProgress}
          max={maxTransProgress}
        />
        <span>{FileDataUtil.formatBytes(curTransProgress)}</span>
        {" / "}
        <span>{FileDataUtil.formatBytes(maxTransProgress)}</span>
      </div>
      {sendingCancellable && (
        <div>
          <button onClick={onCancelSendingClick}>Cancel</button>
        </div>
      )}
      {receivingDownloadable && (
        <div>
          <button onClick={handleReceivingDownload}>Download</button>
        </div>
      )}
    </div>
  );
}

export default function FileTransceiverList(props) {
  const { sendingRelatedData, receivingRelatedData } = props;
  let transceivingList = [];

  if (
    sendingRelatedData &&
    sendingRelatedData[WebRTCGroupChatController.fileSendingSliceContainerKey]
  ) {
    // sending
    const sendingFileHashToConcatData =
      sendingRelatedData[WebRTCGroupChatController.fileSendingSliceContainerKey];
    Object.entries(sendingFileHashToConcatData).forEach(([fileHash, sendingConcatData]) => {
      transceivingList.push(
        <FileTransceiver
          key={fileHash}
          isSender={true}
          transceivingFileHash={fileHash}
          transceivingMetaData={
            sendingConcatData[WebRTCGroupChatController.fileSendingMetaDataSliceKey]
          }
          transceivingProgress={
            sendingConcatData[WebRTCGroupChatController.fileSendingMinProgressSliceKey]
          }
        />
      );
    });
  } else if (
    receivingRelatedData &&
    receivingRelatedData[WebRTCGroupChatController.fileReceivingSliceContainerKey]
  ) {
    // receiving
    const receivingPeerMap =
      receivingRelatedData[WebRTCGroupChatController.fileReceivingSliceContainerKey];
    receivingPeerMap.forEach((hashToConcatData, peerId) => {
      Object.entries(hashToConcatData).forEach(([fileHash, receivingConcatData]) => {
        transceivingList.push(
          <FileTransceiver
            key={`${peerId}-${fileHash}`}
            isSender={false}
            transceivingMetaData={
              receivingConcatData[WebRTCGroupChatController.fileReceivingMetaDataSliceKey]
            }
            transceivingProgress={
              receivingConcatData[WebRTCGroupChatController.fileReceivingProgressSliceKey]
            }
            receivingFileExporter={
              receivingConcatData[WebRTCGroupChatController.fileReceivingFileExporterSliceKey]
            }
          />
        );
      });
    });
  }

  return transceivingList;
}
