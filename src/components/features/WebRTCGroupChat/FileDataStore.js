let _handleFileSendingProgressChange;
let _handleFileReceivingProgressChange;
let _handleFileMetaDataChange;
let _handleFileDataChange;
let _handleSendingStatusChange;

function createFileProgressMap(isSending) {
  const fileProgressMap = {};

  fileProgressMap.peerMap = new Map();

  fileProgressMap.addProgressToPeer = function (
    peerId,
    fileHash,
    addedProgress
  ) {
    console.log(
      "add Progress ToPeer: ",
      peerId,
      fileHash,
      addedProgress
    );
    if (
      !fileProgressMap.peerMap.get(peerId) ||
      !fileProgressMap.peerMap.get(peerId)[fileHash]
    ) {
      fileProgressMap.setFileProgressToPeer(peerId, fileHash, 0);
    }

    let curProgress =
      fileProgressMap.peerMap.get(peerId)[fileHash] + addedProgress;
    console.log(
      "cur Progress ToPeer: ",
      peerId,
      fileHash,
      fileProgressMap.peerMap.get(peerId)[fileHash]
    );
    fileProgressMap.setFileProgressToPeer(
      peerId,
      fileHash,
      curProgress
    );
  };

  fileProgressMap.setFileProgressToPeer = function (
    peerId,
    fileHash,
    progress
  ) {
    let fileHashToProgressObj = fileProgressMap.peerMap.get(peerId);
    if (!fileHashToProgressObj) {
      fileHashToProgressObj = {};
    }
    fileHashToProgressObj[fileHash] = progress;
    fileProgressMap.peerMap.set(peerId, fileHashToProgressObj);

    if (isSending && _handleFileSendingProgressChange) {
      _handleFileSendingProgressChange(fileProgressMap);
    }
    if (!isSending && _handleFileReceivingProgressChange) {
      _handleFileReceivingProgressChange(fileProgressMap);
    }
  };

  fileProgressMap.getFileProgressFromPeer = function (
    peerId,
    fileHash
  ) {
    if (
      !fileProgressMap.peerMap.has(peerId) ||
      !fileProgressMap.peerMap.get(peerId)[fileHash]
    ) {
      return 0;
    }
    return fileProgressMap.peerMap.get(peerId)[fileHash];
  };

  return fileProgressMap;
}

const _fileSendingProgress = createFileProgressMap(true);
const _fileReceivingProgress = createFileProgressMap(false);
const _sendingFileHashToFileMap = {
  fileHashToFile: null,
  set(fileHashToFile) {
    this.fileHashToFile = fileHashToFile;
  },
  get() {
    return this.fileHashToFile;
  },
};
const _receivingFileHashToFileMetaDataMap = {
  peerMap: new Map(),
  setMetaDataToPeer(peerId, metaData) {
    this.peerMap.set(peerId, metaData);

    if (_handleFileMetaDataChange) {
      _handleFileMetaDataChange(this);
    }
  },
  getMetaDataFromPeer(peerId) {
    return this.peerMap.get(peerId);
  },
  deleteMetaDataFromPeer(peerId) {
    this.peerMap.delete(peerId);

    if (_handleFileMetaDataChange) {
      _handleFileMetaDataChange(this);
    }
  },
};
const _receivingFileHashToFileDataMap = {
  peerMap: new Map(),
  getFileDataArrayFromPeer(peerId, fileHash) {
    let fileHashToFileDataObj = this.peerMap.get(peerId);
    if (!fileHashToFileDataObj) {
      return null;
    }
    const fileDataArray = fileHashToFileDataObj[fileHash];
    if (!fileDataArray) {
      return null;
    }
    return fileDataArray;
  },
  addFileBufferToPeer(peerId, fileHash, buffer) {
    let fileHashToFileDataObj = this.peerMap.get(peerId);

    if (!fileHashToFileDataObj) {
      fileHashToFileDataObj = { [fileHash]: [] };
    }

    if (!fileHashToFileDataObj[fileHash]) {
      fileHashToFileDataObj[fileHash] = [];
    }

    fileHashToFileDataObj[fileHash].push(buffer);
    this.peerMap.set(peerId, fileHashToFileDataObj);

    // set progress
    const addedByteLength = buffer.byteLength;
    _fileReceivingProgress.addProgressToPeer(
      peerId,
      fileHash,
      addedByteLength
    );

    if (_handleFileDataChange) {
      _handleFileDataChange(this);
    }
  },
  deleteFileFromPeer(peerId, fileHash) {
    let fileHashToFileDataObj = this.peerMap.get(peerId);
    if (!fileHashToFileDataObj) return;
    delete fileHashToFileDataObj[fileHash];

    if (_handleFileDataChange) {
      _handleFileDataChange(this);
    }
  },
  clearAllFileDataFromPeer(peerId) {
    this.peerMap.delete(peerId);

    if (_handleFileDataChange) {
      _handleFileDataChange(this);
    }
  },
  clearAllPeers() {
    this.peerMap = new Map();

    if (_handleFileDataChange) {
      _handleFileDataChange(this);
    }
  },
};

