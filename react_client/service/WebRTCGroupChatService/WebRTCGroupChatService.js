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

let _webSocketUrl;
if (
  env.WEB_SOCKET_SERVER_PROTOCOL.length > 0 &&
  env.WEB_SOCKET_SERVER_HOSTNAME.length > 0 &&
  env.WEB_SOCKET_SERVER_PORT.length > 0
) {
  _webSocketUrl = `${env.WEB_SOCKET_SERVER_PROTOCOL}://${env.WEB_SOCKET_SERVER_HOSTNAME}:${env.WEB_SOCKET_SERVER_PORT}`;
} else {
  _webSocketUrl = `wss://${location.hostname}:${8888}`;
}

WebRTCPeerConnectionManager.webSocketUrl = _webSocketUrl;
WebRTCSignalingManager.webSocketUrl = _webSocketUrl;

WebRTCSignalingManager.onWebRTCNewPeerLeaved(WebRTCPeerConnectionManager.handleNewPeerLeave);
WebRTCSignalingManager.onWebRTCNewPassthroughArival(
  WebRTCPeerConnectionManager.handleNewPassthroughArival
);
WebRTCSignalingManager.onWebRTCNewPeerArivalInternally(
  WebRTCPeerConnectionManager.handleNewPeerArivalInternally
);

export default {
  /**
   * start
   *
   * note: please call 'start' when a user has already signed in
   */

  start: function () {
    WebRTCSignalingManager.connect();
  },

  /**
   * end
   *
   * note: please call 'end' when a user is going to sign out
   */

  // end: function () {
  //
  // TODO:
  //
  // Priority Level: Middle
  //
  // a error is found when logout, then re-login + join room + start calling,
  // react_devtools_backend.js:4026 WebRTCGroupChatController: Found an error with message of InvalidStateError: Failed to execute 'setRemoteDescription' on 'RTCPeerConnection': Failed to set remote answer sdp: Called in wrong state: stable during 'setRemoteDescription' or 'setLocalDescription'
  //

  // WebRTCMediaCallingManager.hangUpCalling(true);
  // WebRTCMediaCallingManager.clearAllPeerTransceivers();
  // WebRTCPeerConnectionManager.closeALLPeerConnections();
  // WebRTCDataChannelManager.clearAllReceivingFiles();
  // WebRTCSignalingManager.disconnect();
  // },

  /**
   * Login && Logout
   */

  // actions
  login: function (userName) {
    WebRTCSignalingManager.loginSignaling(userName);
  },
  logout: function () {
    //
    // TODO:
    //
    // Priority Level: Middle
    //
    // a error is found when logout, then re-login + join room + start calling,
    // react_devtools_backend.js:4026 WebRTCGroupChatController: Found an error with message of InvalidStateError: Failed to execute 'setRemoteDescription' on 'RTCPeerConnection': Failed to set remote answer sdp: Called in wrong state: stable during 'setRemoteDescription' or 'setLocalDescription'
    //

    WebRTCMediaCallingManager.hangUpCalling(true);
    WebRTCMediaCallingManager.clearAllPeerTransceivers();
    WebRTCPeerConnectionManager.closeALLPeerConnections();
    WebRTCDataChannelManager.clearAllReceivingFiles();
    WebRTCSignalingManager.logoutSignaling();
  },
  // listeners
  onLoginInSuccess: function (handler) {
    WebRTCSignalingManager.onLoginInSuccess(handler);
  },
  onLogoutInSuccess: function (handler) {
    WebRTCSignalingManager.onLogoutInSuccess(handler);
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
    WebRTCMediaCallingManager.hangUpCalling(true);
    WebRTCMediaCallingManager.clearAllPeerTransceivers();
    WebRTCPeerConnectionManager.closeALLPeerConnections();
    WebRTCDataChannelManager.cancelSenderAllFileSending();
    WebRTCDataChannelManager.clearAllFileBuffersReceived();
    WebRTCDataChannelManager.clearAllReceivingFiles();

    // TODO: need to clear sending&&receiving related data
    WebRTCDataChannelManager.clearSendingRelatedData();
    WebRTCDataChannelManager.clearReceivingRelatedData();

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
