import WebRTCFileDataStore from "./WebRTCFileDataStore.js";
import WebRTCFileDataUtil from "./WebRTCFileDataUtil.js";

const MAXIMUM_FILE_CHUNK_SIZE = WebRTCFileDataStore.maxSendingChunkSize;
const FILE_META_DATA_CHANNEL_LABEL = "FILE_META_DATA_CHANNEL_LABEL";
const ACK_OF_FILE_META_DATA_MESSAGE = "ACK_OF_FILE_META_DATA_MESSAGE";
const START_OF_FILE_BUFFER_MESSAGE = "START_OF_FILE_BUFFER_MESSAGE";
const CANCEL_OF_FILE_BUFFER_MESSAGE = "CANCEL_OF_FILE_BUFFER_MESSAGE";

// ( sender: file meta data, receiver: file meta data )
const _peerFileMetaDataChannelMap = _createDataChannelMap();

// ( sender: file buffer, receiver: file buffer )
const _peerFileBufferChannelMap = _createDataChannelMap();

function _createDataChannelMap() {
  const dataChannelMap = {};

  dataChannelMap.peerMap = new Map();

  dataChannelMap.setChannel = function (peerId, label, channel) {
    let peerSpecificObject = dataChannelMap.peerMap.get(peerId);
    if (!peerSpecificObject) {
      peerSpecificObject = {};
    }
    peerSpecificObject[label] = channel;

    dataChannelMap.peerMap.set(peerId, peerSpecificObject);

    console.log(
      `WebRTCGroupChatController: a new channel of`,
      channel,
      `with a label (${label})`,
      `is set to the dataChannelMap`,
      dataChannelMap
    );
  };

  dataChannelMap.getChannel = function (peerId, label) {
    if (!dataChannelMap.peerMap.has(peerId)) {
      return null;
    }
    return dataChannelMap.peerMap.get(peerId)[label];
  };

  dataChannelMap.hasChannel = function (peerId, label) {
    let peerSpecificObject = dataChannelMap.peerMap.get(peerId);
    if (!peerSpecificObject) {
      return false;
    }
    if (!peerSpecificObject[label]) {
      return false;
    }
    return true;
  };

  dataChannelMap.forEach = function (func) {
    dataChannelMap.peerMap.forEach(func);
  };

  return dataChannelMap;
}

// ( sender: file buffer )
const _sendFileTaskQueueMap = {
  peerMap: new Map(),
  shiftTask(peerId) {
    let sendFileTaskQueue = this.peerMap.get(peerId);
    if (!sendFileTaskQueue) {
      sendFileTaskQueue = [];
    }
    return sendFileTaskQueue.shift();
  },
  pushTask(peerId, sendFileTask) {
    let sendFileTaskQueue = this.peerMap.get(peerId);
    if (!sendFileTaskQueue) {
      sendFileTaskQueue = [];
    }
    sendFileTaskQueue.push(sendFileTask);
    this.peerMap.set(peerId, sendFileTaskQueue);
  },
};

// ( sender: file meta data && file buffer )
function _sendFileToAllPeer(peerConnectionMap, files) {
  if (!peerConnectionMap) {
    console.log(
      `WebRTCGroupChatController: unexpected peerConnectionMap during file meta data sending`,
      peerConnectionMap
    );
    return;
  }

  if (!files) {
    console.log(`WebRTCGroupChatController: unexpected files during file meta data sending`, files);
    return;
  }

  // first, guarantee no file sending is cancelled naturally
  WebRTCFileDataStore.clearSendingCancelled();

  // then, make file sending tasks for each peer connected
  peerConnectionMap.forEach((peerConnection, peerId) => {
    _sendFileToPeer(files, peerId, peerConnection);
  });
}

// ( sender: file meta data && file buffer )
async function _sendFileToPeer(files, peerId, peerConnection) {
  if (!files) {
    console.log(
      `WebRTCGroupChatController: unexpected files ( ${files} ) during file meta data sending`
    );
    return;
  }

  // transform the files into a file hash to file meta data
  const fileHashToFile = await WebRTCFileDataUtil.getUniqueFiles(files);
  WebRTCFileDataStore.prepareSendingMetaData(fileHashToFile);

  // create and store a data channel to transfer the prepared file hash to file meta data object
  const fileMetaDataChannel = _createAndStoreDataChannel({
    peerConnection: peerConnection,
    peerId: peerId,
    label: FILE_META_DATA_CHANNEL_LABEL,
    onOpenHandler: () => {
      _handleSenderFileMetaDataChannelOpen(
        peerId,
        fileMetaDataChannel,
        WebRTCFileDataStore.preparedSendingHashToMetaData
      );
    },
    onMessageHandler: (event) => {
      _handleSenderFileMetaDataChannelMessage({
        event,
        peerId,
        peerConnection,
        fileMetaDataChannel,
        fileHashToFile,
      });
    },
    onCloseHandler: (event) => {
      _handleChannelClose(event, peerId);
    },
  });
}

