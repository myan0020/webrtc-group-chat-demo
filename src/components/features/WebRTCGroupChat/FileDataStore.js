/**
 * For UI modeling
 */

const _sendingSliceContainerKey = "hashToConcatData";
const _sendingMetaDataSliceKey = "SENDING_META_DATA_SLICE_KEY";
const _sendingMinProgressSliceKey = "SENDING_MIN_PROGRESS_SLICE_KEY";

const _receivingSliceContainerKey = "peerMap";
const _receivingMetaDataSliceKey = "RECEIVING_META_DATA_SLICE_KEY";
const _receivingFileExporterSliceKey = "RECEIVING_FILE_EXPORTER_SLICE_KEY";
const _receivingProgressSliceKey = "RECEIVING_PROGRESS_SLICE_KEY";

let _handleSendingRelatedDataChange;
let _handleReceivingRelatedDataChange;

const _sendingRelatedData = {
  hashToConcatData: {},
  updateSendingStatus(isSendingStatusSending) {
    console.log(
      `FileDataStore: the sending related data is updated to`,
      this,
      `by sending status of ${isSendingStatusSending}`
    );

    // listener
    if (_handleSendingRelatedDataChange) {
      _handleSendingRelatedDataChange(shadowCopy(this), isSendingStatusSending);
    }
  },
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
      _handleSendingRelatedDataChange(shadowCopy(this));
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
      _handleReceivingRelatedDataChange(shadowCopy(this));
    }
  },
  shadowCopyThis() {
    return { peerMap: this.peerMap };
  },
};

/**
 * Sending file hash to file
 */

let _sendingHashToMetaData = {};

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
  },
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
        const sendingHashToMinProgress = _computedSendingHashToMinProgress(
          _sendingHashToMetaData,
          this
        );
        _sendingRelatedData.updateSlice(sendingHashToMinProgress, _sendingMinProgressSliceKey);

        // sending status is dependent on sending minimum porgress
        const isSendingStatusSending = _isSendingStatusSending(
          sendingHashToMinProgress,
          _sendingHashToMetaData
        );
        _sendingRelatedData.updateSendingStatus(isSendingStatusSending);
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
 * Sending file hash to min progress
 */

// compute and output a file hash to sending minimum progress
const _computedSendingHashToMinProgress = function (sendingHashToMetaData, sendingProgressMap) {
  if (!sendingHashToMetaData) {
    console.log(`FileDataStore: sendingHashToMetaData not exist`);
    return null;
  }

  const sendingHashToMinProgress = {};
  Object.keys(sendingHashToMetaData).forEach((fileHash) => {
    const minProgress = sendingProgressMap.calculateMinProgress(fileHash);
    sendingHashToMinProgress[fileHash] = minProgress;
  });
  console.log(
    `FileDataStore: when computing completed, the entire sending hash to sending min progress is`,
    sendingHashToMinProgress
  );

  return sendingHashToMinProgress;
};

