/**
 * Sending file hash to file
 */

let _sendingHashToFile;

/**
 * Sending status
 */

let _handleSendingStatusChange;

const _sendingStatusMap = {
  peerMap: new Map(),
  setStatus(peerId, isSending) {
    this.peerMap.set(peerId, isSending);

    if (_handleSendingStatusChange) {
      _handleSendingStatusChange(this);
    }
  },
  getStatus(peerId) {
    return this.peerMap.get(peerId);
  },
};

/**
 * Sending cancelled
 */

const _sendingCancelledFileMap = {
  peerMap: new Map(),
  getCancelled(peerId, fileHash) {
    let hashToCancelled = this.peerMap.get(peerId);
    if (!hashToCancelled) {
      return false;
    }
    return hashToCancelled[fileHash];
  },
  setCancelled(peerId, fileHash, cancelled) {
    if (
      !peerId ||
      peerId.length === 0 ||
      !fileHash ||
      fileHash.length === 0 ||
      typeof cancelled !== "boolean"
    ) {
      return;
    }
    let hashToCancelled = this.peerMap.get(peerId);
    if (!hashToCancelled) {
      hashToCancelled = {};
    }
    hashToCancelled[fileHash] = cancelled;
    this.peerMap.set(peerId, hashToCancelled);
  },
};

/**
 * Progress
 */

let _handleFileSendingProgressChange;
let _handleFileReceivingProgressChange;

function createFileProgressMap(isSending) {
  const progressMap = {
    peerMap: new Map(),
    getProgress: function (peerId, fileHash) {
      if (
        !peerId ||
        peerId.length === 0 ||
        !fileHash ||
        fileHash.length === 0
      ) {
        return 0;
      }
      if (
        !this.peerMap.has(peerId) ||
        !this.peerMap.get(peerId)[fileHash]
      ) {
        return 0;
      }

      return this.peerMap.get(peerId)[fileHash];
    },
    calculateMinProgress(fileHash) {
      if (
        !fileHash ||
        fileHash.length === 0 ||
        this.peerMap.size === 0
      ) {
        return 0;
      }
      let minProgress = Number.POSITIVE_INFINITY;

      this.peerMap.forEach((hashToProgress) => {
        if (hashToProgress[fileHash]) {
          minProgress = Math.min(
            minProgress,
            hashToProgress[fileHash]
          );
        }
      });

      if (minProgress === Number.POSITIVE_INFINITY) {
        return 0;
      }

      return minProgress;
    },
    setProgress: function (peerId, fileHash, progress) {
      if (
        !peerId ||
        peerId.length === 0 ||
        !fileHash ||
        fileHash.length === 0 ||
        typeof progress !== "number" ||
        progress < 0
      ) {
        return;
      }

      let hashToProgress = this.peerMap.get(peerId);
      if (!hashToProgress) {
        hashToProgress = {};
      }
      hashToProgress[fileHash] = progress;
      this.peerMap.set(peerId, hashToProgress);

      if (isSending && _handleFileSendingProgressChange) {
        _handleFileSendingProgressChange(this);
      }
      if (isSending && _handleFileSendingHashToMinProgressChange) {
        _handleFileSendingHashToMinProgressChange(
          _getSendingHashToMinProgress()
        );
      }
      if (!isSending && _handleFileReceivingProgressChange) {
        _handleFileReceivingProgressChange(this);
      }
    },
    addProgress: function (peerId, fileHash, addedProgress) {
      console.log(
        "add Progress ToPeer: ",
        peerId,
        fileHash,
        addedProgress
      );

      const curProgress =
        this.getProgress(peerId, fileHash) + addedProgress;
      this.setProgress(peerId, fileHash, curProgress);
    },

    resetProgress: function (peerId, fileHash) {
      this.setProgress(peerId, fileHash, 0);
    },
  };

  return progressMap;
}
const _sendingProgressMap = createFileProgressMap(true);
const _receivingProgressMap = createFileProgressMap(false);

/**
 * Sending min progress
 */

let _handleFileSendingHashToMinProgressChange;

const _getSendingHashToMinProgress = function () {
  if (!_sendingHashToFile) {
    console.log("_getSendingHashToMinProgress", null);
    return null;
  }
  const sendingFileHashToMinProgress = {};
  Object.keys(_sendingHashToFile).forEach((fileHash) => {
    const minProgress =
      _sendingProgressMap.calculateMinProgress(fileHash);

    console.log(
      "_getSendingHashToMinProgress >> minProgress",
      fileHash,
      minProgress
    );
    sendingFileHashToMinProgress[fileHash] = minProgress;
  });

  console.log(
    "_getSendingHashToMinProgress",
    sendingFileHashToMinProgress
  );
  return sendingFileHashToMinProgress;
};

/**
 * Receiving meta data
 */

let _handleFileMetaDataChange;

const _receivingHashToMetaDataMap = {
  peerMap: new Map(),
  getHashToMetaData(peerId) {
    if (!peerId || peerId.length === 0) {
      return null;
    }
    return this.peerMap.get(peerId);
  },
  getMetaData(peerId, fileHash) {
    if (!fileHash || fileHash.length === 0) {
      return null;
    }

    const hashToMetaData = this.getHashToMetaData(peerId);
    if (!hashToMetaData) {
      return null;
    }

    return hashToMetaData[fileHash];
  },
  setHashToMetaData(peerId, hashToMetaData) {
    if (!peerId || peerId.length === 0) {
      return;
    }
    this.peerMap.set(peerId, hashToMetaData);

    if (_handleFileMetaDataChange) {
      _handleFileMetaDataChange(this);
    }
  },
  mergeHashToMetaData(peerId, hashToMetaData) {
    const merged = {
      ...this.getHashToMetaData(peerId),
      ...hashToMetaData,
    };
    this.setHashToMetaData(peerId, merged);
  },
  setMetaData(peerId, fileHash, metaData) {
    if (
      !peerId ||
      peerId.length === 0 ||
      !fileHash ||
      fileHash.length === 0
    ) {
      return;
    }
    this.mergeHashToMetaData(peerId, { [fileHash]: metaData });
  },
};

