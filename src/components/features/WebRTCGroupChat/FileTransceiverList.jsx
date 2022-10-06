import React from "react";

import FileDataUtil from "./FileDataUtil.js";
import style from "./WebRTCGroupChat.module.css";

function FileTransceiverItem(props) {
  const {
    fileMetaData,
    fileHash,
    transceivingProgress,
    enableDownload,
    onDownload,
  } = props;

  if (
    !fileHash ||
    fileHash.length === 0 ||
    !fileMetaData ||
    !(typeof transceivingProgress === "number") ||
    transceivingProgress < 0
  ) {
    return <></>;
  }

  const curProgress = transceivingProgress;
  const maxProgress =
    fileMetaData.size >= 0
      ? Math.max(curProgress, fileMetaData.size)
      : curProgress;

  return (
    <div>
      <div>
        {fileMetaData.name ? fileMetaData.name : "Unknown File Name"}
      </div>
      <div>
        <progress
          value={curProgress}
          max={maxProgress}
        />
        <span>{FileDataUtil.formatBytes(curProgress)}</span>
        {" / "}
        <span>{FileDataUtil.formatBytes(maxProgress)}</span>
      </div>
      {onDownload && enableDownload && (
        <div>
          <button
            onClick={() => {
              return onDownload(fileHash);
            }}
          >
            Download This File
          </button>
        </div>
      )}
    </div>
  );
}

export default function FileTransceiverList(props) {
  const {
    fileHashToFileObj,
    fileHashToMetaDataObj,
    fileHashToDataObj,
    fileTransceivingProgressObj,
  } = props;

  let transceiverList;

  if (fileHashToFileObj && fileTransceivingProgressObj) {
    // sending
    transceiverList = Object.entries(fileTransceivingProgressObj).map(
      ([fileHash, sendingProgress]) => {
        const file = fileHashToFileObj[fileHash];
        return (
          <FileTransceiverItem
            key={fileHash}
            fileMetaData={file}
            transceivingProgress={sendingProgress}
            fileHash={fileHash}
          />
        );
      }
    );
  } else if (
    fileHashToMetaDataObj &&
    fileHashToDataObj &&
    fileTransceivingProgressObj
  ) {
    // receiving
    const handleDownload = (fileHash) => {
      const a = document.createElement("a");
      const blob = new Blob(fileHashToDataObj[fileHash]);
      a.href = window.URL.createObjectURL(blob);
      a.download = fileHashToMetaDataObj[fileHash].name;
      a.click();
      a.remove();
    };
    const filteredFileHashList = Object.keys(
      fileTransceivingProgressObj
    ).filter((fileHash) => {
      if (
        !fileHashToMetaDataObj[fileHash] ||
        !fileHashToDataObj[fileHash]
      ) {
        return false;
      }
      return true;
    });

    if (filteredFileHashList.length > 0) {
      transceiverList = filteredFileHashList.map((fileHash) => {
        const fileMetaData = fileHashToMetaDataObj[fileHash];
        const receivingProgress =
          fileTransceivingProgressObj[fileHash];
        const enableDownload = receivingProgress >= fileMetaData.size;

        return (
          <FileTransceiverItem
            key={fileHash}
            fileMetaData={fileMetaData}
            transceivingProgress={receivingProgress}
            fileHash={fileHash}
            enableDownload={enableDownload}
            onDownload={() => {
              handleDownload(fileHash);
            }}
          />
        );
      });
    }
  }

  return transceiverList;
}