const _cancelledFileMap = {
  peerMap: new Map(),
  setFileCancelledToPeer(peerId, fileHash, cancelled) {
    let fileHashToCancelledObj = this.peerMap.get(peerId);

    if (!fileHashToCancelledObj) {
      fileHashToCancelledObj = {};
    }

    fileHashToCancelledObj[fileHash] = cancelled;
  },
  getFileCancelledFromPeer(peerId, fileHash) {
    let fileHashToCancelledObj = this.peerMap.get(peerId);

    if (!fileHashToCancelledObj) {
      return false;
    }

    return fileHashToCancelledObj[fileHash];
  },
};

const _sendingStatusMap = {
  peerMap: new Map(),
  set(peerId, isSending) {
    this.peerMap.set(peerId, isSending);

    if (_handleSendingStatusChange) {
      _handleSendingStatusChange(this);
    }
  },
  get(peerId) {
    return this.peerMap.get(peerId);
  },
};

export default {
  // sending progress
  fileSendingProgress: _fileSendingProgress,
  setFileSendingProgressToPeer(peerId, fileHash, progress) {
    _fileSendingProgress.setFileProgressToPeer(
      peerId,
      fileHash,
      progress
    );

    console.log(
      "setFileSendingProgressToPeer: ",
      peerId,
      fileHash,
      progress
    );
  },
  getFileSendingProgressFromPeer(peerId, fileHash) {
    return _fileSendingProgress.getFileProgressFromPeer(
      peerId,
      fileHash
    );
  },
  setSendingFileHashToFile(fileHashToFile) {
    _sendingFileHashToFileMap.set(fileHashToFile);
  },
  getSendingFileHashToFile() {
    _sendingFileHashToFileMap.get();
  },

  // receiving progress
  fileReceivingProgress: _fileReceivingProgress,
  clearFileReceivingProgressFromPeer(peerId, fileHash) {
    _fileReceivingProgress.setFileProgressToPeer(peerId, fileHash, 0);

    console.log(
      "clearFileReceivingProgressToPeer: ",
      peerId,
      fileHash
    );
  },
  getFileReceivingProgressFromPeer(peerId, fileHash) {
    return _fileReceivingProgress.getFileProgressFromPeer(
      peerId,
      fileHash
    );
  },

  // receiving file meta data
  setMetaDataToPeer(peerId, metaData) {
    _receivingFileHashToFileMetaDataMap.setMetaDataToPeer(
      peerId,
      metaData
    );

    console.log("setMetaDataToPeer: ", peerId, metaData);
  },
  getMetaDataFromPeer(peerId) {
    return _receivingFileHashToFileMetaDataMap.getMetaDataFromPeer(
      peerId
    );
  },
  deleteMetaDataFromPeer(peerId) {
    _receivingFileHashToFileMetaDataMap.deleteMetaDataFromPeer(
      peerId
    );
  },

  // receiving file data
  getFileDataArrayFromPeer(peerId, fileHash) {
    return _receivingFileHashToFileDataMap.getFileDataArrayFromPeer(
      peerId,
      fileHash
    );
  },
  addFileBufferToPeer(peerId, fileHash, buffer) {
    _receivingFileHashToFileDataMap.addFileBufferToPeer(
      peerId,
      fileHash,
      buffer
    );
  },
  deleteFileFromPeer(peerId, fileHash) {
    _receivingFileHashToFileDataMap.deleteFileFromPeer(
      peerId,
      fileHash
    );

    console.log("deleteFileFromPeer: ", peerId, fileHash);
  },
  clearAllFileDataFromPeer(peerId) {
    _receivingFileHashToFileDataMap.clearAllFileDataFromPeer(peerId);

    console.log("clearAllFileDataFromPeer: ", peerId);
  },
  clearAllPeers() {
    _receivingFileHashToFileDataMap.clearAllPeers();

    console.log("clearAllPeers: ");
  },

  // cancelled file
  cancelledFileMap: _cancelledFileMap,
  setFileCancelledToPeer(peerId, fileHash, cancelled) {
    _cancelledFileMap.setFileCancelledToPeer(
      peerId,
      fileHash,
      cancelled
    );

    console.log(
      "setFileCancelledToPeer: ",
      peerId,
      fileHash,
      cancelled
    );
  },
  getFileCancelledFromPeer(peerId, filehash) {
    return _cancelledFileMap.getFileCancelledFromPeer(
      peerId,
      filehash
    );
  },

  // file sending status
  sendingStatusMap: _sendingStatusMap,
  setSendingStatusToPeer(peerId, isSending) {
    _sendingStatusMap.set(peerId, isSending);

    console.log("setSendingStatusToPeer: ", peerId, isSending);
  },
  getSendingStatusFromPeer(peerId) {
    return _sendingStatusMap.get(peerId);
  },

  // listeners
  onSendingProgressChanged: function (handler) {
    _handleFileSendingProgressChange = handler;
  },
  onReceivingProgressChanged: function (handler) {
    _handleFileReceivingProgressChange = handler;
  },
  onFileMetaDataChanged: function (handler) {
    _handleFileMetaDataChange = handler;
  },
  onFileDataChanged: function (handler) {
    _handleFileDataChange = handler;
  },
  onSendingStatusChanged: function (handler) {
    _handleSendingStatusChange = handler;
  },
};