// ( sender: file meta data )
function _handleSenderFileMetaDataChannelOpen(
  peerId,
  fileMetaDataChannel,
  preparedFileHashToMetaData
) {
  if (fileMetaDataChannel.readyState === "open") {
    fileMetaDataChannel.send(JSON.stringify(preparedFileHashToMetaData));

    console.log(
      `WebRTCGroupChatController: sent a file hash to meta data object of`,
      preparedFileHashToMetaData,
      `to a peer(${peerId})`
    );
  }
}

// ( sender: file meta data )
function _handleSenderFileMetaDataChannelMessage({
  event,
  peerId,
  peerConnection,
  fileMetaDataChannel,
  fileHashToFile,
}) {
  const { data } = event;
  if (data === ACK_OF_FILE_META_DATA_MESSAGE) {
    fileMetaDataChannel.close();
    _sendFileBufferToPeer(fileHashToFile, peerId, peerConnection);

    console.log(
      `WebRTCGroupChatController: received ACK of file meta data from a peer (${peerId}), close this file meta data channel and starting to send file buffers`,
      fileHashToFile
    );
  }
}

// ( sender: file buffer )
async function _sendFileBufferToPeer(fileHashToFile, peerId, peerConnection) {
  if (!fileHashToFile) {
    console.log(
      `WebRTCGroupChatController: unfound file hash to file object during file buffer sending`
    );
    return;
  }

  const checkingPassed = WebRTCFileDataStore.checkIfSendingMetaDataPrepared(fileHashToFile);
  if (!checkingPassed) {
    console.log(
      `WebRTCGroupChatController: unexpected file hash to file of`,
      fileHashToFile,
      `because it cannot pass file hash to meta data preparation checking during file buffer sending`
    );
    return;
  }

  Object.keys(fileHashToFile).forEach((fileHash) => {
    const sendFileTask = () => {
      if (WebRTCFileDataStore.getSendingCancelled(fileHash)) {
        _handleSenderFileBufferChannelClose(peerId);
        return;
      }

      const label = `file-${fileHash}`;
      const file = fileHashToFile[fileHash];
      WebRTCFileDataStore.resetSendingProgress(peerId, fileHash);

      const fileBufferChannel = _createAndStoreDataChannel({
        peerId: peerId,
        peerConnection: peerConnection,
        label: label,
        onOpenHandler: (event) => {
          _handleSenderFileBufferChannelOpen(event, peerId, fileBufferChannel);
        },
        onBufferedAmountLowHandler: (event) => {
          _handleSenderFileBufferChannelBufferedAmountLow(
            event,
            peerId,
            fileBufferChannel,
            fileHash,
            file
          );
        },
        onCloseHandler: () => {
          _handleSenderFileBufferChannelClose(peerId);
        },
      });
      fileBufferChannel.binaryType = "arraybuffer";
    };

    _sendFileTaskQueueMap.pushTask(peerId, sendFileTask);
  });

  const sendFileTask = _sendFileTaskQueueMap.shiftTask(peerId);
  if (sendFileTask) {
    sendFileTask();
  }
}

// ( sender: file meta data && file buffer )
function _createAndStoreDataChannel({
  peerConnection,
  peerId,
  label,
  onOpenHandler,
  onMessageHandler,
  onBufferedAmountLowHandler,
  onCloseHandler,
}) {
  if (!peerId || peerId.length === 0 || !label || label.length === 0) {
    console.log(
      `WebRTCGroupChatController: unexpected peerId( ${peerId} ) / label( ${label} ) during data channel creating`
    );
    return;
  }
  if (!peerConnection) {
    console.log(
      `WebRTCGroupChatController: unfound peer connection of peer( ${peerId} ) during data channel creating`
    );
    return;
  }

  const dataChannel = peerConnection.createDataChannel(label);
  console.log(
    `WebRTCGroupChatController: a new data channel of label(${label}) for a peer(${peerId}) has been created`,
    `and max message size is (${
      peerConnection.sctp ? peerConnection.sctp.maxMessageSize : "unknown"
    })`
  );

  if (onOpenHandler) {
    dataChannel.onopen = onOpenHandler;
  }
  if (onMessageHandler) {
    dataChannel.onmessage = onMessageHandler;
  }
  if (onBufferedAmountLowHandler) {
    dataChannel.onbufferedamountlow = onBufferedAmountLowHandler;
  }
  if (onCloseHandler) {
    dataChannel.onclose = onCloseHandler;
  }

  if (label === FILE_META_DATA_CHANNEL_LABEL) {
    _peerFileMetaDataChannelMap.setChannel(peerId, label, dataChannel);
  } else {
    _peerFileBufferChannelMap.setChannel(peerId, label, dataChannel);
  }

  return dataChannel;
}

