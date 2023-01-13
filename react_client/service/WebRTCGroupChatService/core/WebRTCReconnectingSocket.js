function WebRTCReconnectingSocket(url) {
  // Private state variables
  let ws;
  let forcedClose = false;
  let timedOut = false;
  const eventTarget = document.createElement("div");
  const thisReconnectingSocket = this;

  this.url = url;

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

  this.resendInterval = 1000;

  this.resendDecay = 1.5;

  this.maxResendInterval = 5 * 1000;

  // Wire up "on*" properties as event handlers
  eventTarget.addEventListener("open", (event) => {
    thisReconnectingSocket.onopen(event);
  });
  eventTarget.addEventListener("close", (event) => {
    thisReconnectingSocket.onclose(event);
  });
  eventTarget.addEventListener("connecting", (event) => {
    thisReconnectingSocket.onconnecting(event);
  });
  eventTarget.addEventListener("message", (event) => {
    thisReconnectingSocket.onmessage(event);
  });
  eventTarget.addEventListener("error", (event) => {
    thisReconnectingSocket.onerror(event);
  });

  // Expose the API required by EventTarget
  this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
  this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
  this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);

  function generateEvent(eventName) {
    const event = new CustomEvent(eventName);
    return event;
  }

  function attemptToSend(data, resendAttempts) {
    console.debug(
      "ReconnectingWebSocket",
      "attempt-send",
      data,
      `resendAttempts(${resendAttempts})`
    );

    if (!ws || ws.readyState !== 1) {
      const timeInterval = Math.min(
        thisReconnectingSocket.resendInterval *
          Math.pow(thisReconnectingSocket.resendDecay, resendAttempts),
        thisReconnectingSocket.maxResendInterval
      );
      setTimeout(() => {
        attemptToSend(data, resendAttempts + 1);
      }, timeInterval);
      return;
    }

    ws.send(data);
    console.debug(
      "ReconnectingWebSocket",
      "attempt-send-success",
      data,
      ws,
      `resendAttempts(${resendAttempts})`
    );
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

    ws.onopen = (event) => {
      console.debug("ReconnectingWebSocket", "onopen", thisReconnectingSocket.url);

      thisReconnectingSocket.readyState = WebSocket.OPEN;
      thisReconnectingSocket.reconnectAttempts = 0;

      const customEvent = generateEvent("open");
      customEvent.isReconnect = isReconnectAttempt;
      isReconnectAttempt = false;
      eventTarget.dispatchEvent(customEvent);
    };

    ws.onclose = (event) => {
      ws = null;

      if (forcedClose) {
        thisReconnectingSocket.readyState = WebSocket.CLOSED;

        const customCloseEvent = generateEvent("close");
        customCloseEvent.code = event.code;
        customCloseEvent.reason = event.reason;
        customCloseEvent.wasClean = event.wasClean;
        eventTarget.dispatchEvent(customCloseEvent);

        const customRemoveEvent = generateEvent("remove");
        eventTarget.dispatchEvent(customRemoveEvent);
      } else {
        thisReconnectingSocket.readyState = WebSocket.CONNECTING;

        const customEvent = generateEvent("connecting");
        customEvent.code = event.code;
        customEvent.reason = event.reason;
        customEvent.wasClean = event.wasClean;
        eventTarget.dispatchEvent(customEvent);

        if (!isReconnectAttempt && !timedOut) {
          console.debug("ReconnectingWebSocket", "onclose", thisReconnectingSocket.url);

          const customEvent = generateEvent("close");
          customEvent.code = event.code;
          customEvent.reason = event.reason;
          customEvent.wasClean = event.wasClean;
          eventTarget.dispatchEvent(customEvent);
        }

        const timeInterval = Math.min(
          thisReconnectingSocket.reconnectInterval *
            Math.pow(
              thisReconnectingSocket.reconnectDecay,
              thisReconnectingSocket.reconnectAttempts
            ),
          thisReconnectingSocket.maxReconnectInterval
        );
        setTimeout(function () {
          thisReconnectingSocket.reconnectAttempts++;
          thisReconnectingSocket.open(true);
        }, timeInterval);
      }
    };

    ws.onmessage = (event) => {
      console.debug(
        "ReconnectingWebSocket",
        "onmessage",
        thisReconnectingSocket.url,
        event.data
      );

      const customEvent = generateEvent("message");
      customEvent.data = event.data;
      eventTarget.dispatchEvent(customEvent);
    };

    ws.onerror = (event) => {
      console.debug("ReconnectingWebSocket", "onerror", thisReconnectingSocket.url, event);

      const customEvent = generateEvent("error");
      eventTarget.dispatchEvent(customEvent);
    };
  };

  this.open(false);

  this.send = function (data) {
    attemptToSend(data, 0);
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
WebRTCReconnectingSocket.prototype.onopen = function (event) {};
/** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
WebRTCReconnectingSocket.prototype.onclose = function (event) {};
/** An event listener to be called when a connection begins being attempted. */
WebRTCReconnectingSocket.prototype.onconnecting = function (event) {};
/** An event listener to be called when a message is received from the server. */
WebRTCReconnectingSocket.prototype.onmessage = function (event) {};
/** An event listener to be called when an error occurs. */
WebRTCReconnectingSocket.prototype.onerror = function (event) {};

WebRTCReconnectingSocket.CONNECTING = WebSocket.CONNECTING;
WebRTCReconnectingSocket.OPEN = WebSocket.OPEN;
WebRTCReconnectingSocket.CLOSING = WebSocket.CLOSING;
WebRTCReconnectingSocket.CLOSED = WebSocket.CLOSED;

export default WebRTCReconnectingSocket;
