import WebRTCReconnectingSocket from "./WebRTCReconnectingSocket.js";

// This signal message type list match the same one on server side
const _typeEnum = {
  // Chat room singals
  CREATE_ROOM: 3,
  UPDATE_ROOMS: 4,
  JOIN_ROOM: 5,
  JOIN_ROOM_SUCCESS: 6,
  LEAVE_ROOM: 7,
  LEAVE_ROOM_SUCCESS: 8,
  
  // WebRTC connection singals
  WEBRTC_NEW_PEER_ARIVAL: 9,
  WEBRTC_NEW_PEER_LEAVE: 10,
  WEBRTC_NEW_PASSTHROUGH: 11,
};

const _socketMap = new Map();

function _createSocket(_socketUrl, openCallback, closeCallback) {
  let socket = _socketMap.get(_socketUrl);
  if (!socket) {
    socket = new WebRTCReconnectingSocket(_socketUrl);

    socket.addEventListener("open", function (event) {
      console.debug("SocketService: websocket connected");
      // external usage
      if (openCallback) {
        openCallback(event);
      }
    });

    socket.addEventListener("error", function (event) {
      console.debug("SocketService: client side heared websocket onerror event", event);
    });

    socket.addEventListener("close", function (event) {
      console.debug(
        `SocketService: client side heared websocket onclose event (code: ${event.code}; reason: ${event.reason})`
      );
      // external usage
      if (closeCallback) {
        closeCallback(event);
      }
    });

    _socketMap.set(_socketUrl, socket);
  }
}

function _destroySocket(_socketUrl) {
  const socket = _socketMap.get(_socketUrl);
  if (!socket) {
    return;
  }
  socket.close();
  _socketMap.delete(_socketUrl);
}

function _registerMessageEvent(socketUrl, regisType, regisCallback) {
  const socket = _socketMap.get(socketUrl);
  if (!socket) {
    return;
  }
  socket.addEventListener("message", function (event) {
    const parsedData = JSON.parse(event.data);
    const type = parsedData.type;
    const payload = parsedData.payload;
    if (regisType !== type) {
      return;
    }
    regisCallback(payload);
  });
}

function _emitMessageEvent(socketUrl, emitType, emitPayload) {
  const socket = _socketMap.get(socketUrl);
  if (!socket) {
    return;
  }
  const data = {
    type: emitType,
    payload: emitPayload,
  };
  socket.send(JSON.stringify(data));
}

export default {
  createSocket(socketUrl, openCallback, closeCallback) {
    _createSocket(socketUrl, openCallback, closeCallback);
  },

  destroySocket(socketUrl) {
    _destroySocket(socketUrl);
  },

  registerMessageEvent(socketUrl, regisType, regisCallback) {
    _registerMessageEvent(socketUrl, regisType, regisCallback);
  },

  emitMessageEvent(socketUrl, emitType, emitPayload) {
    _emitMessageEvent(socketUrl, emitType, emitPayload);
  },

  typeEnum: _typeEnum,
};
