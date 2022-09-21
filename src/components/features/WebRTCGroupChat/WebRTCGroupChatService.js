/**
 *
 * WebRTCGroupChatService collects all WebRTC connection establishment logic including authtication,
 * peer connections management, (local && remote) media streams management, signaling, and ICE candidates management.
 *
 * The module's exported properties are designed to build any custom UI aiming to realize the real-time group-chatting feature
 */

import axios from "axios";

/**
 * User id management
 */

let _selfId = "";
const _peerIds = {
  ids: [],
  push: function (id) {
    this.ids.push(id);
  },

  includes: function (id) {
    return this.ids.includes(id);
  },
  indexOf: function (id) {
    return this.ids.indexOf(id);
  },
  get length() {
    return this.ids.length;
  },
};

/**
 * Internal paramters checking
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

function _checkMediaStreamConstraints(constraints) {
  // use regular expression to check it literally
  return true;
}

function _checkPeerConnectionConfig(config) {
  // use regular expression to check it literally
  return true;
}

function _checkUserId(id) {
  // use regular expression to check it literally
  return true;
}

/**
 * Signaling
 */

// This signal message type list match the same one on server side
const _SignalMessageType = {
  // Session singals
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,
  // Chat room singals
  CREATE_ROOM: 3,
  UPDATE_ROOMS: 4,
  JOIN_ROOM: 5,
  JOIN_ROOM_SUCCESS: 6,
  LEAVE_ROOM: 7,
  LEAVE_ROOM_SUCCESS: 8,
  // WebRTC connection singals
  WEBRTC_NEW_CALLING: 9, // allowing to make calling
  WEBRTC_NEW_PEER: 10, // after new calling sent, new peer can be received
  WEBRTC_NEW_OFFER: 11,
  WEBRTC_NEW_ANSWER: 12,
  WEBRTC_NEW_ICE_CANDIDATE: 13,
  WEBRTC_HANG_UP: 14,
};

let _websocket;
const _webSocketHost = "localhost";
const _webSocketPort = "3002"; // websocket port number should same as mock express server port number

let _handleWebSocketOpened;
let _handleWebSocketClosed;

let _handleJoinRoomSuccessMessage;
let _handleLeaveRoomSuccessMessage;
let _handleRoomsUpdated;

let _handleCallingStateChanged;
let _handleNewPeerArivalMessage;

