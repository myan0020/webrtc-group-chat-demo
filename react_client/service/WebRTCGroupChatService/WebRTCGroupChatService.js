/**
 *
 * This service provides a number of group chat features
 * including chat messaging, media calling and file transceiving
 * using W3C WebRTC API and simple mesh architecture
 *
 */

import WebRTCSignalingManager from "./core/WebRTCSignalingManager.js";
import WebRTCPeerConnectionManager from "./core/WebRTCPeerConnectionManager.js";
import WebRTCDataChannelManager from "./core/WebRTCDataChannelManager.js";
import WebRTCMediaCallingManager from "./core/WebRTCMediaCallingManager.js";

/**
 *  Preparations
 */

WebRTCSignalingManager.onWebRTCNewPeerLeaved(WebRTCPeerConnectionManager.handleNewPeerLeave);
WebRTCSignalingManager.onWebRTCNewPassthroughArival(
  WebRTCPeerConnectionManager.handleNewPassthroughArival
);
WebRTCSignalingManager.onWebRTCNewPeerArivalInternally(
  WebRTCPeerConnectionManager.handleNewPeerArivalInternally
);

function _resetRTCRelatedState() {
  WebRTCMediaCallingManager.hangUpCalling(true);
  WebRTCMediaCallingManager.clearAllPeerTransceivers();
  WebRTCPeerConnectionManager.closeALLPeerConnections();
  WebRTCDataChannelManager.cancelSenderAllFileSending();
  WebRTCDataChannelManager.clearAllFileBuffersReceived();
  WebRTCDataChannelManager.clearAllReceivingFiles();

  // TODO: need to clear sending&&receiving related data
  WebRTCDataChannelManager.clearSendingRelatedData();
  WebRTCDataChannelManager.clearReceivingRelatedData();
}