const _isSendingStatusSending = function (sendingHashToMinProgress, sendingHashToMetaData) {
  let isSending = false;

  if (!sendingHashToMinProgress || !sendingHashToMetaData) {
    console.log(
      `FileDataStore _isSendingStatusSending: unexpected sending file hash to meta data or sending file hash to meta data`
    );
    return isSending;
  }

  let sumSize = 0;
  let sumMinProgress = 0;

  for (const [fileHash, metaData] of Object.entries(sendingHashToMetaData)) {
    const minProgress = sendingHashToMinProgress[fileHash];
    if (!metaData || typeof metaData.size !== "number" || typeof minProgress !== "number") {
      console.log(
        `FileDataStore: unexpected sending meta data for a file hash (${fileHash}) in a sending file hash to meta data of`,
        sendingHashToMetaData
      );
      return isSending;
    }

    sumSize += metaData.size;
    sumMinProgress += minProgress;
  }

  if (sumMinProgress > 0 && sumMinProgress < sumSize) {
    isSending = true;
  }
  return isSending;
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
 * Receiving persistence (using indexedDB)
 */

let _db;
let _isDBOpen = false;
const _dbName = "WebRTCFileDataDB";
const _dbReceivingBufferStoreName = "receivingBuffer";
const _dbReceivingFileStoreName = "receivingFile";
const _dbVersion = 1;
const _dbIdKey = "bufferId";
const _dbIdIndexName = "bufferId_idx";

_dbStartup();

function _dbReceivingBufferIdValue(peerId, fileHash, startOffset) {
  return `${peerId}-${fileHash}-${startOffset}`;
}

function _dbIdValue(peerId, fileHash) {
  return `${peerId}-${fileHash}`;
}

function _dbStartup() {
  console.log(`FileDataStore: DB is opening ...`);

  const dbOpenRequest = indexedDB.open(_dbName, _dbVersion);

  dbOpenRequest.onerror = (event) => {
    console.error(`FileDataStore: IndexedDB Open Request fail`);
  };
  dbOpenRequest.onupgradeneeded = function (event) {
    // the existing database version is less than 2 (or it doesn't exist)
    switch (
      event.oldVersion // existing db version
    ) {
      case 0:
        // version 0 means that the client had no database
        // perform initialization
        _db = dbOpenRequest.result;
        if (!_db.objectStoreNames.contains(_dbReceivingBufferStoreName)) {
          // store receiving buffer
          const receivingBufferObjectStore = _db.createObjectStore(_dbReceivingBufferStoreName, {
            keyPath: "bufferId",
          });
          receivingBufferObjectStore.createIndex("fileId_idx", "fileId");
        }
        if (!_db.objectStoreNames.contains(_dbReceivingFileStoreName)) {
          // store files where each file is merged by receiving buffer
          const receivingFileObjectStore = _db.createObjectStore(_dbReceivingFileStoreName, {
            keyPath: "fileId",
          });
          receivingFileObjectStore.createIndex("fileId_idx", "fileId");
        }

      case 1:
      // client had version 1
      // update
    }
  };
  dbOpenRequest.onsuccess = function () {
    _db = dbOpenRequest.result;

    _db.onversionchange = function () {
      _db.close();
      alert("Database is outdated, please reload the page.");
      _isDBOpen = false;
    };

    _isDBOpen = true;

    console.log(`FileDataStore: DB is now open`);

    // ...the db is ready, use it...
  };
  dbOpenRequest.onblocked = function () {
    alert("Can not open a new version database");
    // this event shouldn't trigger if we handle onversionchange correctly

    // it means that there's another open connection to the same database
    // and it wasn't closed after db.onversionchange triggered for it
  };
}

function _dbPutReceivingBufferPromiseBuilder(peerId, fileHash, buffer, startOffset) {
  return new Promise((resolve, reject) => {
    if (!_isDBOpen) {
      console.log(`FileDataStore: unexpected closed DB, and cannot put receiving buffer to DB`);
      return;
    }

    const transaction = _db.transaction(_dbReceivingBufferStoreName, "readwrite");
    transaction.oncomplete = () => {
      console.log(
        `FileDataStore: put receiving buffer of a file (${fileHash}) for a peer (${peerId}) completed`
      );

      // update progress map && merge into file if possible
      _receivingProgressMap.addProgress(peerId, fileHash, buffer.byteLength);
      _dbMergeReceivingBufferIfPossible(peerId, fileHash);

      // next put receiving buffer callback
      const startOffeset = _receivingProgressMap.getProgress(peerId, fileHash);
      resolve(startOffeset);
    };
    const receivingBufferStore = transaction.objectStore(_dbReceivingBufferStoreName);
    const record = {
      bufferId: `${peerId}-${fileHash}-${startOffset}`,
      fileId: `${peerId}-${fileHash}`,
      buffer: buffer,
      startOffset: startOffset,
    };

    const request = receivingBufferStore.put(record);
    request.onsuccess = function () {
      console.log(`FileDataStore: put receiving buffer to DB onsuccess`, request.result);
    };
    request.onerror = function () {
      console.log(`FileDataStore: put receiving buffer to DB onerror`, request.error);
    };
  });
}

function _dbResetReceivingBuffer(peerId, fileHash, completionHandler) {
  if (!_isDBOpen) {
    console.log(`FileDataStore: unexpected closed DB, and cannot reset receiving buffer to DB`);
    return;
  }

  const transaction = _db.transaction(_dbReceivingBufferStoreName, "readwrite");
  transaction.oncomplete = () => {
    if (completionHandler) {
      console.log(
        `FileDataStore: reset receiving buffer of a file (${fileHash}) for a peer (${peerId}) completed`
      );
      completionHandler();
    }
  };

  const receivingBufferStore = transaction.objectStore(_dbReceivingBufferStoreName);
  const index = receivingBufferStore.index("fileId_idx");
  const indexValue = `${peerId}-${fileHash}`;

  const openCursorRequest = index.openCursor(IDBKeyRange.only(indexValue));
  openCursorRequest.onsuccess = function (event) {
    console.log(`FileDataStore: reset receiving buffer from DB onsuccess`, event);
    const cursor = event.target.result;
    if (cursor) {
      receivingBufferStore.delete(cursor.primaryKey);
      cursor.continue();
    }
  };
  openCursorRequest.onerror = function (event) {
    console.log(`FileDataStore: reset receiving buffer from DB onerror`, event);
  };
}

function _dbMergeReceivingBufferIfPossible(peerId, fileHash) {
  const metaData = _receivingHashToMetaDataMap.getMetaData(peerId, fileHash);
  const receivingProgress = _receivingProgressMap.getProgress(peerId, fileHash);

  if (!metaData || typeof metaData.size !== "number" || receivingProgress < metaData.size) {
    return;
  }
  if (!_isDBOpen) {
    console.log(`FileDataStore: unexpected closed DB, and cannot merge receiving buffer from DB`);
    if (failureHandler) {
      failureHandler();
    }
    return;
  }

  const tmpBufferWrapperList = [];

  const transaction = _db.transaction(_dbReceivingBufferStoreName, "readwrite");
  const receivingBufferStore = transaction.objectStore(_dbReceivingBufferStoreName);
  const index = receivingBufferStore.index("fileId_idx");
  const indexValue = `${peerId}-${fileHash}`;

  const openCursorRequest = index.openCursor(IDBKeyRange.only(indexValue));
  openCursorRequest.onsuccess = function (event) {
    console.log(`FileDataStore: get a cursor of receiving buffer from DB onsuccess`, event);

    const cursor = event.target.result;
    if (cursor) {
      const record = cursor.value;
      console.log(
        `FileDataStore: a valid cursor of receiving buffer from DB, so build a buffer wrapper with arraybuffer`,
        record.buffer,
        `and startOffset (${record.startOffset})`
      );

      const bufferWrapper = {
        buffer: record.buffer,
        startOffset: record.startOffset,
      };
      tmpBufferWrapperList.push(bufferWrapper);

      // const cursorDeleteRequest = cursor.delete();
      // cursorDeleteRequest.onsuccess = (event) => {
      //   console.log(
      //     `FileDataStore: delete a vaild cursor of receiving buffer from DB onsuccess`,
      //     event
      //   );
      // };
      // cursorDeleteRequest.onerror = (event) => {
      //   console.log(
      //     `FileDataStore: delete a vaild cursor of receiving buffer from DB onerror`,
      //     event
      //   );
      // };

      cursor.continue();
    } else {
      console.log(
        `FileDataStore: no more valid cursor of receiving buffer from DB, start sorting array buffer wrapper list and then creating file`,
        tmpBufferWrapperList
      );

      const sortedBufferList = tmpBufferWrapperList
        .sort((a, b) => {
          return a.startOffset - b.startOffset;
        })
        .map((bufferWrapper) => bufferWrapper.buffer);
      const file = new File([new Blob(sortedBufferList)], metaData.name, {
        type: metaData.type,
        lastModified: metaData.lastModified,
      });
      const transaction = _db.transaction(_dbReceivingFileStoreName, "readwrite");
      transaction.oncomplete = () => {
        console.log(
          `FileDataStore: merge receiving buffer of a file (${fileHash}) for a peer (${peerId}) completed`
        );

        const exporter = _receivingHashToExporterMap.buildExporter(peerId, fileHash);
        _receivingHashToExporterMap.setExporter(peerId, fileHash, exporter);
      };
      const receivingFileStore = transaction.objectStore(_dbReceivingFileStoreName);
      const record = {
        fileId: `${peerId}-${fileHash}`,
        file: file,
      };

      const putRequest = receivingFileStore.put(record);
      putRequest.onsuccess = function (event) {
        console.log(`FileDataStore: set receiving file to DB onsuccess`, event);
      };
      putRequest.onerror = function (event) {
        console.log(`FileDataStore: set receiving file to DB onerror`, event);
      };
    }
  };
  openCursorRequest.onerror = function (event) {
    console.log(`FileDataStore: get receiving buffer from DB Error`, event);
  };
}

function _dbGetReceivingFile(peerId, fileHash, successHandler, errorHandler) {
  if (!_isDBOpen) {
    console.log(`FileDataStore: unexpected closed DB, and cannot get receiving buffer from DB`);
    return;
  }

  const transaction = _db.transaction(_dbReceivingFileStoreName, "readwrite");
  const receivingFileStore = transaction.objectStore(_dbReceivingFileStoreName);
  const primaryKeyValue = `${peerId}-${fileHash}`;

  let file;

  const getRequest = receivingFileStore.get(primaryKeyValue);
  getRequest.onsuccess = (event) => {
    const record = event.target.result;
    if (record !== undefined) {
      file = record.file;
    } else {
      console.log(`FileDataStore: no such file`);
    }

    if (successHandler) {
      successHandler(file);
    }
  };
  getRequest.onerror = (event) => {
    console.log(`FileDataStore: get receiving file from DB onerror`, event);

    if (errorHandler) {
      errorHandler(event.target.error);
    }
  };
}

/**
 * Receiving data (Buffer)
 */

const _receivingCachingPromiseMap = {
  peerMap: new Map(),
  addNextOnFulfilled(peerId, fileHash, nextOnFulfilled) {
    let cachingPromiseContainer = this.peerMap.get(peerId);
    if (!cachingPromiseContainer) {
      cachingPromiseContainer = {};
    }
    if (!cachingPromiseContainer[fileHash]) {
      const initialStartOffset = 0;
      cachingPromiseContainer[fileHash] = new Promise((resolve, reject) => {
        resolve(initialStartOffset);
      }).then(nextOnFulfilled);
    } else {
      cachingPromiseContainer[fileHash] = cachingPromiseContainer[fileHash].then(nextOnFulfilled);
    }
    this.peerMap.set(peerId, cachingPromiseContainer);
  },
};

const _receivingHashToExporterMap = {
  // the receiving and peer-related file hash to file exporter container
  peerMap: new Map(),

  buildExporter(peerId, fileHash) {
    return (successHandler, errorHandler) => {
      _dbGetReceivingFile(peerId, fileHash, successHandler, errorHandler);
    };
  },

  setExporter(peerId, fileHash, exporter) {
    let hashToExporter = this.peerMap.get(peerId);
    if (!hashToExporter) {
      hashToExporter = {};
    }
    hashToExporter[fileHash] = exporter;
    this.peerMap.set(peerId, hashToExporter);

    _receivingRelatedData.updateSlice(this.peerMap, _receivingFileExporterSliceKey);
  },

  resetExporter(peerId, fileHash) {
    this.setExporter(peerId, fileHash, null);
  },

  putBuffer(peerId, fileHash, buffer) {
    // adding additional receiving buffer
    const onCachingPromiseFilfilled = (startOffset) => {
      return _dbPutReceivingBufferPromiseBuilder(peerId, fileHash, buffer, startOffset);
    };
    _receivingCachingPromiseMap.addNextOnFulfilled(peerId, fileHash, onCachingPromiseFilfilled);
  },

  // reset buffer list to an empty list of a file for a specific peer
  resetBuffer(peerId, fileHash) {
    const handleResetReceivingBufferComplete = () => {
      _receivingProgressMap.resetProgress(peerId, fileHash);
      this.resetExporter(peerId, fileHash);
    };
    _dbResetReceivingBuffer(peerId, fileHash, handleResetReceivingBufferComplete);
  },
};

/**
 * Util
 */

const isStringValid = (string) => {
  return string && string.length > 0;
};

const shadowCopy = (obj) => {
  const copied = {};
  Object.keys(obj).forEach((property) => {
    copied[property] = obj[property];
  });
  return copied;
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
  get receivingFileExporterSliceKey() {
    return _receivingFileExporterSliceKey;
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
  prepareSendingMetaData(hashToFile, chunkSize, lastChunkSize) {
    for (const [fileHash, file] of Object.entries(hashToFile)) {
      _sendingHashToMetaData[fileHash] = {
        name: file.name,
        type: file.type,
        size: file.size,
        chunkSize,
        lastChunkSize,
      };
    }

    console.log(
      `FileDataStore: new sending file hash to file meta data object of`,
      _sendingHashToMetaData,
      `prepared`
    );

    _sendingRelatedData.updateSlice(_sendingHashToMetaData, _sendingMetaDataSliceKey);

    return _sendingHashToMetaData;
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
      `is ${checkingPassed ? "" : "not"} prepared for file buffer sending`
    );

    return checkingPassed;
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
    _receivingHashToExporterMap.putBuffer(peerId, fileHash, buffer);
  },
  resetReceivingBuffer(peerId, fileHash) {
    _receivingHashToExporterMap.resetBuffer(peerId, fileHash);
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
