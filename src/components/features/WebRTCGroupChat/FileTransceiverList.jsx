import React from "react";

import FileDataUtil from "./FileDataUtil.js";
import WebRTCGroupChatController from "./WebRTCGroupChatController.js";

function FileTransceiver(props) {
  const { transceivingMetaData, transceivingProgress, receivingDownloadable, receivingBufferList } =
    props;

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

  // downloading
  let handleReceivingDownload;
  if (receivingDownloadable && receivingBufferList && receivingBufferList.length > 0) {
    handleReceivingDownload = () => {
      const a = document.createElement("a");
      const blob = new Blob(receivingBufferList);
      a.href = window.URL.createObjectURL(blob);
      a.download = transceivingMetaData.name;
      a.click();
      a.remove();
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
      {receivingDownloadable && handleReceivingDownload && (
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
        const receivingProgress =
          receivingConcatData[WebRTCGroupChatController.fileReceivingProgressSliceKey];
        const receivingMetaData =
          receivingConcatData[WebRTCGroupChatController.fileReceivingMetaDataSliceKey];
        const receivingBufferList =
          receivingConcatData[WebRTCGroupChatController.fileReceivingBufferSliceKey];
        const receivingDownloadable =
          receivingBufferList &&
          receivingBufferList.length > 0 &&
          receivingMetaData &&
          receivingProgress >= receivingMetaData.size;

        transceivingList.push(
          <FileTransceiver
            key={`${peerId}-${fileHash}`}
            transceivingMetaData={receivingMetaData}
            transceivingProgress={receivingProgress}
            receivingBufferList={receivingBufferList}
            receivingDownloadable={receivingDownloadable}
          />
        );
      });
    });
  }

  return transceivingList;
}
