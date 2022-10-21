/**
 * For UI modeling
 */

const _sendingSliceContainerKey = "hashToConcatData";
const _sendingMetaDataSliceKey = "SENDING_META_DATA_SLICE_KEY";
const _sendingStatusSliceKey = "SENDING_STATUS_SLICE_KEY";
const _sendingMinProgressSliceKey = "SENDING_MIN_PROGRESS_SLICE_KEY";

const _receivingSliceContainerKey = "peerMap";
const _receivingMetaDataSliceKey = "RECEIVING_META_DATA_SLICE_KEY";
const _receivingBufferSliceKey = "RECEIVING_BUFFER_SLICE_KEY";
const _receivingProgressSliceKey = "RECEIVING_PROGRESS_SLICE_KEY";

let _handleSendingRelatedDataChange;
let _handleReceivingRelatedDataChange;

const _sendingRelatedData = {
  hashToConcatData: {},
  updateSlice(hashToSlice, sliceKey) {
    Object.keys(hashToSlice).forEach((fileHash) => {
      let concatData = this.hashToConcatData[fileHash];
      if (!concatData) {
        concatData = {};
      }
      concatData[sliceKey] = hashToSlice[fileHash];
      this.hashToConcatData[fileHash] = concatData;
    });

    // unified log
    console.log(
      `FileDataStore: the sending related data is updated to`,
      this,
      `with`,
      `a slice key ('${sliceKey}') and`,
      `a file hash to slice object of`,
      hashToSlice
    );

    // listener
    if (_handleSendingRelatedDataChange) {
      _handleSendingRelatedDataChange(this);
    }
  },
};

const _receivingRelatedData = {
  peerMap: new Map(),
  updateSlice(slicePeerMap, sliceKey) {
    slicePeerMap.forEach((hashToSlice, peerId) => {
      let hashToConcatData = this.peerMap.get(peerId);
      if (!hashToConcatData) {
        hashToConcatData = {};
      }
      Object.entries(hashToSlice).forEach(([fileHash, slice]) => {
        let concatData = hashToConcatData[fileHash];
        if (!concatData) {
          concatData = {};
        }
        concatData[sliceKey] = slice;
        hashToConcatData[fileHash] = concatData;
      });

      this.peerMap.set(peerId, hashToConcatData);
    });

    // unified log
    console.log(
      `FileDataStore: the receiving related data updated to`,
      this,
      `with`,
      `a slice key ('${sliceKey}') and`,
      `a slice peer map of`,
      slicePeerMap
    );

    // listener
    if (_handleReceivingRelatedDataChange) {
      _handleReceivingRelatedDataChange(this);
    }
  },
};

/**
 * Sending file hash to file
 */

let _sendingHashToMetaData = {};

/**
 * Sending status
 */

const _sendingStatusMap = {
  peerMap: new Map(),
  setStatus(peerId, isSending) {
    this.peerMap.set(peerId, isSending);
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
    if (!isStringValid(peerId) || !isStringValid(fileHash)) {
      return;
    }
    if (typeof cancelled !== "boolean") {
      return;
    }

    let hashToCancelled = this.peerMap.get(peerId);
    if (!hashToCancelled) {
      hashToCancelled = {};
    }

    hashToCancelled[fileHash] = cancelled;
    this.peerMap.set(peerId, hashToCancelled);
  },
  clear() {
    this.peerMap = new Map();
  }
};

/**
 * Progress
 */

const _sendingProgressMap = createFileProgressMap(true);
const _receivingProgressMap = createFileProgressMap(false);

