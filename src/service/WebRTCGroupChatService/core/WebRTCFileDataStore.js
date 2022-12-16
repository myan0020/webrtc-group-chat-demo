/**
 * TODO:
 *
 * Priority Level: Low
 *
 * 1. indexedDB persisting cannot work correctly when receiving buffer(chunk) size is higher than 32 * 1024 bytes;
 * 2. too frequent receiving buffer persisting, not good for performance;
 */

/**
 * Sending && Receiving view model
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
      `by sending status of isSending(${isSendingStatusSending})`
    );

    // listener
    if (_handleSendingRelatedDataChange) {
      _handleSendingRelatedDataChange(_shadowCopy(this), isSendingStatusSending);
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
      _handleSendingRelatedDataChange(_shadowCopy(this));
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
      _handleReceivingRelatedDataChange(_shadowCopy(this));
    }
  },
  _shadowCopyThis() {
    return { peerMap: this.peerMap };
  },
};

/**
 * Sending meta data
 */

let _sendingHashToMetaData = {};

function _prepareSendingMetaData(hashToFile) {
  // _sendingHashToMetaData = { ..._sendingHashToMetaData };

  for (const [fileHash, file] of Object.entries(hashToFile)) {
    _sendingHashToMetaData[fileHash] = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    };
  }

  console.log(
    `FileDataStore: new sending file hash to file meta data object of`,
    _sendingHashToMetaData,
    `prepared`
  );

  _sendingRelatedData.updateSlice(_sendingHashToMetaData, _sendingMetaDataSliceKey);
}

function _checkIfSendingMetaDataPrepared(hashToFile) {
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
}

/**
 * Sending && Receiving cancelled
 */

let _sendingHashToCancelled = {};

