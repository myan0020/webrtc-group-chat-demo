import WebRTCSocketManager from "./WebRTCSocketManager.js";

// This signal message type list match the same one on server side
const _typeEnum = {
  // HTTP //
  //
  // auth
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,

  // WebSocket //
  //
  // heartbeat
  PING: 3,
  PONG: 4,
  //
  // chat room
  GET_ROOMS: 5,
  CREATE_ROOM: 6,
  UPDATE_ROOMS: 7,
  JOIN_ROOM: 8,
  JOIN_ROOM_SUCCESS: 9,
  LEAVE_ROOM: 10,
  LEAVE_ROOM_SUCCESS: 11,
  //
  // WebRTC connection
  WEBRTC_NEW_PEER_ARIVAL: 12,
  WEBRTC_NEW_PEER_LEAVE: 13,
  WEBRTC_NEW_PASSTHROUGH: 14,
};

let _webSocketUrl;

let _handleWebSocketOpened;
let _handleWebSocketClosed;

let _handleJoinRoomSuccess;
let _handleRoomsUpdated;
let _handleLeaveRoomSuccess;

let _handleNewPeerArivalExternally;
let _handleNewPeerLeaved;
let _handleNewPassthroughArival;
let _handleNewPeerArivalInternally;

function _handleSocketOpen(event) {
  console.debug("WebRTCGroupChatController: websocket connected");
  // external usage
  if (_handleWebSocketOpened) {
    _handleWebSocketOpened(event);
  }
}

function _handleSocketClose(event) {
  console.debug("WebRTCGroupChatController: client side heared websocket onclose event");
  // external usage
  if (_handleWebSocketClosed) {
    _handleWebSocketClosed(event);
  }
}

function _handleSocketPing() {
  console.debug("WebRTCGroupChatController: PING signal received, will respond with PONG signal");

  WebRTCSocketManager.emitMessageEvent(_webSocketUrl, _typeEnum.PONG);
}

function _handleSocketUpdateRooms(payload) {
  console.debug("WebRTCGroupChatController: UPDATE_ROOMS signal received");

  // external usage
  if (_handleRoomsUpdated) {
    _handleRoomsUpdated(payload);
  }
}

function _handleSocketJoinRoomSuccess(payload) {
  console.debug("WebRTCGroupChatController: JOIN_ROOM_SUCCESS signal received");
  // external usage
  if (_handleJoinRoomSuccess) {
    _handleJoinRoomSuccess(payload);
  }
}

function _handleSocketLeaveRoomSuccess(payload) {
  console.debug("WebRTCGroupChatController: LEAVE_ROOM_SUCCESS signal received");
  // external usage
  if (_handleLeaveRoomSuccess) {
    _handleLeaveRoomSuccess(payload);
  }
}

function _handleSocketNewWebRTCPeerArival(payload) {
  console.debug("WebRTCGroupChatController: WEBRTC_NEW_PEER signal received");
  // internal usage
  if (_handleNewPeerArivalInternally) {
    _handleNewPeerArivalInternally(payload);
  }
  // external usage
  if (_handleNewPeerArivalExternally) {
    _handleNewPeerArivalExternally(payload);
  }
}

function _handleSocketNewWebRTCPassthroughArival(payload) {
  console.debug("WebRTCGroupChatController: WEBRTC_NEW_PASSTHROUGH signal received");
  // internal usage
  if (_handleNewPassthroughArival) {
    _handleNewPassthroughArival(payload);
  }
}

function _handleSocketNewWebRTCPeerLeave(payload) {
  console.debug("WebRTCGroupChatController: WEBRTC_NEW_PEER_LEAVE signal received");
  // internal usage
  if (_handleNewPeerLeaved) {
    _handleNewPeerLeaved(payload);
  }
}

