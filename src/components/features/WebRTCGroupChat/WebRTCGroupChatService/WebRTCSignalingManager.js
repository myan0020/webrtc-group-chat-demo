import axios from "axios";
import WebRTCSocketService from "./WebRTCSocketService.js";

let _selfId;
let _webSocketUrl;

const _httpSignalTypeEnum = {
  // Session singals
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,
};

let _handleWebSocketOpened;
let _handleWebSocketClosed;

let _handleLoginSuccess;
let _handleLogoutSuccess;

let _handleJoinRoomSuccess;
let _handleRoomsUpdated;
let _handleLeaveRoomSuccess;

let _handleNewPeerArivalExternally;
let _handleNewPeerLeaved;
let _handleNewPassthroughArival;
let _handleNewPeerArivalInternally;

function _handleSocketOpen(event) {
  console.log("WebRTCGroupChatController: websocket connected");
  // external usage
  if (_handleWebSocketOpened) {
    _handleWebSocketOpened(event);
  }
}

function _handleSocketClose(event) {
  console.log("WebRTCGroupChatController: client side heared websocket onclose event");
  // external usage
  if (_handleWebSocketClosed) {
    _handleWebSocketClosed(event);
  }
}

function _handleSocketUpdateRooms(payload) {
  console.log("WebRTCGroupChatController: UPDATE_ROOMS signal received");

  // external usage
  if (_handleRoomsUpdated) {
    _handleRoomsUpdated(payload);
  }
}

function _handleSocketJoinRoomSuccess(payload) {
  console.log("WebRTCGroupChatController: JOIN_ROOM_SUCCESS signal received");
  // external usage
  if (_handleJoinRoomSuccess) {
    _handleJoinRoomSuccess(payload);
  }
}

function _handleSocketLeaveRoomSuccess(payload) {
  console.log("WebRTCGroupChatController: LEAVE_ROOM_SUCCESS signal received");
  // external usage
  if (_handleLeaveRoomSuccess) {
    _handleLeaveRoomSuccess(payload);
  }
}

function _handleSocketNewWebRTCPeerArival(payload) {
  console.log("WebRTCGroupChatController: WEBRTC_NEW_PEER signal received");
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
  console.log("WebRTCGroupChatController: WEBRTC_NEW_PASSTHROUGH signal received");
  // internal usage
  if (_handleNewPassthroughArival) {
    _handleNewPassthroughArival(payload);
  }
}

function _handleSocketNewWebRTCPeerLeave(payload) {
  console.log("WebRTCGroupChatController: WEBRTC_NEW_PEER_LEAVE signal received");
  // internal usage
  if (_handleNewPeerLeaved) {
    _handleNewPeerLeaved(payload);
  }
}

function _loginSignaling(username) {
  const passChecking = _checkUserName(username);
  const config = {
    url: "/login",
    method: "POST",
    data: {
      username: passChecking ? username : "unknownUserName",
    },
  };
  axios(config)
    .then((response) => {
      const type = response.data.type;
      const payload = response.data.payload;
      const userId = payload.userId;
      const passChecking = _checkUserId(userId);
      if (!passChecking) return;
      _selfId = userId;
      if (type === _httpSignalTypeEnum.LOG_IN_SUCCESS) {
        WebRTCSocketService.createSocket(_webSocketUrl, _handleSocketOpen, _handleSocketClose);
        WebRTCSocketService.registerMessageEvent(
          _webSocketUrl,
          WebRTCSocketService.typeEnum.UPDATE_ROOMS,
          _handleSocketUpdateRooms
        );
        WebRTCSocketService.registerMessageEvent(
          _webSocketUrl,
          WebRTCSocketService.typeEnum.JOIN_ROOM_SUCCESS,
          _handleSocketJoinRoomSuccess
        );
        WebRTCSocketService.registerMessageEvent(
          _webSocketUrl,
          WebRTCSocketService.typeEnum.LEAVE_ROOM_SUCCESS,
          _handleSocketLeaveRoomSuccess
        );
        WebRTCSocketService.registerMessageEvent(
          _webSocketUrl,
          WebRTCSocketService.typeEnum.WEBRTC_NEW_PEER_ARIVAL,
          _handleSocketNewWebRTCPeerArival
        );
        WebRTCSocketService.registerMessageEvent(
          _webSocketUrl,
          WebRTCSocketService.typeEnum.WEBRTC_NEW_PASSTHROUGH,
          _handleSocketNewWebRTCPassthroughArival
        );
        WebRTCSocketService.registerMessageEvent(
          _webSocketUrl,
          WebRTCSocketService.typeEnum.WEBRTC_NEW_PEER_LEAVE,
          _handleSocketNewWebRTCPeerLeave
        );
        // the first time rooms info updating should be transfored through axios
        // rather than websocket, because websocket hasn't been opened right now
        if (_handleLoginSuccess) {
          _handleLoginSuccess(payload);
        }
        if (_handleRoomsUpdated) {
          _handleRoomsUpdated(payload);
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function _logoutSignaling() {
  _leaveRoomSignaling();

  const config = {
    url: "/logout",
    method: "POST",
  };
  axios(config)
    .then((response) => {
      const type = response.data.type;
      if (type === _httpSignalTypeEnum.LOG_OUT_SUCCESS) {
        console.log("WebRTCGroupChatController: LOG_OUT_SUCCESS signal received");

        if (_handleLogoutSuccess) {
          _handleLogoutSuccess();
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

/**
 * Chat room
 */

function _createNewRoomSignaling(roomName) {
  if (roomName.length > 0) {
    WebRTCSocketService.emitMessageEvent(_webSocketUrl, WebRTCSocketService.typeEnum.CREATE_ROOM, {
      roomName: roomName,
    });
  }
}

function _joinRoomSignaling(roomId) {
  if (roomId.length > 0) {
    WebRTCSocketService.emitMessageEvent(_webSocketUrl, WebRTCSocketService.typeEnum.JOIN_ROOM, {
      roomId: roomId,
    });
  }
}

function _leaveRoomSignaling() {
  WebRTCSocketService.emitMessageEvent(_webSocketUrl, WebRTCSocketService.typeEnum.LEAVE_ROOM, {});
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
  selfId: _selfId,

  /**
   * @param {String} url
   */
  set webSocketUrl(url) {
    _webSocketUrl = url;
  },

  loginSignaling: _loginSignaling,
  logoutSignaling: _logoutSignaling,
  createNewRoomSignaling: _createNewRoomSignaling,
  joinRoomSignaling: _joinRoomSignaling,
  leaveRoomSignaling: _leaveRoomSignaling,

  onWebSocketOpen: function (handler) {
    _handleWebSocketOpened = handler;
  },
  onWebSocketClose: function (handler) {
    _handleWebSocketClosed = handler;
  },

  onLoginInSuccess: function (handler) {
    _handleLoginSuccess = handler;
  },
  onLogoutInSuccess: function (handler) {
    _handleLogoutSuccess = handler;
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