function _createSignal(url) {
  const passChecking = _checkSocketUrl(url);
  if (!passChecking) return;
  _websocket = new WebSocket(url);
  _websocket.addEventListener("open", function (event) {
    console.log("WebRTCGroupChatService: websocket connected");
    // external usage
    if (_handleWebSocketOpened) {
      _handleWebSocketOpened(event);
    }
  });
  _websocket.addEventListener("message", function (event) {
    const parsedMessage = JSON.parse(event.data);
    const type = parsedMessage.type;
    const payload = parsedMessage.payload;

    switch (type) {
      case _SignalMessageType.UPDATE_ROOMS: {
        console.log("WebRTCGroupChatService: UPDATE_ROOMS signal received");

        // external usage
        if (_handleRoomsUpdated) {
          _handleRoomsUpdated(payload);
        }
        break;
      }
      case _SignalMessageType.JOIN_ROOM_SUCCESS: {
        console.log(
          "WebRTCGroupChatService: JOIN_ROOM_SUCCESS signal received"
        );

        // external usage
        if (_handleJoinRoomSuccessMessage) {
          _handleJoinRoomSuccessMessage(payload);
        }
        break;
      }
      case _SignalMessageType.LEAVE_ROOM_SUCCESS: {
        console.log(
          "WebRTCGroupChatService: LEAVE_ROOM_SUCCESS signal received"
        );

        // external usage
        if (_handleLeaveRoomSuccessMessage) {
          _handleLeaveRoomSuccessMessage(payload);
        }
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_PEER: {
        console.log("WebRTCGroupChatService: WEBRTC_NEW_PEER signal received");

        // internal usage
        _initiateAndSendOffer(payload);
        // external usage
        if (_handleNewPeerArivalMessage) {
          _handleNewPeerArivalMessage(payload);
        }
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_OFFER: {
        console.log("WebRTCGroupChatService: WEBRTC_NEW_OFFER signal received");

        // internal usage
        _initiateAndSendAnswer(payload);
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_ANSWER: {
        console.log(
          "WebRTCGroupChatService: WEBRTC_NEW_ANSWER signal received"
        );

        // internal usage
        _setupNewPeerAnswer(payload);
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_ICE_CANDIDATE: {
        console.log(
          "WebRTCGroupChatService: WEBRTC_NEW_ICE_CANDIDATE signal received"
        );

        // internal usage
        _addNewICECandidate(payload);
        break;
      }
      case _SignalMessageType.WEBRTC_HANG_UP: {
        console.log("WebRTCGroupChatService: WEBRTC_HANG_UP signal received");

        // internal usage
        _hangUpReceivedFromPeer(payload);
        break;
      }
      default:
        break;
    }
  });
  _websocket.addEventListener("close", function (event) {
    console.log(
      "WebRTCGroupChatService: client side heared websocket onclose event"
    );

    _destroySignal();
    // external usage
    if (_handleWebSocketClosed) {
      _handleWebSocketClosed(event);
    }
  });
}

function _destroySignal() {
  if (_websocket) {
    console.log(
      "WebRTCGroupChatService: client side will close websocket connection"
    );
    _websocket.close();
    _websocket = null;
  }
}

/**
 * Authentication
 */

let _handleLoginSuccess;
let _handleLogoutSuccess;

function _login(username) {
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
      if (type === _SignalMessageType.LOG_IN_SUCCESS) {
        const webSocketUrl = `ws://${_webSocketHost}:${_webSocketPort}`;
        // try to open a websocket connection
        _createSignal(webSocketUrl);
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

function _logout() {
  _leaveRoom();

  const config = {
    url: "/logout",
    method: "POST",
  };
  axios(config)
    .then((response) => {
      const type = response.data.type;
      if (type === _SignalMessageType.LOG_OUT_SUCCESS) {
        console.log("WebRTCGroupChatService: LOG_OUT_SUCCESS signal received");

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
 * Media Streams management
 */

let _mediaStreamConstraints = {
  video: true,
  audio: true,
};
let _localMediaStream;
const _peerMediaStreamMap = new Map(); // [[ peerId, mediaStream ], ...]

let _handleLocalMediaStreamChanged;
let _handlePeerMediaStreamMapChanged;

async function _createLocalMediaStream() {
  console.log(`WebRTCGroupChatService: start to create local media stream`);
  return navigator.mediaDevices
    .getUserMedia(_mediaStreamConstraints)
    .then((mediaStream) => {
      console.log(`WebRTCGroupChatService: local media stream created`);
      _localMediaStream = mediaStream;
      if (_handleLocalMediaStreamChanged) {
        _handleLocalMediaStreamChanged(mediaStream);
      }
    });
}

function _addLocalMediaStreamToPeer(peerId, peerConnection) {
  if (_localMediaStream) {
    _localMediaStream.getTracks().forEach((track) => {
      console.log(
        `WebRTCGroupChatService: add track of local media stream to a peer connection to ${peerId}`
      );
      peerConnection.addTrack(track, _localMediaStream);
    });
  } else {
    console.log(
      `WebRTCGroupChatService: cannot add track of local media stream to a peer connection to ${peerId}`
    );
  }
}

function _addNewPeerMediaStreamReceivedFrom(peerId, event) {
  if (!peerId) {
    console.log(
      `WebRTCGroupChatService: unexpected peerId of ${peerId} during peer connection ontrack event`
    );
    return;
  }
  if (peerId.length > 0) {
    const prevPeerMediaStreamCount = _peerMediaStreamMap.size;
    _peerMediaStreamMap.set(peerId, event.streams[0]); // store this src
    console.log(
      `WebRTCGroupChatService: the remote media streams received, its first item has ${
        event.streams[0].getTracks().length
      } track(s)`
    );
    console.log(
      `WebRTCGroupChatService: _peerMediaStreamMap size changed from ${prevPeerMediaStreamCount} to ${_peerMediaStreamMap.size}`
    );
    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(_peerMediaStreamMap);
    }
  } else {
    console.log(
      `WebRTCGroupChatService: unexpected peerId of ${peerId} during peer connection ontrack event`
    );
  }
}

function _closePeerMediaStreamTo(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatService: unexpected peerId when stopping peer media stream`
    );
    return;
  }
  const prevPeerMediaStreamCount = _peerMediaStreamMap.size;
  _peerMediaStreamMap.delete(peerId);
  console.log(
    `WebRTCGroupChatService: deleted a peer media stream, and _peerMediaStreamMap size changed from ${prevPeerMediaStreamCount} to ${_peerMediaStreamMap.size}`
  );
  if (_handlePeerMediaStreamMapChanged) {
    _handlePeerMediaStreamMapChanged(_peerMediaStreamMap);
  }
}

function _clearLocalMediaStream() {
  if (_localMediaStream) {
    // stop the live mediaStream
    _localMediaStream.getTracks().forEach(function (track) {
      track.stop();
    });
    _localMediaStream = null;
    if (_handleLocalMediaStreamChanged) {
      _handleLocalMediaStreamChanged(_localMediaStream);
    }
  }
}

function _clearPeerMediaStreamMap() {
  if (_peerMediaStreamMap.size > 0) {
    const prevPeerMediaStreamCount = _peerMediaStreamMap.size;
    _peerMediaStreamMap.clear();
    console.log(
      `WebRTCGroupChatService: clear all peer media streams, and _peerMediaStreamMap size changed from ${prevPeerMediaStreamCount} to ${_peerMediaStreamMap.size}`
    );
    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(_peerMediaStreamMap);
    }
  }
}

function _clearAllMediaStreams() {
  _clearLocalMediaStream();
  _clearPeerMediaStreamMap();
}

/**
 * Peer connections management
 */

let _peerConnectionConfig = {
  iceServers: [
    { urls: ["stun:ntk-turn-2.xirsys.com"] },
    {
      username:
        "PpsOixjIvGfVGKvClS6m3_yc_yt-RPmOD-ONP9GbJX3XQMErjEBK2OWVEMRIOcuEAAAAAGMgcvttaW5nZG9uZ3NoZW5zZW4=",
      credential: "ec2e791a-335c-11ed-b98b-0242ac120004",
      urls: [
        "turn:ntk-turn-2.xirsys.com:80?transport=udp",
        "turn:ntk-turn-2.xirsys.com:3478?transport=udp",
        "turn:ntk-turn-2.xirsys.com:80?transport=tcp",
        "turn:ntk-turn-2.xirsys.com:3478?transport=tcp",
        "turns:ntk-turn-2.xirsys.com:443?transport=tcp",
        "turns:ntk-turn-2.xirsys.com:5349?transport=tcp",
      ],
    },
  ],
};
const _peerConnectionMap = {
  // data structure: [[ peerId, peerConnectionInstance ], ...]
  map: new Map(),
  has(key) {
    return this.map.has(key)
  },
  size() {
    return this.map.size;
  },
  set(key, value) {
    const prevSize = this.map.size;
    this.map.set(key, value);
    const curSize = this.map.size;
    console.log(`WebRTCGroupChatService: _peerConnectionMap set executed, and its size changed from ${prevSize} to ${curSize}`)
  },
  get(key) {
    return this.map.get(key);
  },
  getFirstKeyByValue: function (searchValue) {
    for (let [key, value] of this.map.entries()) {
      if (value === searchValue) return key;
    }
  },
  delete(key) {
    const prevSize = this.map.size;
    this.map.delete(key);
    const curSize = this.map.size;
    console.log(`WebRTCGroupChatService: _peerConnectionMap delete executed, and its size changed from ${prevSize} to ${curSize}`);
  },
  clear() {
    const prevSize = this.map.size;
    this.map.clear();
    const curSize = this.map.size;
    console.log(`WebRTCGroupChatService: _peerConnectionMap clear executed, and its size changed from ${prevSize} to ${curSize}`)
  },
  forEach(func) {
    this.map.forEach(func);
  },
};

function _clearALLPeerConnections() {
  _peerConnectionMap.forEach((peerConnection, peerId) => {
    if (peerConnection) {
      peerConnection.close();
      console.log(
        `WebRTCGroupChatService: the peerConnection with peerId of ${peerId} is closed`
      );
    }
  });
  _peerConnectionMap.clear();
  console.log(`WebRTCGroupChatService: all peerConnections cleared`);
}

function _requestToSchedulePeerConnection() {
  if (_websocket) {
    const data = {
      type: _SignalMessageType.WEBRTC_NEW_CALLING,
      payload: {},
    };
    _websocket.send(JSON.stringify(data));
  }
}

function _requestToUnschedulePeerConnection() {
  if (_websocket) {
    const data = {
      type: _SignalMessageType.WEBRTC_HANG_UP,
      payload: {},
    };
    _websocket.send(JSON.stringify(data));
  }
}

// add a peer connection
function _addPeerConnection(peerId) {
  console.log("WebRTCGroupChatService: add peer connection");
  // add another peer connection for use
  if (peerId.length === 0) {
    console.log(
      `WebRTCGroupChatService: unexpected peerId of ${peerId} when adding peer connection`
    );
    return;
  }
  const peerConnection = new RTCPeerConnection(_peerConnectionConfig);
  console.log(`WebRTCGroupChatService: a new 'RTCPeerConnection' is created`);
  _peerConnectionMap.set(peerId, peerConnection);
  // TODO: local_stream
  _addLocalMediaStreamToPeer(peerId, peerConnection);
  // generic handler that sends any ice candidate to the other peer
  peerConnection.onicecandidate = function (event) {
    if (event.candidate && _websocket) {
      _websocket.send(
        JSON.stringify({
          type: _SignalMessageType.WEBRTC_NEW_ICE_CANDIDATE,
          payload: {
            iceCandidate: event.candidate,
            userId: peerId,
          },
          // token: call_token,
        })
      );
      console.log(
        `WebRTCGroupChatService: send a new ICE candidate, from ${_selfId} to ${peerId}`
      );
    }
  };

  peerConnection.oniceconnectionstatechange = (event) => {
    console.log(
      `WebRTCGroupChatService: oniceconnectionstatechange with the state of '${peerConnection.iceConnectionState}'`
    );
  };

  // display remote video streams when they arrive using local <video> MediaElement
  peerConnection.ontrack = function (event) {
    const peerId = _peerConnectionMap.getFirstKeyByValue(peerConnection);
    _addNewPeerMediaStreamReceivedFrom(peerId, event);
  };
}

// locate a peer connection according to its id
function _locatePeerConnection(peerId) {
  if (peerId.length === 0) {
    console.log(
      `WebRTCGroupChatService: unexpected peerId of ${peerId} during 'locatePeerConnection' action`
    );
    return;
  }
  if (!_peerConnectionMap.has(peerId)) {
    const prevPeerIdsSize = _peerConnectionMap.size();
    _addPeerConnection(peerId);
    console.log(
      `WebRTCGroupChatService: peer connection count changed from ${prevPeerIdsSize} to ${_peerConnectionMap.size()}`
    );
  }
  return _peerConnectionMap.get(peerId);
}

function _onCreateOfferSuccess(offer, peerConnection, peerId, websocket) {
  if (offer && peerConnection && websocket && peerId) {
    peerConnection.setLocalDescription(offer).then(() => {
      const data = {
        type: _SignalMessageType.WEBRTC_NEW_OFFER,
        payload: {
          offer: offer,
          userId: peerId,
        },
      };
      websocket.send(JSON.stringify(data));
    });
  }
}

function _onCreateAnswerSuccess(answer, peerConnection, peerId, websocket) {
  if (peerId && answer && peerConnection && websocket) {
    peerConnection.setLocalDescription(answer).then(() => {
      const data = {
        type: _SignalMessageType.WEBRTC_NEW_ANSWER,
        payload: {
          answer: answer,
          userId: peerId,
        },
      };
      websocket.send(JSON.stringify(data));
    });
  }
}

// handle new peer
function _initiateAndSendOffer(payload) {
  const peerId = payload.userId;

  if (!peerId || peerId.length === 0) return;
  // locate peer connection
  const peerConnection = _locatePeerConnection(peerId);
  if (!peerConnection) {
    console.log(
      `WebRTCGroupChatService: cannot get peer connection with peerId of ${peerId}`
    );
    return;
  };
  // create offer
  peerConnection
    .createOffer()
    .then((offer) => {
      console.log(
        `WebRTCGroupChatService: a new offer created to peerId of ${peerId}`
      );
      _onCreateOfferSuccess(offer, peerConnection, peerId, _websocket);
    })
    .catch((error) => {
      console.error(`new peer error: ${error}`);
    });
}

// handle offer
function _initiateAndSendAnswer(payload) {
  const peerId = payload.from;
  const offer = payload.offer;

  if (!peerId || !offer || peerId.length === 0) return;
  const peerConnection = _locatePeerConnection(peerId);
  console.log("WebRTCGroupChatService: a new offer received from " + peerId);
  if (!peerConnection) return;
  // set remote description
  peerConnection
    .setRemoteDescription(offer)
    .then(() => {
      return peerConnection.createAnswer();
    })
    .then((answer) => {
      _onCreateAnswerSuccess(answer, peerConnection, peerId, _websocket);
    })
    .catch((error) => {
      console.error(`new offer error: ${error}`);
    });
}

// handle answer
function _setupNewPeerAnswer(payload) {
  const peerId = payload.from;
  const answer = payload.answer;

  if (!peerId || !answer || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatService: found errors with a new answer of ${answer}, from ${peerId},  with peerId length ${peerId.length} `
    );
    return;
  }
  const peerConnection = _locatePeerConnection(peerId);
  console.log("WebRTCGroupChatService: new answer from " + peerId);
  if (!peerConnection) {
    console.log(
      `WebRTCGroupChatService: cannot find a peer connection with peerId ${peerId}`
    );
    return;
  }
  peerConnection.setRemoteDescription(answer);
}

// handle ice candidate
function _addNewICECandidate(payload) {
  const peerId = payload.from;
  const iceCandidate = payload.iceCandidate;

  if (!peerId || !iceCandidate || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatService: found errors with a new iceCandidate of ${iceCandidate}, from ${peerId},  with peerId length ${peerId.length} `
    );
    return;
  }
  const peerConnection = _locatePeerConnection(peerId);
  console.log("WebRTCGroupChatService: get new_ice_candidate from " + peerId);
  if (!peerConnection) {
    console.log(
      `WebRTCGroupChatService: cannot find a peer connection with peerId ${peerId}`
    );
    return;
  }
  if (!iceCandidate.candidate) {
    console.log(
      `WebRTCGroupChatService: unexpected iceCandidate.candidate with ${iceCandidate.candidate}`
    );
    peerConnection.addIceCandidate(null);
    return;
  }
  console.log(`WebRTCGroupChatService: 'addIceCandidate' action done`);
  peerConnection.addIceCandidate(iceCandidate);
}

function _closePeerConnectionTo(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatService: unexpected peerId when stopping peer side connection`
    );
    return;
  }
  const peerConnection = _peerConnectionMap.get(peerId);
  if (!peerConnection) return;
  peerConnection.close();
  _peerConnectionMap.delete(peerId);
}

/**
 * Calling management
 */

let _isCalling = false;

function _changeCallingState(toCalling) {
  console.log(
    `WebRTCGroupChatService: change calling state to toCalling of ${toCalling}`
  );

  // change state to no calling
  if (!toCalling) {
    if (!_isCalling) return;

    _isCalling = false;
    if (_handleCallingStateChanged) {
      _handleCallingStateChanged(_isCalling);
    }
    return;
  }

  if (_isCalling) return;

  _isCalling = true;
  if (_handleCallingStateChanged) {
    _handleCallingStateChanged(_isCalling);
  }
}

function _startCalling() {
  _changeCallingState(true);
  _createLocalMediaStream().then(_requestToSchedulePeerConnection, (error) => {
    console.log(
      `WebRTCGroupChatService: met error of ${error} when creating local media stream`
    );
    _changeCallingState(false);
  });
}

function _hangUpCalling() {
  _changeCallingState(false);
  _clearAllMediaStreams();
  _clearALLPeerConnections();
  _requestToUnschedulePeerConnection();
}

function _hangUpReceivedFromPeer(payload) {
  const peerId = payload.from;
  _closePeerMediaStreamTo(peerId);
  _closePeerConnectionTo(peerId);
}

/**
 * Chat room management
 */

function _createNewRoom(roomName) {
  if (roomName.length > 0 && _websocket) {
    const message = {
      type: _SignalMessageType.CREATE_ROOM,
      payload: {
        roomName: roomName,
      },
    };
    _websocket.send(JSON.stringify(message));
  }
}

function _joinRoom(roomId) {
  if (roomId.length > 0 && _websocket) {
    const message = {
      type: _SignalMessageType.JOIN_ROOM,
      payload: {
        roomId: roomId,
      },
    };
    _websocket.send(JSON.stringify(message));
  }
}

function _leaveRoom() {
  if (_isCalling) {
    _hangUpCalling();
  }

  if (_websocket) {
    const message = {
      type: _SignalMessageType.LEAVE_ROOM,
      payload: {
        // roomId: roomId,
      },
    };
    _websocket.send(JSON.stringify(message));
  }
}

/**
 * External usage
 */

export default {
  /**
   * Events listening feature
   */

  onLoginInSuccess: function (handler) {
    _handleLoginSuccess = handler;
  },
  onLogoutInSuccess: function (handler) {
    _handleLogoutSuccess = handler;
  },
  onWebSocketOpen: function (handler) {
    _handleWebSocketOpened = handler;
  },
  onWebSocketClose: function (handler) {
    _handleWebSocketClosed = handler;
  },
  onRoomsInfoUpdated: function (handler) {
    _handleRoomsUpdated = handler;
  },
  onJoinRoomInSuccess: function (handler) {
    _handleJoinRoomSuccessMessage = handler;
  },
  onLeaveRoomInSuccess: function (handler) {
    _handleLeaveRoomSuccessMessage = handler;
  },
  onWebRTCCallingStateChanged: function (handler) {
    _handleCallingStateChanged = handler;
  },
  onWebRTCNewPeerArived: function (handler) {
    _handleNewPeerArivalMessage = handler;
  },
  onPeerMediaStreamMapChanged: function (handler) {
    _handlePeerMediaStreamMapChanged = handler;
  },
  onLocalMediaStreamChanged: function (handler) {
    _handleLocalMediaStreamChanged = handler;
  },

  /**
   * Authentication feature
   */

  login: function (username) {
    console.log(`WebRTCGroupChatService: login as ${username}`);
    _login(username);
  },
  logout: function () {
    console.log(`WebRTCGroupChatService: logout`);
    _logout();
  },

  /**
   * Chat room feature
   */

  createNewRoom: function (roomName) {
    _createNewRoom(roomName);
  },
  joinRoom: function (roomId) {
    _joinRoom(roomId);
  },
  leaveRoom: function () {
    _leaveRoom();
  },

  /**
   * Media calling feature
   */

  startCalling: function () {
    _startCalling();
  },
  hangUpCalling: function () {
    _hangUpCalling();
  },

  /**
   * Configurations customization
   */

  changeMediaStreamConstraints: function (constraints) {
    const passChecking = _checkMediaStreamConstraints(constraints);
    if (!passChecking) return;
    _mediaStreamConstraints = constraints;
  },
  changePeerConnectionConfig: function (config) {
    const passChecking = _checkPeerConnectionConfig(config);
    if (!passChecking) return;
    _peerConnectionConfig = config;
  },

  /**
   * Internal states accessing
   */

  get getSelfId() {
    return _selfId;
  },
  get localMediaStream() {
    return _localMediaStream;
  },
  get peerMediaStreamMap() {
    return _peerMediaStreamMap;
  },
};
