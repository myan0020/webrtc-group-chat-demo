
const _fileHashToMetadataMap = new Map();
const _fileHashToDataMap = new Map();
const _filesSendProgress = {};
const _filesReceiveProgress = {};
const _cancelledFiles = {};
let _isSending = false;

export default {
  get fileHashToMetadataMap() {
    return _fileHashToMetadataMap;
  },
  set fileHashToMetadataMap(fileHashToMetadataMap) {
    _fileHashToMetadataMap = fileHashToMetadataMap;
  },

  getFileSendProgress(fileHash) {
    return _filesSendProgress[fileHash];
  },
  setFileSendProgress(fileHash, progress) {
    _filesSendProgress[fileHash] = progress;
  },

  getFileReceiveProgress(fileHash) {
    return _filesReceiveProgress[fileHash];
  },
  setFileReceiveProgress(fileHash, progress) {
    _filesReceiveProgress[fileHash] = progress;
  },


  get fileHashToDataMap() {
    return _fileHashToDataMap;
  },

  addFileData(fileHash, buffer) {
    let fileData = _fileHashToDataMap.get(fileHash)
    if (!fileData || !(fileData instanceof Array)) {
      fileData = [];
    }
    fileData.push(buffer);
    _fileHashToDataMap.set(fileHash, fileData);
  },

  deleteFileData(fileHash) {
    _fileHashToDataMap.delete(fileHash)
  },

  clearAllFilesData() {
    _fileHashToMetadataMap.clear();
    _fileHashToDataMap.clear();
    _filesReceiveProgress = {};
    _filesSendProgress = {};
  },

  get cancelledFiles() {
    return _cancelledFiles;
  },
  setCancelledFile(fileHash, canceled) {
    _cancelledFiles[fileHash] = canceled;
  },

  get isSending() {
    return _isSending;
  },
  set isSending(isSending) {
    _isSending = isSending;
  },

}