// ( sender: file buffer )
async function _handleSenderFileBufferChannelBufferedAmountLow(
  event,
  peerId,
  dataChannel,
  fileHash,
  file
) {
  const offset = WebRTCFileDataStore.getSendingProgress(peerId, fileHash);
  if (offset >= file.size) {
    dataChannel.close();
    return;
  }

  if (WebRTCFileDataStore.getSendingCancelled(fileHash)) {
    return;
  }

  const newOffset = await _sendChunk(fileHash, file, offset, dataChannel);

  if (WebRTCFileDataStore.getSendingCancelled(fileHash)) {
    return;
  }

  WebRTCFileDataStore.setSendingProgress(peerId, fileHash, newOffset);
}

// ( sender: file buffer )
async function _sendChunk(fileHash, file, offset, dataChannel) {
  const chunk = file.slice(offset, offset + MAXIMUM_FILE_CHUNK_SIZE);
  const buffer = await chunk.arrayBuffer();

  // avoid sending after sending cancelled
  if (WebRTCFileDataStore.getSendingCancelled(fileHash)) {
    return 0;
  }

  if (dataChannel.readyState !== "open") {
    return offset;
  }

  dataChannel.send(buffer);
  return offset + chunk.size;
}

// ( sender: file buffer )
function _handleSenderFileBufferChannelClose(peerId) {
  const sendFileTask = _sendFileTaskQueueMap.shiftTask(peerId);
  if (!sendFileTask) {
    return;
  }
  sendFileTask();
}

// ( sender: file buffer )
function _cancelSenderAllFileSending() {
  Object.keys(WebRTCFileDataStore.preparedSendingHashToMetaData).forEach((fileHash) => {
    _cancelSenderFileSendingToAllPeer(fileHash);
  });
}

// ( sender: file buffer )
function _cancelSenderFileSendingToAllPeer(fileHash) {
  WebRTCFileDataStore.setSendingCancelled(fileHash, true);

  _peerFileBufferChannelMap.forEach((_, peerId) => {
    WebRTCFileDataStore.resetSendingProgress(peerId, fileHash);

    const label = `file-${fileHash}`;
    const channel = _peerFileBufferChannelMap.getChannel(peerId, label);
    if (channel && channel.readyState === "open") {
      channel.send(CANCEL_OF_FILE_BUFFER_MESSAGE);
      channel.close();

      console.log(
        `WebRTCGroupChatController: sent a sending cancelled signal to a receiver peer (${peerId}), and closed the data channel`
      );
    }
  });
}

// ( sender: file buffer )
function _handleSenderFileBufferChannelOpen(event, peerId, dataChannel) {
  dataChannel.send(START_OF_FILE_BUFFER_MESSAGE);
  console.log(
    `WebRTCGroupChatController: sent a starting signal to a receiver peer (${peerId}), so that the receiver can prepare to receive file buffer`
  );
}

// ( sender: file meta data, receiver: file meta data && file buffer )
function _handleChannelClose(event, peerId) {
  const { target: dataChannel } = event;
  dataChannel.close();

  console.log(
    `WebRTCGroupChatController: the (${dataChannel.label}) label channel for a peer (${peerId}) heard close event and has been closed`
  );
}

// ( receiver: file meta data && file buffer )
function _handlePeerConnectionDataChannelEvent(event, peerId) {
  const {
    channel,
    channel: { label },
  } = event;

  console.log(
    `WebRTCGroupChatController: fired 'ondatachannel' with a channel of label (${label})`
  );

  // const peerId = peerConnectionMap.getFirstKeyByValue(peerConnection);

  if (label === FILE_META_DATA_CHANNEL_LABEL) {
    channel.onmessage = (event) => {
      _handleReceiverChannelFileMetaDataMessage(event, peerId, label);
    };
    _peerFileMetaDataChannelMap.setChannel(peerId, label, channel);
  } else {
    channel.onmessage = (event) => {
      _handleReceiverChannelFileBufferMessage(event, peerId);
    };
    _peerFileBufferChannelMap.setChannel(peerId, label, channel);
  }
  channel.onclose = (event) => {
    _handleChannelClose(event, peerId);
  };
}

