/**
 *
 * This service provides a number of group chat features
 * including chat messaging, media calling and file transceiving
 * using WebRTC mesh architecture.
 *
 */

import WebRTCSignalingManager from "./core/WebRTCSignalingManager.js";
import WebRTCPeerConnectionManager from "./core/WebRTCPeerConnectionManager.js";
import WebRTCDataChannelManager from "./core/WebRTCDataChannelManager.js";
import WebRTCMediaCallingManager from "./core/WebRTCMediaCallingManager.js";

const _webSocketHost = location.hostname;
const _webSocketPort = "3002"; // websocket port number should same as mock express server port number
const _webSocketUrl = `ws://${_webSocketHost}:${_webSocketPort}`;

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
    WebRTCDataChannelManager.clearAllReceivingFiles();
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
  resetAllFileBuffersReceived() {
    WebRTCDataChannelManager.resetAllFileBuffersReceived();
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