function createFileProgressMap(isSending) {
  const progressMap = {
    // the progress data container
    peerMap: new Map(),

    // get the transceiving progress of a file for a specific peer
    getProgress: function (peerId, fileHash) {
      if (!isStringValid(peerId) || !isStringValid(fileHash)) {
        return 0;
      }
      if (!this.peerMap.has(peerId) || !this.peerMap.get(peerId)[fileHash]) {
        return 0;
      }
      return this.peerMap.get(peerId)[fileHash];
    },

    // set the transceiving progress of a file for a specific peer
    setProgress: function (peerId, fileHash, progress) {
      if (!isStringValid(peerId) || !isStringValid(fileHash)) {
        return;
      }
      if (typeof progress !== "number" || progress < 0) {
        return;
      }

      let hashToProgress = this.peerMap.get(peerId);
      if (!hashToProgress) {
        hashToProgress = {};
      }
      hashToProgress[fileHash] = progress;
      this.peerMap.set(peerId, hashToProgress);

      console.log(
        `FileDataStore: setting progress (${progress}) of a file (${fileHash}) for a peer (${peerId}) completed`
      );

      if (isSending) {
        const hashToSendingMinProgress = _computedHashToSendingMinProgress(
          _sendingHashToMetaData,
          this
        );
        _sendingRelatedData.updateSlice(hashToSendingMinProgress, _sendingMinProgressSliceKey);
      } else {
        _receivingRelatedData.updateSlice(this.peerMap, _receivingProgressSliceKey);
      }
    },

    // add the transceiving progress of a file for a specific peer with the additional progress
    addProgress: function (peerId, fileHash, additionalProgress) {
      const curProgress = this.getProgress(peerId, fileHash) + additionalProgress;
      this.setProgress(peerId, fileHash, curProgress);
      console.log(
        `FileDataStore: adding the additional progress ( ${additionalProgress} ) for a given file hash ( ${fileHash} ) to a given peer ( ${peerId} ) completed`
      );
    },

    // reset the transceiving progress of a file for a specific peer to '0'
    resetProgress: function (peerId, fileHash) {
      this.setProgress(peerId, fileHash, 0);
      console.log(
        `FileDataStore: resetting progress for a given file hash (${fileHash}) to a given peer (${peerId}) completed`
      );
    },

    // calculate the minimum progress(only for sending) of the given file being sent to every peer
    calculateMinProgress(fileHash) {
      if (!isStringValid(fileHash) || this.peerMap.size === 0) {
        return 0;
      }

      let minProgress = Number.POSITIVE_INFINITY;
      this.peerMap.forEach((hashToProgress) => {
        if (typeof hashToProgress[fileHash] === "number" && hashToProgress[fileHash] >= 0) {
          minProgress = Math.min(minProgress, hashToProgress[fileHash]);
        }
      });
      if (minProgress === Number.POSITIVE_INFINITY) {
        return 0;
      }

      return minProgress;
    },
  };

  return progressMap;
}

/**
 * Sending min progress
 */

// compute and output a file hash to sending minimum progress
const _computedHashToSendingMinProgress = function (sendingHashToMetaData, sendingProgressMap) {
  if (!sendingHashToMetaData) {
    console.log(`FileDataStore: sendingHashToMetaData not exist`);
    return null;
  }

  const fileHashToSendingMinProgress = {};
  Object.keys(sendingHashToMetaData).forEach((fileHash) => {
    const minProgress = sendingProgressMap.calculateMinProgress(fileHash);
    fileHashToSendingMinProgress[fileHash] = minProgress;
  });
  console.log(
    `FileDataStore: when computing completed, the entire sending hash to sending min progress is`,
    fileHashToSendingMinProgress
  );

  return fileHashToSendingMinProgress;
};

/**
 * Receiving meta data
 */