// ( receiver: file meta data )
function _handleReceiverChannelFileMetaDataMessage(event, peerId, label) {
  const { data } = event;

  if (typeof data !== "string") {
    console.log(`WebRTCGroupChatController: unexpected 'data' type, it is not type of 'string'`);
    return;
  }

  const fileHashToMetaData = JSON.parse(data);

  console.log(
    `WebRTCGroupChatController: the '${
      label ? label : "unknown"
    }' labeled data channel's 'onmessage' fired with a file hash to meta data object of `,
    fileHashToMetaData
  );

  WebRTCFileDataStore.mergeReceivingHashToMetaData(peerId, fileHashToMetaData);

  // file meta data acknowledge
  if (_peerFileMetaDataChannelMap.hasChannel(peerId, label)) {
    const senderChannel = _peerFileMetaDataChannelMap.getChannel(peerId, label);
    if (senderChannel.readyState === "open") {
      senderChannel.send(ACK_OF_FILE_META_DATA_MESSAGE);
    }
  }
}

// ( receiver: file buffer )
async function _handleReceiverChannelFileBufferMessage(event, peerId) {
  const {
    data,
    target: { label },
  } = event;
  const fileHash = label.split("-")?.[1];

  if (data === START_OF_FILE_BUFFER_MESSAGE) {
    console.log(
      `WebRTCGroupChatController: received a signal of starting to send new file (${fileHash}) buffer from a peer(${peerId})`
    );

    WebRTCFileDataStore.deleteReceivingCancelled(peerId, fileHash);
    WebRTCFileDataStore.resetReceivingBuffer(peerId, fileHash);
  } else if (data === CANCEL_OF_FILE_BUFFER_MESSAGE) {
    console.log(
      `WebRTCGroupChatController: received a cancel signal of a file (${fileHash}) buffer receiving process from a sender peer(${peerId})`
    );

    WebRTCFileDataStore.setReceivingCancelled(peerId, fileHash, true);
    WebRTCFileDataStore.resetReceivingBuffer(peerId, fileHash);
  } else {
    console.log(
      `WebRTCGroupChatController: received a new file (${fileHash}) buffer of`,
      data,
      `from a sender peer(${peerId})`
    );

    if (data instanceof ArrayBuffer) {
      WebRTCFileDataStore.addReceivingBuffer(peerId, fileHash, data);
    } else if (data instanceof Blob) {
      WebRTCFileDataStore.addReceivingBuffer(peerId, fileHash, await data.arrayBuffer());
    }
  }
}

function _clearAllReceivingFiles() {
  WebRTCFileDataStore.resetAllReceivingBufferMergedFiles();
}

function _resetAllFileBuffersReceived() {
  WebRTCFileDataStore.resetAllReceivingBuffers();
}

export default {
  sendFileToAllPeer: _sendFileToAllPeer,
  cancelSenderAllFileSending: _cancelSenderAllFileSending,
  cancelSenderFileSendingToAllPeer: _cancelSenderFileSendingToAllPeer,
  clearAllReceivingFiles: _clearAllReceivingFiles,
  resetAllFileBuffersReceived: _resetAllFileBuffersReceived,

  formatBytes: WebRTCFileDataUtil.formatBytes,

  // sending slice keys inside sending view model
  get fileSendingSliceContainerKey() {
    return WebRTCFileDataStore.sendingSliceContainerKey;
  },
  get fileSendingMetaDataSliceKey() {
    return WebRTCFileDataStore.sendingMetaDataSliceKey;
  },
  get fileSendingMinProgressSliceKey() {
    return WebRTCFileDataStore.sendingMinProgressSliceKey;
  },
  // receiving slice keys inside receiving view model
  get fileReceivingSliceContainerKey() {
    return WebRTCFileDataStore.receivingSliceContainerKey;
  },
  get fileReceivingMetaDataSliceKey() {
    return WebRTCFileDataStore.receivingMetaDataSliceKey;
  },
  get fileReceivingFileExporterSliceKey() {
    return WebRTCFileDataStore.receivingFileExporterSliceKey;
  },
  get fileReceivingProgressSliceKey() {
    return WebRTCFileDataStore.receivingProgressSliceKey;
  },

  // sending view model changing listener
  onFileSendingRelatedDataChanged: function (handler) {
    WebRTCFileDataStore.onSendingRelatedDataChanged(handler);
  },
  // receiving view model changing listener
  onFileReceivingRelatedDataChanged: function (handler) {
    WebRTCFileDataStore.onReceivingRelatedDataChanged(handler);
  },

  handlePeerConnectionDataChannelEvent: _handlePeerConnectionDataChannelEvent,
};