export default {
  /**
   * connect
   *
   * note: please call 'connect' when a user has already signed in
   */

  connect: function (webSocketUrl) {
    let url = webSocketUrl;

    if (typeof url !== "string" || url.length === 0) {
      console.debug(
        `WebRTCGroupChatService: coonecting failed because of invalid WebSocket url`,
        url
      );

      if (process.env.NODE_ENV === "production") {
        url = `wss://${location.hostname}`;
      } else {
        url = `ws://${location.hostname}:${env.EXPRESS_SERVER_PORT}`;
      }

      console.debug(
        `WebRTCGroupChatService: will use a default WebSocket url to coonect`,
        url
      );
    }

    WebRTCSignalingManager.webSocketUrl = url;
    WebRTCSignalingManager.connect();
  },

  /**
   * disconnect
   *
   * note: please call 'disconnect' when a user has just signed out
   */

  disconnect: function () {
    _resetRTCRelatedState();

    WebRTCSignalingManager.disconnect();
    WebRTCSignalingManager.webSocketUrl = undefined;
  },

  /**
   * Chat Room
   */

  // actions
  createNewRoom: function (roomName) {
    WebRTCSignalingManager.createNewRoomSignaling(roomName);
  },
  joinRoom: function (roomId) {
    WebRTCSignalingManager.joinRoomSignaling(roomId);
  },
  leaveRoom: function () {
    _resetRTCRelatedState();

    WebRTCSignalingManager.leaveRoomSignaling();
  },
  // listeners
  onJoinRoomInSuccess: function (handler) {
    WebRTCSignalingManager.onJoinRoomInSuccess(handler);
  },
  onRoomsInfoUpdated: function (handler) {
    WebRTCSignalingManager.onRoomsInfoUpdated(handler);
  },
  onLeaveRoomInSuccess: function (handler) {
    WebRTCSignalingManager.onLeaveRoomInSuccess(handler);
  },

  /**
   * Peer Connection
   */

  getPeerNameById(peerId) {
    return WebRTCPeerConnectionManager.getPeerNameById(peerId);
  },

  /**
   * Messaging
   */

  sendChatMessageToAllPeer(message) {
    WebRTCDataChannelManager.sendChatMessageToAllPeer(
      WebRTCPeerConnectionManager.peerConnectionMap,
      message
    );
  },
  onChatMessageReceived: function (handler) {
    WebRTCDataChannelManager.onChatMessageReceived(handler);
  },

  /**
   * File Transceiving
   */

  //
  // actions
  //
  // sending
  sendFileToAllPeer(files) {
    WebRTCDataChannelManager.sendFileToAllPeer(
      WebRTCPeerConnectionManager.peerConnectionMap,
      files
    );
  },
  // sending cancellation
  cancelAllFileSending() {
    WebRTCDataChannelManager.cancelSenderAllFileSending();
  },
  cancelFileSendingToAllPeer(fileHash) {
    WebRTCDataChannelManager.cancelSenderFileSendingToAllPeer(fileHash);
  },
  // receiving resetting (all buffers / downloadable files, will be deleted)
  clearAllFileBuffersReceived() {
    WebRTCDataChannelManager.clearAllFileBuffersReceived();
  },
  clearAllFilesReceived() {
    WebRTCDataChannelManager.clearAllReceivingFiles();
  },
  //
  // utils
  //
  formatBytes: WebRTCDataChannelManager.formatBytes,
  //
  // view model slice keys && view model listeners
  //
  // sending slice keys inside sending view model
  get fileSendingSliceContainerKey() {
    return WebRTCDataChannelManager.fileSendingSliceContainerKey;
  },
  get fileSendingMetaDataSliceKey() {
    return WebRTCDataChannelManager.fileSendingMetaDataSliceKey;
  },
  get fileSendingMinProgressSliceKey() {
    return WebRTCDataChannelManager.fileSendingMinProgressSliceKey;
  },
  // receiving slice keys inside receiving view model
  get fileReceivingSliceContainerKey() {
    return WebRTCDataChannelManager.fileReceivingSliceContainerKey;
  },
  get fileReceivingMetaDataSliceKey() {
    return WebRTCDataChannelManager.fileReceivingMetaDataSliceKey;
  },
  get fileReceivingFileExporterSliceKey() {
    return WebRTCDataChannelManager.fileReceivingFileExporterSliceKey;
  },
  get fileReceivingProgressSliceKey() {
    return WebRTCDataChannelManager.fileReceivingProgressSliceKey;
  },
  // sending view model changing listener
  onFileSendingRelatedDataChanged: function (handler) {
    WebRTCDataChannelManager.onFileSendingRelatedDataChanged(handler);
  },
  // receiving view model changing listener
  onFileReceivingRelatedDataChanged: function (handler) {
    WebRTCDataChannelManager.onFileReceivingRelatedDataChanged(handler);
  },

  /**
   * Media Calling
   */

  callingInputTypeEnum: WebRTCMediaCallingManager.callingInputTypeEnum,
  createCallingConstraints(withCallingInputTypeOfAudio, withCallingInputTypeOfVideo) {
    return WebRTCMediaCallingManager.createCallingConstraints(
      withCallingInputTypeOfAudio,
      withCallingInputTypeOfVideo
    );
  },
  applyCallingConstraints(callingConstraints) {
    WebRTCMediaCallingManager.applyCallingConstraints(callingConstraints);
  },
  startCalling() {
    WebRTCMediaCallingManager.startCalling(WebRTCPeerConnectionManager.peerConnectionMap);
  },
  hangUpCalling() {
    WebRTCMediaCallingManager.hangUpCalling(false);
  },

  // media tracks enabling during media calling
  get localMicEnabled() {
    return WebRTCMediaCallingManager.localMicEnabled;
  },
  set localMicEnabled(enabled) {
    WebRTCMediaCallingManager.localMicEnabled = enabled;
  },
  get localCameraEnabled() {
    return WebRTCMediaCallingManager.localCameraEnabled;
  },
  set localCameraEnabled(enabled) {
    WebRTCMediaCallingManager.localCameraEnabled = enabled;
  },
  // media tracks' transceiver controlling during media calling
  get localMicMuted() {
    return WebRTCMediaCallingManager.localMicMuted;
  },
  set localMicMuted(muted) {
    WebRTCMediaCallingManager.localMicMuted = muted;
  },
  get localCameraMuted() {
    return WebRTCMediaCallingManager.localCameraMuted;
  },
  set localCameraMuted(muted) {
    WebRTCMediaCallingManager.localCameraMuted = muted;
  },
  // listeners
  onWebRTCCallingStateChanged: function (handler) {
    WebRTCMediaCallingManager.onWebRTCCallingStateChanged(handler);
  },
  onLocalMediaStreamChanged: function (handler) {
    WebRTCMediaCallingManager.onLocalMediaStreamChanged(handler);
  },
  onPeerMediaStreamMapChanged: function (handler) {
    WebRTCMediaCallingManager.onPeerMediaStreamMapChanged(handler);
  },
  onLocalAudioEnableAvaliableChanged: function (handler) {
    WebRTCMediaCallingManager.onLocalAudioEnableAvaliableChanged(handler);
  },
  onLocalVideoEnableAvaliableChanged: function (handler) {
    WebRTCMediaCallingManager.onLocalVideoEnableAvaliableChanged(handler);
  },
  onLocalAudioMuteAvaliableChanged: function (handler) {
    WebRTCMediaCallingManager.onLocalAudioMuteAvaliableChanged(handler);
  },
  onLocalVideoMuteAvaliableChanged: function (handler) {
    WebRTCMediaCallingManager.onLocalVideoMuteAvaliableChanged(handler);
  },
};