const _receivingHashToMetaDataMap = {
  // the receiving and peer-related file hash to meta data container
  peerMap: new Map(),

  // get the file hash to meta data object for a given peer
  getHashToMetaData(peerId) {
    if (!isStringValid(peerId)) {
      return null;
    }
    return this.peerMap.get(peerId);
  },

  // get the meta data of a given file hash for a given peer
  getMetaData(peerId, fileHash) {
    if (!isStringValid(fileHash)) {
      return null;
    }

    const hashToMetaData = this.getHashToMetaData(peerId);
    if (!hashToMetaData) {
      return null;
    }

    return hashToMetaData[fileHash];
  },

  // overwrite a file hash to meta data object for a specific peer
  overwriteHashToMetaData(peerId, hashToMetaData) {
    if (!isStringValid(peerId)) {
      return;
    }

    this.peerMap.set(peerId, hashToMetaData);

    console.log(
      `FileDataStore: overwritting with a receiving file hash to meta data object of`,
      hashToMetaData,
      `for a peer (${peerId}) completed`
    );

    _receivingRelatedData.updateSlice(this.peerMap, _receivingMetaDataSliceKey);
  },

  // merge a file hash to meta data object into the current one (if it exsits) for a given peer
  mergeHashToMetaData(peerId, hashToMetaData) {
    const merged = {
      ...this.getHashToMetaData(peerId),
      ...hashToMetaData,
    };
    this.overwriteHashToMetaData(peerId, merged);

    console.log(
      `FileDataStore: merging a file hash to meta data object`,
      hashToMetaData,
      `into the current one(if exist) for a peer (${peerId}) has been completed`
    );
  },

  // set a meta data of a given file hash for a given peer
  setMetaData(peerId, fileHash, metaData) {
    if (!isStringValid(peerId) || !isStringValid(fileHash)) {
      return;
    }
    this.mergeHashToMetaData(peerId, { [fileHash]: metaData });
  },
};

/**
 * Receiving data (Buffer)
 */

const _receivingHashToBufferListMap = {
  // the receiving and peer-related file hash to buffer list data container
  peerMap: new Map(),

  // get the receiving buffer list of a file for a specific peer
  getBufferList(peerId, fileHash) {
    if (!isStringValid(peerId) || !isStringValid(fileHash)) {
      return null;
    }

    const hashToBufferList = this.peerMap.get(peerId);
    if (!hashToBufferList) {
      return null;
    }
    return hashToBufferList[fileHash];
  },

  // overwrite a receiving buffer list of a file for a specific peer
  overwriteBufferList(peerId, fileHash, bufferList) {
    if (!isStringValid(peerId) || !isStringValid(fileHash)) {
      return;
    }

    let hashToBufferList = this.peerMap.get(peerId);
    if (!hashToBufferList) {
      hashToBufferList = { [fileHash]: [] };
    }
    hashToBufferList[fileHash] = bufferList;

    this.peerMap.set(peerId, hashToBufferList);

    console.log(
      `FileDataStore: overwritting with a receiving buffer list`,
      hashToBufferList,
      `of a file (${fileHash}) for a peer (${peerId}) completed`
    );

    _receivingRelatedData.updateSlice(this.peerMap, _receivingBufferSliceKey);
  },

  // add additional receiving buffer of a file for a specific peer
  addBuffer(peerId, fileHash, buffer) {
    // adding additional receiving buffer
    console.log(
      `FileDataStore: starting to add a buffer to a receiving buffer list of a given file hash (${fileHash}) for a given peer(${peerId}) ...`
    );

    let bufferList = this.getBufferList(peerId, fileHash);
    if (!bufferList) {
      bufferList = [];
    }
    bufferList.push(buffer);
    this.overwriteBufferList(peerId, fileHash, bufferList);

    console.log(
      `FileDataStore: adding a buffer to a receiving buffer list of a given file hash (${fileHash}) for a given peer(${peerId}) completed`
    );

    // as well as adding additional receiving progress
    _receivingProgressMap.addProgress(peerId, fileHash, buffer.byteLength);
  },

  // reset buffer list to an empty list of a file for a specific peer
  resetBufferList(peerId, fileHash) {
    console.log(
      `FileDataStore: starting to reset a receiving buffer list of a file hash (${fileHash}) to an empty list for a peer(${peerId}) ...`
    );

    this.overwriteBufferList(peerId, fileHash, []);

    console.log(
      `FileDataStore: resetting a receiving buffer list of a file hash (${fileHash}) to an empty list for a peer(${peerId}) has been completed`
    );

    // as well as resetting receiving progress
    _receivingProgressMap.resetProgress(peerId, fileHash);
  },

  // delete the file hash to buffer list object for a specific peer
  deleteHashToBufferList(peerId) {
    this.peerMap.delete(peerId);
    _receivingRelatedData.updateSlice(this.peerMap, _receivingBufferSliceKey);
  },

  // clear all
  clear() {
    this.peerMap.clear();
    _receivingRelatedData.updateSlice(this.peerMap, _receivingBufferSliceKey);
  },
};

