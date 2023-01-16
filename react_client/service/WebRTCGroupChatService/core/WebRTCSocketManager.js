import WebRTCReconnectingAliveSocket from "./WebRTCReconnectingAliveSocket.js";

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
const _eventListenerMap = new Map();

function _createSocket(socketUrl, openCallback, closeCallback) {
  let socket = _socketMap.get(socketUrl);
  if (!socket) {
    socket = new WebRTCReconnectingAliveSocket(socketUrl);

    const openEventListener = function (event) {
      console.debug(`SocketService: websocket connected`);
      // external usage
      if (openCallback) {
        openCallback(event);
      }
    };
    const errorEventListener = function (event) {
      console.debug(`SocketService: client side heared websocket onerror event`, event);
    };
    const closeEventListener = function (event) {
      console.debug(
        `SocketService: client side heared websocket onclose event (code: ${event.code}; reason: ${event.reason})`
      );
      // external usage
      if (closeCallback) {
        closeCallback(event);
      }
    };
    const removeEventListener = function (event) {
      _removeSocketListeners(socketUrl);
    };

    socket.addEventListener("open", openEventListener);
    socket.addEventListener("error", errorEventListener);
    socket.addEventListener("close", closeEventListener);
    socket.addEventListener("remove", removeEventListener, {
      once: true,
    });

    _eventListenerMap.set(socketUrl, {
      open: openEventListener,
      error: errorEventListener,
      close: closeEventListener,
    });

    _socketMap.set(socketUrl, socket);
  }
}

function _removeSocketListeners(socketUrl) {
  if (!_eventListenerMap.has(socketUrl)) {
    return;
  }
  if (!_socketMap.has(socketUrl)) {
    return;
  }

  const eventListenerContainer = _eventListenerMap.get(socketUrl);
  const socket = _socketMap.get(socketUrl);

  const openEventListener = eventListenerContainer.open;
  const errorEventListener = eventListenerContainer.error;
  const closeEventListener = eventListenerContainer.close;
  const messageEventListeners = eventListenerContainer.message;

  if (openEventListener) {
    socket.removeEventListener("open", openEventListener);
  }

  if (errorEventListener) {
    socket.removeEventListener("error", errorEventListener);
  }

  if (closeEventListener) {
    socket.removeEventListener("close", closeEventListener);
  }

  if (messageEventListeners instanceof Array && messageEventListeners.length > 0) {
    messageEventListeners.forEach((messageEventListener) => {
      socket.removeEventListener("message", messageEventListener);
    });
  }

  _socketMap.delete(socketUrl);
  _eventListenerMap.delete(socketUrl);

  console.debug(`SocketService: websocket listeners removed`);
}

function _destroySocket(socketUrl) {
  const socket = _socketMap.get(socketUrl);
  if (!socket) {
    return;
  }
  socket.close();
}

function _registerMessageEvent(socketUrl, regisType, regisCallback) {
  const socket = _socketMap.get(socketUrl);
  if (!socket) {
    return;
  }

  const messageEventListener = function (event) {
    const parsedData = JSON.parse(event.data);
    const type = parsedData.type;
    const payload = parsedData.payload;
    if (regisType !== type) {
      return;
    }
    regisCallback(payload);
  };
  socket.addEventListener("message", messageEventListener);

  if (!_eventListenerMap.has(socketUrl)) {
    _eventListenerMap.set(socketUrl, { message: [] });
  }
  if (!_eventListenerMap.get(socketUrl).message) {
    const eventListenerContainer = _eventListenerMap.get(socketUrl);
    eventListenerContainer.message = [];
    _eventListenerMap.set(socketUrl, eventListenerContainer);
  }

  const eventListenerContainer = _eventListenerMap.get(socketUrl);
  eventListenerContainer.message.push(messageEventListener);
  _eventListenerMap.set(socketUrl, eventListenerContainer);
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
