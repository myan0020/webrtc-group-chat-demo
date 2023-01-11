function _ReconnectingWebSocket(url) {
  // Private state variables
  let ws;

  let forcedClose = false;
  let timedOut = false;
  const eventTarget = document.createElement("div");
  const thisReconnectingWebSocket = this;

  this.url = url;

  this.reconnectAttempts = 0;

  this.maxReconnectAttempts = null;

  this.readyState = WebSocket.CONNECTING;

  // The number of attempted reconnects since starting, or the last successful connection
  this.reconnectAttempts = 0;

  // The number of milliseconds to delay before attempting to reconnect
  this.reconnectInterval = 1000;

  // The maximum number of milliseconds to delay a reconnection attempt
  this.maxReconnectInterval = 30 * 1000;

  // The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist
  this.reconnectDecay = 1.5;

  // The maximum time in milliseconds to wait for a connection to succeed before closing and retrying
  // this.openningTimeoutInterval = 2000;

  // Wire up "on*" properties as event handlers
  eventTarget.addEventListener("open", (event) => {
    thisReconnectingWebSocket.onopen(event);
  });
  eventTarget.addEventListener("close", (event) => {
    thisReconnectingWebSocket.onclose(event);
  });
  eventTarget.addEventListener("connecting", (event) => {
    thisReconnectingWebSocket.onconnecting(event);
  });
  eventTarget.addEventListener("message", (event) => {
    thisReconnectingWebSocket.onmessage(event);
  });
  eventTarget.addEventListener("error", (event) => {
    thisReconnectingWebSocket.onerror(event);
  });

  // Expose the API required by EventTarget
  this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
  this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
  this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);

  function generateEvent(eventName) {
    const event = new CustomEvent(eventName);
    return event;
  }

  this.open = function (isReconnectAttempt) {
    ws = new WebSocket(this.url);

    if (isReconnectAttempt) {
      if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
        return;
      }
    } else {
      eventTarget.dispatchEvent(generateEvent("connecting"));
      this.reconnectAttempts = 0;
    }

    console.debug("ReconnectingWebSocket", "attempt-connect", this.url);

    // const localWs = ws;
    // const openningTimeout = setTimeout(function () {
    //   console.debug("ReconnectingWebSocket", "connection-timeout", this.url);

    //   timedOut = true;
    //   localWs.close();
    //   timedOut = false;
    // }, this.openningTimeoutInterval);

    ws.onopen = (event) => {
      // clearTimeout(openningTimeout);

      console.debug("ReconnectingWebSocket", "onopen", thisReconnectingWebSocket.url);

      thisReconnectingWebSocket.readyState = WebSocket.OPEN;
      thisReconnectingWebSocket.reconnectAttempts = 0;

      const customEvent = generateEvent("open");
      customEvent.isReconnect = isReconnectAttempt;
      isReconnectAttempt = false;
      eventTarget.dispatchEvent(customEvent);
    };

    ws.onclose = (event) => {
      // clearTimeout(openningTimeout);

      ws = null;

      if (forcedClose) {
        thisReconnectingWebSocket.readyState = WebSocket.CLOSED;

        const customEvent = generateEvent("close");
        customEvent.code = event.code;
        customEvent.reason = event.reason;
        customEvent.wasClean = event.wasClean;
        eventTarget.dispatchEvent(customEvent);
      } else {
        thisReconnectingWebSocket.readyState = WebSocket.CONNECTING;

        const customEvent = generateEvent("connecting");
        customEvent.code = event.code;
        customEvent.reason = event.reason;
        customEvent.wasClean = event.wasClean;
        eventTarget.dispatchEvent(customEvent);

        if (!isReconnectAttempt && !timedOut) {
          console.debug("ReconnectingWebSocket", "onclose", thisReconnectingWebSocket.url);

          const customEvent = generateEvent("close");
          customEvent.code = event.code;
          customEvent.reason = event.reason;
          customEvent.wasClean = event.wasClean;
          eventTarget.dispatchEvent(customEvent);
        }

        const timeInterval =
        thisReconnectingWebSocket.reconnectInterval * Math.pow(thisReconnectingWebSocket.reconnectDecay, thisReconnectingWebSocket.reconnectAttempts);
        setTimeout(
          function () {
            thisReconnectingWebSocket.reconnectAttempts++;
            thisReconnectingWebSocket.open(true);
          },
          timeInterval > thisReconnectingWebSocket.maxReconnectInterval ? thisReconnectingWebSocket.maxReconnectInterval : timeInterval
        );
      }
    };

    ws.onmessage = (event) => {
      console.debug("ReconnectingWebSocket", "onmessage", thisReconnectingWebSocket.url, event.data);

      const customEvent = generateEvent("message");
      customEvent.data = event.data;
      eventTarget.dispatchEvent(customEvent);
    };

    ws.onerror = (event) => {
      console.debug("ReconnectingWebSocket", "onerror", thisReconnectingWebSocket.url, event);

      const customEvent = generateEvent("error");
      eventTarget.dispatchEvent(customEvent);
    };
  };

  this.open(false);

  this.send = function (data) {
    if (ws) {
      return ws.send(data);
    } else {
      throw "INVALID_STATE_ERR : Pausing to reconnect websocket";
    }
  };

  this.close = function (code, reason) {
    // Default CLOSE_NORMAL code
    if (typeof code == "undefined") {
      code = 1000;
    }
    forcedClose = true;
    if (ws) {
      ws.close(code, reason);
    }
  };

  /**
   * Additional public API method to refresh the connection if still open (close, re-open).
   * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
   */
  this.refresh = function () {
    if (ws) {
      ws.close();
    }
  };
}

/**
 * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
 * this indicates that the connection is ready to send and receive data.
 */
_ReconnectingWebSocket.prototype.onopen = function (event) {};
/** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
_ReconnectingWebSocket.prototype.onclose = function (event) {};
/** An event listener to be called when a connection begins being attempted. */
_ReconnectingWebSocket.prototype.onconnecting = function (event) {};
/** An event listener to be called when a message is received from the server. */
_ReconnectingWebSocket.prototype.onmessage = function (event) {};
/** An event listener to be called when an error occurs. */
_ReconnectingWebSocket.prototype.onerror = function (event) {};

_ReconnectingWebSocket.CONNECTING = WebSocket.CONNECTING;
_ReconnectingWebSocket.OPEN = WebSocket.OPEN;
_ReconnectingWebSocket.CLOSING = WebSocket.CLOSING;
_ReconnectingWebSocket.CLOSED = WebSocket.CLOSED;

// This signal message type list match the same one on server side
const _typeEnum = {
  // Session singals
  // LOG_IN_SUCCESS: 1,
  // LOG_OUT_SUCCESS: 2,
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
    socket = new _ReconnectingWebSocket(_socketUrl);

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