function _connect() {
  if (typeof _webSocketUrl !== "string" || _webSocketUrl.length === 0) {
    console.debug(
      `WebRTCSignalingManager: connecting failed because of WebSocket url`,
      _webSocketUrl
    );
    return;
  }

  WebRTCSocketManager.createSocket(_webSocketUrl, _handleSocketOpen, _handleSocketClose);
  WebRTCSocketManager.registerMessageEvent(
    _webSocketUrl,
    _typeEnum.PING,
    _handleSocketPing
  );
  WebRTCSocketManager.registerMessageEvent(
    _webSocketUrl,
    _typeEnum.UPDATE_ROOMS,
    _handleSocketUpdateRooms
  );
  WebRTCSocketManager.registerMessageEvent(
    _webSocketUrl,
    _typeEnum.JOIN_ROOM_SUCCESS,
    _handleSocketJoinRoomSuccess
  );
  WebRTCSocketManager.registerMessageEvent(
    _webSocketUrl,
    _typeEnum.LEAVE_ROOM_SUCCESS,
    _handleSocketLeaveRoomSuccess
  );
  WebRTCSocketManager.registerMessageEvent(
    _webSocketUrl,
    _typeEnum.WEBRTC_NEW_PEER_ARIVAL,
    _handleSocketNewWebRTCPeerArival
  );
  WebRTCSocketManager.registerMessageEvent(
    _webSocketUrl,
    _typeEnum.WEBRTC_NEW_PASSTHROUGH,
    _handleSocketNewWebRTCPassthroughArival
  );
  WebRTCSocketManager.registerMessageEvent(
    _webSocketUrl,
    _typeEnum.WEBRTC_NEW_PEER_LEAVE,
    _handleSocketNewWebRTCPeerLeave
  );
}

function _disconnect() {
  WebRTCSocketManager.destroySocket(_webSocketUrl);
}

/**
 * Chat room
 */

function _createNewRoomSignaling(roomName) {
  if (roomName.length > 0) {
    WebRTCSocketManager.emitMessageEvent(_webSocketUrl, _typeEnum.CREATE_ROOM, {
      roomName: roomName,
    });
  }
}

function _joinRoomSignaling(roomId) {
  if (roomId.length > 0) {
    WebRTCSocketManager.emitMessageEvent(_webSocketUrl, _typeEnum.JOIN_ROOM, {
      roomId: roomId,
    });
  }
}

function _leaveRoomSignaling() {
  WebRTCSocketManager.emitMessageEvent(_webSocketUrl, _typeEnum.LEAVE_ROOM, {});
}

/**
 * WebRTC peer connection
 */

function _passThroughSignaling(payload) {
  WebRTCSocketManager.emitMessageEvent(
    _webSocketUrl,
    _typeEnum.WEBRTC_NEW_PASSTHROUGH,
    payload
  );
}

/**
 * Utils
 */

function _checkUserName(username) {
  if (typeof username !== "string") {
    return false;
  }
  if (username.length === 0) {
    return false;
  }
  return true;
}

function _checkSocketUrl(url) {
  // use regular expression to check it literally
  return true;
}

function _checkUserId(id) {
  // use regular expression to check it literally
  return true;
}

export default {
  /**
   * @param {String} url
   */
  set webSocketUrl(url) {
    _webSocketUrl = url;
  },

  connect: function () {
    _connect();
  },

  disconnect: function () {
    _disconnect();
  },

  createNewRoomSignaling: _createNewRoomSignaling,
  joinRoomSignaling: _joinRoomSignaling,
  leaveRoomSignaling: _leaveRoomSignaling,

  passThroughSignaling: _passThroughSignaling,

  onWebSocketOpen: function (handler) {
    _handleWebSocketOpened = handler;
  },
  onWebSocketClose: function (handler) {
    _handleWebSocketClosed = handler;
  },

  onJoinRoomInSuccess: function (handler) {
    _handleJoinRoomSuccess = handler;
  },
  onRoomsInfoUpdated: function (handler) {
    _handleRoomsUpdated = handler;
  },
  onLeaveRoomInSuccess: function (handler) {
    _handleLeaveRoomSuccess = handler;
  },

  onWebRTCNewPeerArivalExternally: function (handler) {
    _handleNewPeerArivalExternally = handler;
  },
  onWebRTCNewPeerLeaved: function (handler) {
    _handleNewPeerLeaved = handler;
  },
  onWebRTCNewPassthroughArival: function (handler) {
    _handleNewPassthroughArival = handler;
  },
  onWebRTCNewPeerArivalInternally: function (handler) {
    _handleNewPeerArivalInternally = handler;
  },
};