/**
 * Receiving data (Buffer)
 */

let _handleFileDataChange;

const _receivingHashToBufferListMap = {
  peerMap: new Map(),
  getBufferList(peerId, fileHash) {
    if (
      !peerId ||
      peerId.length === 0 ||
      !fileHash ||
      fileHash.length === 0
    ) {
      return null;
    }

    const hashToBufferList = this.peerMap.get(peerId);
    if (!hashToBufferList) {
      return null;
    }

    return hashToBufferList[fileHash];
  },
  setBufferList(peerId, fileHash, bufferList) {
    if (
      !peerId ||
      peerId.length === 0 ||
      !fileHash ||
      fileHash.length === 0
    ) {
      return;
    }
    let hashToBufferList = this.peerMap.get(peerId);
    if (!hashToBufferList) {
      hashToBufferList = { [fileHash]: [] };
    }
    hashToBufferList[fileHash] = bufferList;
    this.peerMap.set(peerId, hashToBufferList);

    if (_handleFileDataChange) {
      _handleFileDataChange(this);
    }
  },
  addBuffer(peerId, fileHash, buffer) {
    if (!this.getBufferList(peerId, fileHash)) {
      this.setBufferList(peerId, { [fileHash]: [] });
    }

    const bufferList = this.getBufferList(peerId, fileHash);
    bufferList.push(buffer);
    this.setBufferList(peerId, fileHash, bufferList);

    // set progress
    const addedByteLength = buffer.byteLength;
    _receivingProgressMap.addProgress(
      peerId,
      fileHash,
      addedByteLength
    );
  },
  clearBufferList(peerId, fileHash) {
    this.setBufferList(peerId, fileHash, []);
  },
  clearHashToBufferList(peerId) {
    this.peerMap.delete(peerId);

    if (_handleFileDataChange) {
      _handleFileDataChange(this);
    }
  },
  clearAll() {
    this.peerMap.clear();

    if (_handleFileDataChange) {
      _handleFileDataChange(this);
    }
  },
};

export default {
  //
  // Sending file hash to file
  //

  set sendingHashToFile(hashToFile) {
    _sendingHashToFile = {
      ...hashToFile,
    };
    if (_handleFileSendingHashToMinProgressChange) {
      _handleFileSendingHashToMinProgressChange(
        _getSendingHashToMinProgress()
      );
    }
  },
  get sendingHashToFile() {
    return _sendingHashToFile;
  },

  //
  // Sending status
  //

  setSendingStatus(peerId, isSending) {
    _sendingStatusMap.setStatus(peerId, isSending);
  },
  getSendingStatus(peerId) {
    return _sendingStatusMap.getStatus(peerId);
  },

  //
  // Sending cancelled
  //

  getSendingCancelled(peerId, filehash) {
    return _sendingCancelledFileMap.getCancelled(peerId, filehash);
  },
  setSendingCancelled(peerId, fileHash, cancelled) {
    _sendingCancelledFileMap.setCancelled(
      peerId,
      fileHash,
      cancelled
    );
    console.log("setSendingCancelled: ", peerId, fileHash, cancelled);
  },

  //
  // Progress
  //

  getSendingProgress(peerId, fileHash) {
    return _sendingProgressMap.getProgress(peerId, fileHash);
  },
  setSendingProgress(peerId, fileHash, progress) {
    _sendingProgressMap.setProgress(peerId, fileHash, progress);

    console.log("setSendingProgress: ", peerId, fileHash, progress);
  },
  resetReceivingProgress(peerId, fileHash) {
    _receivingProgressMap.resetProgress(peerId, fileHash);

    console.log("resetReceivingProgress: ", peerId, fileHash);
  },

  //
  // Receiving meta data
  //

  mergeReceivingHashToMetaData(peerId, hashToMetaData) {
    _receivingHashToMetaDataMap.mergeHashToMetaData(
      peerId,
      hashToMetaData
    );
    console.log("mergeHashToMetaData: ", peerId, hashToMetaData);
  },

  //
  // Receiving data (Buffer)
  //

  addReceivingBuffer(peerId, fileHash, buffer) {
    _receivingHashToBufferListMap.addBuffer(peerId, fileHash, buffer);
  },
  clearReceivingBufferList(peerId, fileHash) {
    _receivingHashToBufferListMap.clearBufferList(peerId, fileHash);
    console.log("clearReceivingBufferList: ", peerId, fileHash);
  },
  clearReceivingHashToBufferList(peerId) {
    _receivingHashToBufferListMap.clearHashToBufferList(peerId);
    console.log("clearReceivingHashToBufferList: ", peerId);
  },
  clearAll() {
    _receivingHashToBufferListMap.clearAll();
  },

  //
  // Listeners
  //

  onSendingProgressChanged: function (handler) {
    _handleFileSendingProgressChange = handler;
  },
  onSendingHashToMinProgressChanged: function (handler) {
    _handleFileSendingHashToMinProgressChange = handler;
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