const _receivingCancelledMap = {
  peerMap: new Map(),
  getCancelled(peerId, fileHash) {
    let hashToCancelled = this.peerMap.get(peerId);
    if (!hashToCancelled) {
      return false;
    }
    return hashToCancelled[fileHash];
  },
  setCancelled(peerId, fileHash, cancelled) {
    if (!_isStringValid(peerId) || !_isStringValid(fileHash)) {
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
  deleteCancelled(peerId, fileHash) {
    this.setCancelled(peerId, fileHash, false);
  },
  clear() {
    this.peerMap = new Map();
  },
};

/**
 *  Sending && Receiving progress
 */

const _sendingProgressMap = _createFileProgressMap(true);
const _receivingProgressMap = _createFileProgressMap(false);

function _createFileProgressMap(isSending) {
  const progressMap = {
    // the progress data container
    peerMap: new Map(),

    // get the transceiving progress of a file for a specific peer
    getProgress: function (peerId, fileHash) {
      if (!_isStringValid(peerId) || !_isStringValid(fileHash)) {
        return 0;
      }
      if (!this.peerMap.has(peerId) || !this.peerMap.get(peerId)[fileHash]) {
        return 0;
      }
      return this.peerMap.get(peerId)[fileHash];
    },

    // set the transceiving progress of a file for a specific peer
    setProgress: function (peerId, fileHash, progress) {
      if (!_isStringValid(peerId) || !_isStringValid(fileHash)) {
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
        const sendingHashToMinProgress = _sendingHashToMinProgress(_sendingHashToMetaData, this);
        _sendingRelatedData.updateSlice(sendingHashToMinProgress, _sendingMinProgressSliceKey);

        // sending status is dependent on sending minimum porgress
        const isSendingStatusSending = _isSendingStatusSending(
          sendingHashToMinProgress,
          _sendingHashToMetaData,
          _sendingHashToCancelled
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

      return curProgress;
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
      if (!_isStringValid(fileHash) || this.peerMap.size === 0) {
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
 * Sending minimum progress
 */

function _sendingHashToMinProgress(sendingHashToMetaData, sendingProgressMap) {
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
}

/**
 * Sending status
 */

function _isSendingStatusSending(
  sendingHashToMinProgress,
  sendingHashToMetaData,
  sendingHashToCancelled
) {
  let isSending = false;

  if (!sendingHashToMinProgress || !sendingHashToMetaData) {
    console.log(`FileDataStore: unexpected params when getting sending status`);
    return isSending;
  }

  let sumSize = 0;
  let sumMinProgress = 0;

  for (const [fileHash, metaData] of Object.entries(sendingHashToMetaData)) {
    if (sendingHashToCancelled[fileHash]) {
      continue;
    }
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
}

/**
 * Receiving meta data
 */

const _receivingHashToMetaDataMap = {
  // the receiving and peer-related file hash to meta data container
  peerMap: new Map(),

  // get the file hash to meta data object for a given peer
  getHashToMetaData(peerId) {
    if (!_isStringValid(peerId)) {
      return null;
    }
    return this.peerMap.get(peerId);
  },

  // get the meta data of a given file hash for a given peer
  getMetaData(peerId, fileHash) {
    if (!_isStringValid(fileHash)) {
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
    if (!_isStringValid(peerId)) {
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
    if (!_isStringValid(peerId) || !_isStringValid(fileHash)) {
      return;
    }
    this.mergeHashToMetaData(peerId, { [fileHash]: metaData });
  },
};

/**
 * Receiving buffer persistence
 */

function _addReceivingBuffer(peerId, fileHash, buffer) {
  if (_receivingCancelledMap.getCancelled(peerId, fileHash)) {
    console.log(
      `FileDataStore: a receiving buffer of a file (${fileHash}) for a peer (${peerId}) cancelled during adding it`
    );
    return;
  }

  if (!_IDBDatabasePromise) {
    console.error(
      `FileDataStore: unfound IDB promise during adding receiving buffer of a file (${fileHash}) for a peer (${peerId})`
    );
    return;
  }

  _IDBDatabasePromise
    .then((IDBDatabase) => {
      if (!IDBDatabase) {
        throw new Error(
          `FileDataStore: unfound IDB during adding receiving buffer of a file (${fileHash}) for a peer (${peerId})`
        );
      }
      _receivingHashToExporterMap.scheduleAddBufferTask(peerId, fileHash, IDBDatabase, buffer);
    })
    .catch((error) => {
      console.error(error);
    });
}

function _resetReceivingBuffer(peerId, fileHash) {
  if (!_IDBDatabasePromise) {
    console.error(
      `FileDataStore: unfound IDB promise during resetting receiving buffer of a file (${fileHash}) for a peer (${peerId})`
    );
    return;
  }

  _IDBDatabasePromise
    .then((IDBDatabase) => {
      if (!IDBDatabase) {
        throw new Error(
          `FileDataStore: unfound IDB during resetting receiving buffer of a file (${fileHash}) for a peer (${peerId})`
        );
      }
      _receivingHashToExporterMap.scheduleResetBufferTask(peerId, fileHash, IDBDatabase);
    })
    .catch((error) => {
      console.error(error);
    });
}

function _resetAllReceivingBuffers() {
  if (!_IDBDatabasePromise) {
    console.error(`FileDataStore: unfound IDB promise during resetting all receiving buffers`);
    return;
  }

  _IDBDatabasePromise
    .then((IDBDatabase) => {
      if (!IDBDatabase) {
        throw new Error(`FileDataStore: unfound IDB during resetting all receiving buffers`);
      }

      _resetIDBAllReceivingBuffers(IDBDatabase);
    })
    .catch((error) => {
      console.error(error);
    });
}

function _resetAllReceivingBufferMergedFiles() {
  const allFileIds = _receivingHashToExporterMap.avaliableFileIds;

  if (!_IDBDatabasePromise) {
    console.error(
      `FileDataStore: unfound IDB promise during resetting all receiving buffer merged files with all file Ids`,
      allFileIds
    );
    return;
  }

  _IDBDatabasePromise
    .then((IDBDatabase) => {
      if (!IDBDatabase) {
        throw new Error(
          `FileDataStore: unfound IDB during resetting all receiving buffer merged files with all file Ids`
        );
      }

      _resetIDBReceivingBufferMergedFiles(allFileIds, IDBDatabase);
    })
    .catch((error) => {
      console.error(error);
    });
}

let _IDBDatabasePromise;
const _IDBDatabaseName = "WebRTCFileTransceivingDB";
const _IDBReceivingBufferStoreName = "receivingBufferStore";
const _IDBReceivingFileStoreName = "receivingFileStore";
const _IDBDatabaseVersion = 1;

function _openIDB() {
  _IDBDatabasePromise = new Promise((resolve, reject) => {
    console.log(`FileDataStore: indexedDB is opening ...`);

    const request = indexedDB.open(_IDBDatabaseName, _IDBDatabaseVersion);

    request.onupgradeneeded = function (event) {
      console.log(`FileDataStore: indexedDB is upgrading ...`);
      switch (event.oldVersion) {
        case 0:
          // version 0 means that the client had no database, perform initialization
          let database = request.result;
          if (!database.objectStoreNames.contains(_IDBReceivingBufferStoreName)) {
            // store receiving buffer
            const receivingBufferObjectStore = database.createObjectStore(
              _IDBReceivingBufferStoreName,
              {
                keyPath: "bufferId",
              }
            );
            receivingBufferObjectStore.createIndex("fileId_idx", "fileId");
          }
          if (!database.objectStoreNames.contains(_IDBReceivingFileStoreName)) {
            // store files where each file is merged by receiving buffer
            const receivingFileObjectStore = database.createObjectStore(
              _IDBReceivingFileStoreName,
              {
                keyPath: "fileId",
              }
            );
            receivingFileObjectStore.createIndex("fileId_idx", "fileId");
          }
        case 1:
        // client had version 1
        // update
      }
    };
    request.onsuccess = function () {
      // ...the db is ready, use it...
      console.log(`FileDataStore: indexedDB is now open`);

      const database = request.result;
      database.onversionchange = function () {
        database.close();
        alert("IndexedDB is outdated, please reload the page in order to upgrade it");
      };
      database.onerror = function (event) {
        console.error(
          `FileDataStore: unexpected and uncatched indexedDB onerror`,
          event.target.error
        );
      };
      resolve(database);
    };
    request.onblocked = function () {
      // this event shouldn't trigger if we handle onversionchange correctly

      // it means that there's another open connection to the same database
      // and it wasn't closed after db.onversionchange triggered for it
      reject();
      alert(
        "Can not open a new version of indexedDB, because an outdated version of it is still open, please try close the outdated one first"
      );
    };
    request.onerror = (event) => {
      console.error(
        `FileDataStore: unexpected indexedDB open database request onerror`,
        event.target.error
      );
      reject();
    };
  });
}

const _receivingBufferIDBPersistingSchedulerMap = {
  peerMap: new Map(),
  scheduleNextTask(peerId, fileHash, task) {
    let hashToPersistingPromiseChain = this.peerMap.get(peerId);
    if (!hashToPersistingPromiseChain) {
      console.log(`FileDataStore: unfound file hash to persisting promise chain object`);
      hashToPersistingPromiseChain = {};
    }
    if (!hashToPersistingPromiseChain[fileHash]) {
      console.log(`FileDataStore: unfound persisting promise chain of a file (${fileHash})`);

      hashToPersistingPromiseChain[fileHash] = new Promise((resolve, _) => {
        const initialStartOffset = 0;
        resolve({ fulFilledType: "RESET", startOffset: initialStartOffset });
      });
    }

    hashToPersistingPromiseChain[fileHash] = hashToPersistingPromiseChain[fileHash].then(
      task,
      (error) => {
        console.error(error);
      }
    );

    this.peerMap.set(peerId, hashToPersistingPromiseChain);
  },
};

const _receivingHashToExporterMap = {
  // the receiving and peer-related file hash to file exporter container
  peerMap: new Map(),

  avaliableFileIds: [],

  setExporter(peerId, fileHash, exporter) {
    let hashToExporter = this.peerMap.get(peerId);
    if (!hashToExporter) {
      hashToExporter = {};
    }
    hashToExporter[fileHash] = exporter;
    this.peerMap.set(peerId, hashToExporter);

    if (exporter) {
      this.avaliableFileIds.push(_buildFileId(peerId, fileHash));
    } else {
      const fileId = _buildFileId(peerId, fileHash);
      const deletionIndex = this.avaliableFileIds.indexOf(fileId);
      this.avaliableFileIds.splice(deletionIndex, 1);
    }
    _receivingRelatedData.updateSlice(this.peerMap, _receivingFileExporterSliceKey);
  },

  clearExporters() {
    this.peerMap.forEach((hashToExporter, peerId) => {
      Object.entries(hashToExporter).forEach(([fileHash, exporter]) => {
        this.setExporter(peerId, fileHash, null);
      });
    });
    _receivingRelatedData.updateSlice(this.peerMap, _receivingFileExporterSliceKey);
  },

  scheduleAddBufferTask(peerId, fileHash, IDBDatabase, buffer) {
    const addIDBBufferTask = (fulFilledValue) => {
      let fulFilledType = fulFilledValue ? fulFilledValue.fulFilledType : undefined;
      let startOffset = fulFilledValue ? fulFilledValue.startOffset : undefined;

      if (startOffset === undefined) {
        console.log(`FileDataStore: skipped an invalid startOffset of ${startOffset}`);
        return;
      }

      return _addIDBReceivingBuffer(peerId, fileHash, IDBDatabase, buffer, startOffset);
    };
    _receivingBufferIDBPersistingSchedulerMap.scheduleNextTask(peerId, fileHash, addIDBBufferTask);
    console.log(
      `FileDataStore: scheduled adding receiving buffer of a file (${fileHash}) for a peer (${peerId})`
    );
  },

  // reset buffer list to an empty list of a file for a specific peer
  scheduleResetBufferTask(peerId, fileHash, IDBDatabase) {
    const resetIDBBufferTask = (fulFilledValue) => {
      let fulFilledType = fulFilledValue ? fulFilledValue.fulFilledType : undefined;
      let startOffset = fulFilledValue ? fulFilledValue.startOffset : undefined;

      return _resetIDBReceivingBuffer(peerId, fileHash, IDBDatabase);
    };
    _receivingBufferIDBPersistingSchedulerMap.scheduleNextTask(
      peerId,
      fileHash,
      resetIDBBufferTask
    );
    console.log(
      `FileDataStore: scheduled resetting receiving buffer of a file (${fileHash}) for a peer (${peerId})`
    );
  },
};

function _addIDBReceivingBuffer(peerId, fileHash, IDBDatabase, buffer, startOffset) {
  return new Promise((resolve, reject) => {
    const transaction = IDBDatabase.transaction(_IDBReceivingBufferStoreName, "readwrite");
    const store = transaction.objectStore(_IDBReceivingBufferStoreName);
    const request = store.put({
      bufferId: _buildBufferId(peerId, fileHash, startOffset),
      fileId: _buildFileId(peerId, fileHash),
      buffer: buffer,
      startOffset: startOffset,
    });
    let isOperationSuccessful = true;

    request.onsuccess = function (event) {
      console.log(`FileDataStore: IDB request to add(put) receiving buffer onsuccess`, event);
    };
    request.onerror = function (event) {
      console.error(
        `FileDataStore: IDB request to add(put) receiving buffer onerror, start to rollback`,
        event
      );
      isOperationSuccessful = false;
    };
    transaction.onerror = (event) => {
      console.error(`FileDataStore: IDB transaction to add(put) receiving buffer onerror`, event);
    };
    transaction.oncomplete = (event) => {
      console.log(
        `FileDataStore: IDB transaction to add(put) receiving buffer of a file (${fileHash}) for a peer (${peerId}) from startOffset (${startOffset}) oncomplete`,
        isOperationSuccessful
      );

      if (!isOperationSuccessful) {
        reject(undefined);
        return;
      }

      if (_receivingCancelledMap.getCancelled(peerId, fileHash)) {
        console.log(`FileDataStore: due to receiving cancelled`);

        // perform IDB rollback because of a receiving file cancelled
        const transaction = IDBDatabase.transaction(_IDBReceivingBufferStoreName, "readwrite");
        const store = transaction.objectStore(_IDBReceivingBufferStoreName);
        const request = store.delete(_buildBufferId(peerId, fileHash, startOffset));
        request.onsuccess = function (event) {
          console.log(
            `FileDataStore: IDB manaully rollbacking request to delete receiving buffer onsuccess`,
            event
          );
        };
        request.onerror = function (event) {
          console.error(
            `FileDataStore: IDB manaully rollbacking request to delete receiving buffer onerror`,
            event
          );
        };
        transaction.oncomplete = (event) => {
          console.log(
            `FileDataStore: IDB manaully rollbacking transaction to delete receiving buffer of a file (${fileHash}) for a peer (${peerId}) from startOffset (${startOffset}) oncomplete`
          );
        };

        reject(undefined);
        return;
      }

      // update progress map && perform merging buffer into a file if needed
      const nextStartOffset = _receivingProgressMap.addProgress(
        peerId,
        fileHash,
        buffer.byteLength
      );
      const metaData = _receivingHashToMetaDataMap.getMetaData(peerId, fileHash);
      const isMergingBufferNeeded = metaData && nextStartOffset >= metaData.size;
      if (isMergingBufferNeeded) {
        _mergeIDBReceivingBufferIfNeeded(peerId, fileHash, IDBDatabase);
        resolve({ fulFilledType: "ADD", startOffset: 0 });
        return;
      }
      resolve({ fulFilledType: "ADD", startOffset: nextStartOffset });
    };
  });
}

function _mergeIDBReceivingBufferIfNeeded(peerId, fileHash, IDBDatabase) {
  // get all receiving buffer of a file, from indexedDB, for merging purpose
  const transaction = IDBDatabase.transaction(_IDBReceivingBufferStoreName, "readonly");
  const store = transaction.objectStore(_IDBReceivingBufferStoreName);
  const index = store.index("fileId_idx");
  const request = index.openCursor(IDBKeyRange.only(_buildFileId(peerId, fileHash)));
  const bufferWrapperList = [];

  request.onerror = function (event) {
    console.error(`FileDataStore: IDB request to open cursor of receiving buffer onerror`, event);
  };
  request.onsuccess = function (event) {
    console.log(`FileDataStore: IDB request to open cursor of receiving buffer onsuccess`, event);

    const cursor = event.target.result;
    if (cursor) {
      console.log(
        `FileDataStore: it is a valid cursor of receiving buffer including startOffset (${cursor.value.startOffset})`
      );

      const record = cursor.value;
      bufferWrapperList.push({
        buffer: record.buffer,
        startOffset: record.startOffset,
      });

      cursor.continue();
    } else {
      console.log(
        `FileDataStore: ending up with a invalid cursor of receiving buffer, time to creat a file with a buffer wrapper list of`,
        bufferWrapperList
      );

      // merge a list of arraybuffer into a file
      const sortedBufferList = bufferWrapperList
        .sort((a, b) => {
          return a.startOffset - b.startOffset;
        })
        .map((bufferWrapper) => bufferWrapper.buffer);
      const metaData = _receivingHashToMetaDataMap.getMetaData(peerId, fileHash);
      const file = new File([new Blob(sortedBufferList)], metaData.name, {
        type: metaData.type,
        lastModified: metaData.lastModified,
      });

      // add the file into IDB
      const transaction = IDBDatabase.transaction(_IDBReceivingFileStoreName, "readwrite");
      const store = transaction.objectStore(_IDBReceivingFileStoreName);
      const request = store.put({
        fileId: _buildFileId(peerId, fileHash),
        file: file,
      });

      request.onsuccess = function (event) {
        console.log(
          `FileDataStore: IDB request to add(put) a merged receiving file onsuccess`,
          event
        );
      };
      request.onerror = function (event) {
        console.error(
          `FileDataStore: IDB request to add(put) a merged receiving file onerror`,
          event
        );
      };
      transaction.oncomplete = (event) => {
        console.log(
          `FileDataStore: IDB transaction to add(put) a merged receiving file (${fileHash}) for a peer (${peerId}) oncomplete`,
          event
        );

        // after the file added into IDB, make a file exporter to export this file from indexedDB for future usage
        const fileExporter = () => {
          return _getIDBReceivingFile(peerId, fileHash, IDBDatabase);
        };
        _receivingHashToExporterMap.setExporter(peerId, fileHash, fileExporter);

        // after the file added into IDB, delete all receiving buffers which are merged into it
        const transaction = IDBDatabase.transaction(_IDBReceivingBufferStoreName, "readwrite");
        const store = transaction.objectStore(_IDBReceivingBufferStoreName);
        const index = store.index("fileId_idx");
        const request = index.openCursor(IDBKeyRange.only(_buildFileId(peerId, fileHash)));
        request.onerror = function (event) {
          console.error(
            `FileDataStore: IDB request to open cursor of receiving buffer onerror`,
            event
          );
        };
        request.onsuccess = function (event) {
          console.log(
            `FileDataStore: IDB request to open cursor of receiving buffer onsuccess`,
            event
          );

          const cursor = event.target.result;
          if (cursor) {
            const request = store.delete(cursor.primaryKey);
            request.onsuccess = function (event) {};
            request.onerror = function (event) {};
            cursor.continue();
          }
        };
      };
    }
  };
}

function _getIDBReceivingFile(peerId, fileHash, IDBDatabase) {
  return new Promise((resolve, reject) => {
    const transaction = IDBDatabase.transaction(_IDBReceivingFileStoreName, "readwrite");
    const store = transaction.objectStore(_IDBReceivingFileStoreName);
    const request = store.get(_buildFileId(peerId, fileHash));
    let isOperationSuccessful = true;
    let file;

    request.onsuccess = (event) => {
      console.log(`FileDataStore: IDB request to get a receiving file onsuccess`, event);

      const record = event.target.result;
      if (!record) {
        console.log(
          `FileDataStore: unexpected empty record of receiving file (${fileHash}) for a peer (${peerId})`
        );
        return;
      }
      file = record.file;
    };
    request.onerror = (event) => {
      console.error(`FileDataStore: IDB request to get a receiving file onerror`, event);
      isOperationSuccessful = false;
    };
    transaction.oncomplete = (event) => {
      console.log(
        `FileDataStore: IDB transaction to get a receiving file (${fileHash}) for a peer (${peerId}) oncomplete`,
        event
      );

      if (!isOperationSuccessful) {
        reject();
        return;
      }

      resolve(file);
    };
  });
}

function _resetIDBAllReceivingBuffers(IDBDatabase) {
  return new Promise((resolve, reject) => {
    const transaction = IDBDatabase.transaction(_IDBReceivingBufferStoreName, "readwrite");
    const store = transaction.objectStore(_IDBReceivingBufferStoreName);
    const request = store.clear();
    let isOperationSuccessful = true;

    request.onsuccess = function (event) {
      console.log(`FileDataStore: IDB request to clear all receiving buffers onsuccess`, event);
    };
    request.onerror = function (event) {
      console.error(`FileDataStore: IDB request to clear all receiving buffers onerror`, event);
      isOperationSuccessful = false;
    };

    transaction.oncomplete = () => {
      console.log(`FileDataStore: IDB transaction to clear all receiving buffers oncomplete`);

      if (!isOperationSuccessful) {
        reject();
        return;
      }
      resolve();
    };
  });
}

function _resetIDBReceivingBuffer(peerId, fileHash, IDBDatabase) {
  return new Promise((resolve, reject) => {
    const transaction = IDBDatabase.transaction(_IDBReceivingBufferStoreName, "readwrite");
    const store = transaction.objectStore(_IDBReceivingBufferStoreName);
    const index = store.index("fileId_idx");
    const request = index.openCursor(IDBKeyRange.only(_buildFileId(peerId, fileHash)));
    let isOperationSuccessful = true;

    request.onsuccess = function (event) {
      console.log(`FileDataStore: IDB request to open cursor of receiving buffer onsuccess`, event);

      const cursor = event.target.result;
      if (cursor) {
        const request = store.delete(cursor.primaryKey);
        request.onsuccess = function (event) {
          console.log(`FileDataStore: IDB request to delete a receiving buffer onsuccess`, event);
        };
        request.onerror = function (event) {
          console.error(`FileDataStore: IDB request to delete a receiving buffer onerror`, event);
          isOperationSuccessful = false;
        };
        cursor.continue();
      }
    };
    request.onerror = function (event) {
      console.error(`FileDataStore: IDB request to open cursor of receiving buffer onerror`, event);
      isOperationSuccessful = false;
    };
    transaction.oncomplete = () => {
      console.log(
        `FileDataStore: IDB transaction to open cursor and delete receiving buffer of a file (${fileHash}) for a peer (${peerId}) oncomplete`
      );

      if (!isOperationSuccessful) {
        reject();
        return;
      }

      _receivingProgressMap.resetProgress(peerId, fileHash);
      resolve({ fulFilledType: "RESET", startOffset: 0 });
    };
  });
}

function _resetIDBReceivingBufferMergedFiles(fileIds, IDBDatabase) {
  const intersectingFileIds = _receivingHashToExporterMap.avaliableFileIds.filter((x) =>
    fileIds.includes(x)
  );
  const isAllResetting =
    intersectingFileIds.length >= _receivingHashToExporterMap.avaliableFileIds.length;

  return new Promise((resolve, reject) => {
    const transaction = IDBDatabase.transaction(_IDBReceivingFileStoreName, "readwrite");
    const store = transaction.objectStore(_IDBReceivingFileStoreName);
    let isOperationSuccessful = true;

    if (isAllResetting) {
      const request = store.clear();
      request.onsuccess = function (event) {
        console.log(
          `FileDataStore: IDB request to clear all receiving buffer merged files onsuccess`,
          event
        );
        _receivingHashToExporterMap.clearExporters();
      };
      request.onerror = function (event) {
        console.error(
          `FileDataStore: IDB request to clear all receiving buffer merged files onerror`,
          event
        );
        isOperationSuccessful = false;
      };
    } else {
      const request = store.openCursor();
      request.onsuccess = function (event) {
        const cursor = event.target.result;

        console.log(
          `FileDataStore: IDB request to open cursor of receiving buffer merged file 'onsuccess' with a primaryKey(${cursor.primaryKey})`,
          event
        );

        if (cursor) {
          const fileId = cursor.primaryKey;
          if (intersectingFileIds.includes(fileId)) {
            const request = store.delete(fileId);
            request.onsuccess = function (event) {
              console.log(
                `FileDataStore: IDB request to delete a receiving buffer merged file with fileId(${cursor.primaryKey}) onsuccess`,
                event
              );

              const { peerId, fileHash } = _parseFileId(fileId);
              _receivingHashToExporterMap.setExporter(peerId, fileHash, null);
            };
            request.onerror = function (event) {
              console.error(
                `FileDataStore: IDB request to delete a receiving buffer merged file with fileId(${cursor.primaryKey}) onerror`,
                event
              );
            };
          }
          cursor.continue();
        }
      };
      request.onerror = function (event) {
        isOperationSuccessful = false;
        console.error(
          `FileDataStore: IDB request to open cursor of receiving buffer merged files onerror`,
          event
        );
      };
    }

    transaction.oncomplete = () => {
      console.log(
        `FileDataStore: IDB transaction to delete receiving buffer merged files oncomplete`
      );

      if (!isOperationSuccessful) {
        reject();
        return;
      }
      resolve();
    };
  });
}

_openIDB();

/**
 * Utils
 */

function _isStringValid(string) {
  return string && string.length > 0;
}

function _shadowCopy(obj) {
  const copied = {};
  Object.keys(obj).forEach((property) => {
    copied[property] = obj[property];
  });
  return copied;
}

function _buildFileId(peerId, fileHash) {
  return `${peerId}-${fileHash}`;
}

function _buildBufferId(peerId, fileHash, startOffset) {
  return `${peerId}-${fileHash}-${startOffset}`;
}

function _parseFileId(fileId) {
  const elements = fileId.split("-");
  return {
    peerId: elements.slice(0, -1).join(""),
    fileHash: elements[elements.length - 1],
  };
}

function _parseBufferId(bufferId) {
  const elements = bufferId.split("-");
  const startOffsetString = elements[elements.length - 1];
  return {
    peerId: elements.slice(0, -2).join(""),
    fileHash: elements[elements.length - 2],
    startOffset: Number(startOffsetString) !== NaN ? Number(startOffsetString) : undefined,
  };
}

export default {
  //
  // Sending && Receiving view model
  //

  // sending slice keys inside sending view model
  get sendingSliceContainerKey() {
    return _sendingSliceContainerKey;
  },
  get sendingMetaDataSliceKey() {
    return _sendingMetaDataSliceKey;
  },
  get sendingMinProgressSliceKey() {
    return _sendingMinProgressSliceKey;
  },
  // receiving slice keys inside receiving view model
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
  // sending view model changed listener
  onSendingRelatedDataChanged: function (handler) {
    _handleSendingRelatedDataChange = handler;
  },
  // receiving view model changed listener
  onReceivingRelatedDataChanged: function (handler) {
    _handleReceivingRelatedDataChange = handler;
  },

  //
  // Sending chunk size
  //

  get maxSendingChunkSize() {
    return 16 * 1024;
  },

  //
  // Sending meta data
  //

  get preparedSendingHashToMetaData() {
    return _sendingHashToMetaData;
  },
  prepareSendingMetaData(hashToFile) {
    _prepareSendingMetaData(hashToFile);
  },
  checkIfSendingMetaDataPrepared(hashToFile) {
    return _checkIfSendingMetaDataPrepared(hashToFile);
  },

  //
  // Sending && Receiving cancelled
  //

  // sending cancelled
  getSendingCancelled(fileHash) {
    return _sendingHashToCancelled[fileHash];
  },
  setSendingCancelled(fileHash, cancelled) {
    _sendingHashToCancelled[fileHash] = cancelled;
  },
  clearSendingCancelled() {
    _sendingHashToCancelled = {};
  },
  // receiving cancelled
  setReceivingCancelled(peerId, fileHash, cancelled) {
    _receivingCancelledMap.setCancelled(peerId, fileHash, cancelled);
  },
  deleteReceivingCancelled(peerId, fileHash) {
    _receivingCancelledMap.deleteCancelled(peerId, fileHash);
  },

  //
  // Sending progress
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
  // Receiving buffer persistence
  //

  addReceivingBuffer(peerId, fileHash, buffer) {
    _addReceivingBuffer(peerId, fileHash, buffer);
  },
  resetReceivingBuffer(peerId, fileHash) {
    _resetReceivingBuffer(peerId, fileHash);
  },
  resetAllReceivingBuffers() {
    _resetAllReceivingBuffers();
  },
  resetAllReceivingBufferMergedFiles() {
    _resetAllReceivingBufferMergedFiles();
  },
};