/**
 * Util
 */

const isStringValid = (string) => {
  return string && string.length > 0;
};

export default {
  //
  // slice keys
  //

  get sendingSliceContainerKey() {
    return _sendingSliceContainerKey;
  },
  get sendingMetaDataSliceKey() {
    return _sendingMetaDataSliceKey;
  },
  get sendingMinProgressSliceKey() {
    return _sendingMinProgressSliceKey;
  },
  get receivingSliceContainerKey() {
    return _receivingSliceContainerKey;
  },
  get receivingMetaDataSliceKey() {
    return _receivingMetaDataSliceKey;
  },
  get receivingBufferSliceKey() {
    return _receivingBufferSliceKey;
  },
  get receivingProgressSliceKey() {
    return _receivingProgressSliceKey;
  },

  //
  // Sending file hash to file
  //

  get sendingHashToMetaData() {
    return _sendingHashToMetaData;
  },
  prepareSendingMetaData(hashToFile) {
    for (const [fileHash, file] of Object.entries(hashToFile)) {
      _sendingHashToMetaData[fileHash] = { name: file.name, type: file.type, size: file.size };
    }

    console.log(
      `FileDataStore: new sending file hash to file meta data object of`,
      _sendingHashToMetaData,
      `prepared`
    );

    _sendingRelatedData.updateSlice(_sendingHashToMetaData, _sendingMetaDataSliceKey);
  },
  checkIfSendingMetaDataPrepared(hashToFile) {
    let checkingPassed = true;
    for (const fileHash of Object.keys(hashToFile)) {
      if (!_sendingHashToMetaData[fileHash]) {
        checkingPassed = false;
        break;
      }
    }

    console.log(
      `FileDataStore: the current sending file hash to file meta data object of`,
      _sendingHashToMetaData,
      `is ${checkingPassed ? '' : 'not'} prepared for file buffer sending`
    );

    return checkingPassed;
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
    _sendingCancelledFileMap.setCancelled(peerId, fileHash, cancelled);
  },
  clearSendingCancelled() {
    _sendingCancelledFileMap.clear();
  },

  //
  // Sending Progress
  //
  // attention: only sender can directly update progress-related data
  //

  getSendingProgress(peerId, fileHash) {
    return _sendingProgressMap.getProgress(peerId, fileHash);
  },
  setSendingProgress(peerId, fileHash, progress) {
    _sendingProgressMap.setProgress(peerId, fileHash, progress);
  },
  resetSendingProgress(peerId, fileHash) {
    _sendingProgressMap.resetProgress(peerId, fileHash);
  },

  //
  // Receiving meta data
  //

  mergeReceivingHashToMetaData(peerId, hashToMetaData) {
    _receivingHashToMetaDataMap.mergeHashToMetaData(peerId, hashToMetaData);
  },

  //
  // Receiving data (Buffer)
  //
  // attention: progress-related data is updated internally
  //

  addReceivingBuffer(peerId, fileHash, buffer) {
    _receivingHashToBufferListMap.addBuffer(peerId, fileHash, buffer);
  },
  resetReceivingBufferList(peerId, fileHash) {
    _receivingHashToBufferListMap.resetBufferList(peerId, fileHash);
  },
  deleteReceivingHashToBufferList(peerId) {
    _receivingHashToBufferListMap.deleteHashToBufferList(peerId);
  },
  clearReceivingHashToBufferList() {
    _receivingHashToBufferListMap.clear();
  },

  //
  // Listeners
  //

  onSendingRelatedDataChanged: function (handler) {
    _handleSendingRelatedDataChange = handler;
  },
  onReceivingRelatedDataChanged: function (handler) {
    _handleReceivingRelatedDataChange = handler;
  },
};
