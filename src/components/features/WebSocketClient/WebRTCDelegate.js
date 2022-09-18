/**
 *
 * WebRTCDelegate collects all the things that are related to 'RTCPeerConnection' establishment
 * including authtication, peer connections management, media streams management, signaling,
 * and ICE candidates management which are loosely-coupled processs comparing to UI logic
 *
 */

import axios from "axios";

let _websocket;
let _isCalling = false;

let _handleWebSocketOpened;
let _handleWebSocketClosed;
let _handleRoomsUpdated;
let _handleJoinRoomSuccessMessage;

let _handleCallingStateChanged;
let _handleNewPeerArivalMessage;
let _handleLeaveRoomSuccessMessage;
let _handlePeerMediaStreamMapChanged;
let _handleLocalMediaStreamChanged;

let _handleLoginSuccess;
let _handleLogoutSuccess;

const _webSocketHost = "localhost";
const _webSocketPort = "3002"; // websocket port number should same as mock express server port number

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
  const config = {
    url: "/logout",
    method: "POST",
  };
  axios(config)
    .then((response) => {
      const type = response.data.type;
      if (type === _SignalMessageType.LOG_OUT_SUCCESS) {
        if (_handleLogoutSuccess) {
          _handleLogoutSuccess();

          _hangUpCalling();
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function _createSignal(url) {
  const passChecking = _checkSocketUrl(url);
  if (!passChecking) return;
  _websocket = new WebSocket(url);
  _websocket.addEventListener("open", function (event) {
    console.log("ws: websocket connected");
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
        // external usage
        if (_handleRoomsUpdated) {
          _handleRoomsUpdated(payload);
        }
        break;
      }
      case _SignalMessageType.JOIN_ROOM_SUCCESS: {
        // external usage
        if (_handleJoinRoomSuccessMessage) {
          _handleJoinRoomSuccessMessage(payload);
        }
        break;
      }
      case _SignalMessageType.LEAVE_ROOM_SUCCESS: {
        // external usage
        if (_handleLeaveRoomSuccessMessage) {
          _handleLeaveRoomSuccessMessage(payload);
        }
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_PEER: {
        // internal usage
        _handleWebRTCNewPeerArival(payload);
        // external usage
        if (_handleNewPeerArivalMessage) {
          _handleNewPeerArivalMessage(payload);
        }
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_OFFER: {
        // internal usage
        _handleWebRTCNewOfferArival(payload);
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_ANSWER: {
        // internal usage
        _handleWebRTCNewAnswerArival(payload);
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_ICE_CANDIDATE: {
        // internal usage
        _handleWebRTCNewICECandidateArival(payload);
        break;
      }
      default:
        break;
    }
  });
  _websocket.addEventListener("close", function (event) {
    console.log("ws: websocket closed from server side");
    _destroySignal();
    // external usage
    if (_handleWebSocketClosed) {
      _handleWebSocketClosed(event);
    }
  });
}

function _destroySignal() {
  if (_websocket) {
    _websocket.close();
    _websocket = null;
  }
}

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

function _startCalling() {
  if (_handleCallingStateChanged) {
    _isCalling = true;
    _handleCallingStateChanged(_isCalling);
  }
  navigator.mediaDevices
    .getUserMedia(_mediaStreamConstraints)
    .then((mediaStream) => {
      _localMediaStream = mediaStream;
      _handleLocalMediaStreamChanged(mediaStream);
    })
    .catch((error) => {
      if (_handleCallingStateChanged) {
        _isCalling = false;
        _handleCallingStateChanged(_isCalling);
      }
      console.error(error);
    });

  // TODO: check the calling logic

  if (_websocket) {
    const data = {
      type: _SignalMessageType.WEBRTC_NEW_CALLING,
      payload: {},
    };
    _websocket.send(JSON.stringify(data));
  }
}

function _hangUpCalling() {
  if (_handleCallingStateChanged) {
    _isCalling = false;
    _handleCallingStateChanged(_isCalling);
  }

  _stopLocalMediaStream();

  _stopPeerConnection();

  if (_websocket) {
    const data = {
      type: _SignalMessageType.WEBRTC_HANG_UP,
      payload: {},
    };
    _websocket.send(JSON.stringify(data));
  }
}

function _leaveRoom(roomId) {
  // TODO:
  //
  // Do some work to close WebRTC connection to other peers locally,
  // and notify the server side
  //
  _hangUpCalling();

  if (roomId.length > 0 && _websocket) {
    const message = {
      type: _SignalMessageType.LEAVE_ROOM,
      payload: {
        roomId: roomId,
      },
    };
    _websocket.send(JSON.stringify(message));
  }
}

let _mediaStreamConstraints = {
  video: true,
  audio: true,
};

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

/**
 * This signal message type list match the same one on server side
 */
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
 * [[ peerId, peerConnectionInstance ], [ peerId, peerConnectionInstance ], ... ]
 */
const _peerConnectionMap = {
  map: new Map(),
  set(key, value) {
    this.map.set(key, value);
  },
  get(key) {
    return this.map.get(key);
  },
  getFirstKeyByValue: function (searchValue) {
    for (let [key, value] of this.map.entries()) {
      if (value === searchValue) return key;
    }
  },
};

/**
 * [[ peerId, mediaStream ], [ peerId, mediaStream ], ... ]
 */
const _peerMediaStreamMap = new Map();

let _localMediaStream;

function _stopLocalMediaStream() {
  if (_localMediaStream) {
    // stop the live mediaStream
    _localMediaStream.getTracks().forEach(function (track) {
      if (track.readyState == "live") {
        track.stop();
      }
    });
    _localMediaStream = null;
  }
}

function _stopPeerConnection() {}

/**
 * locate a peer connection according to its id
 */
function _locatePeerConnection(peerId) {
  if (peerId.length === 0) return;
  let indexOfPeerId = _peerIds.indexOf(peerId);
  if (indexOfPeerId === -1) {
    _addPeerConnection();
    _peerIds.push(peerId);
    indexOfPeerId = _peerIds.length - 1;
  }
  return indexOfPeerId;
}

/**
 * add a peer connection
 */
function _addPeerConnection(peerId) {
  console.log("add peer connection");
  // add another peer connection for use
  if (peerId.length === 0) return;
  const peerConnection = new RTCPeerConnection(_peerConnectionConfig);
  _peerConnectionMap.set(peerId, peerConnection);
  // generic handler that sends any ice candidate to the other peer
  peerConnection.onicecandidate = function (event) {
    if (event.candidate && _websocket) {
      _websocket.send(
        JSON.stringify({
          type: _SignalMessageType.WEBRTC_NEW_ICE_CANDIDATE,
          iceCandidate: event.candidate,
          userId: peerId,
          // token: call_token,
        })
      );
      console.log("send new ice candidate, from " + _selfId);
    }
  };

  // display remote video streams when they arrive using local <video> MediaElement
  peerConnection.ontrack = function (event) {
    // const peerId = _peerConnectionMap.getFirstKeyByValue(peerConnection);
    if (peerId.length > 0) {
      _peerMediaStreamMap.set(peerId, event.streams[0]); // store this src
      _handlePeerMediaStreamMapChanged(_peerMediaStreamMap);
    }
    // if (video_src.length == 1) {
    // first peer
    // connect_stream_to_src(
    //   event.stream,
    //   document.getElementById("remote_video")
    // );
    // video rotating function
    // setInterval(function () {
    //   // rorating video src
    //   var video_now = video_rotate;
    //   if (video_rotate == video_src.length - 1) {
    //     video_rotate = 0;
    //   } else {
    //     video_rotate++;
    //   }
    //   var status =
    //     peer_connection[video_src_id[video_rotate]].iceConnectionState;
    //   if (status == "disconnected" || status == "closed") {
    //     // connection lost, do not show video
    //     console.log("connection " + video_rotate + " liveness check failed");
    //   } else if (video_now != video_rotate) {
    //     connect_stream_to_src(
    //       video_src[video_rotate],
    //       document.getElementById("remote_video")
    //     );
    //   }
    // }, 8000);
    // hide placeholder and show remote video
    // console.log("first remote video");
    // document.getElementById("loading_state").style.display = "none";
    // document.getElementById("open_call_state").style.display = "block";
    // }
    console.log("remote video");
  };
  // TODO: local_stream
  if (_localMediaStream) {
    _localMediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, _localMediaStream);
    });
  }
  // peerConnection.addTrack(local_stream);
}

function _handlePeerConnectionOffer(offer, peerConnection, peerId, websocket) {
  if (offer && peerConnection && websocket) {
    peerConnection.setLocalDescription(offer).then(() => {
      const data = {
        type: _SignalMessageType.WEBRTC_NEW_OFFER,
        payload: {
          offer: offer,
          userId: peerId,
        },
      };
      websocket.send(data);
    });
  }
}

function _handlePeerConnectionAnswer(
  answer,
  peerConnection,
  peerId,
  websocket
) {
  if (answer && peerConnection && websocket) {
    peerConnection.setLocalDescription(answer).then(() => {
      const data = {
        type: _SignalMessageType.WEBRTC_NEW_ANSWER,
        payload: {
          answer: answer,
          userId: peerId,
        },
      };
      websocket.send(data);
    });
  }
}

// handle new peer
function _handleWebRTCNewPeerArival(payload) {
  const peerId = payload.userId;

  if (peerId.length === 0) return;
  // locate peer connection
  var indexOfPeerId = _locatePeerConnection(peerId);
  const peerConnection = _peerConnectionMap.get(peerId);
  console.log("new peer " + indexOfPeerId);

  if (!peerConnection) return;
  // create offer
  peerConnection
    .createOffer()
    .then((offer) => {
      _handlePeerConnectionOffer(offer, peerConnection, peerId, _websocket);
    })
    .catch((error) => {
      console.error(`new peer error: ${error}`);
    });
}

// handle offer
function _handleWebRTCNewOfferArival(payload) {
  const peerId = payload.from;
  const offer = payload.offer;

  if (!offer || peerId.length === 0) return;
  var indexOfPeerId = _locatePeerConnection(peerId);
  console.log("new offer " + indexOfPeerId);
  const peerConnection = _peerConnectionMap.get(peerId);

  if (!peerConnection) return;
  // set remote description
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  peerConnection
    .createAnswer()
    .then((answer) => {
      _handlePeerConnectionAnswer(answer, peerConnection, peerId, _websocket);
    })
    .catch((error) => {
      console.error(`new offer error: ${error}`);
    });
}

// handle answer
function _handleWebRTCNewAnswerArival(payload) {
  const peerId = payload.from;
  const answer = payload.answer;

  if (!answer || peerId.length === 0) return;
  var indexOfPeerId = _locatePeerConnection(peerId);
  console.log("new answer " + indexOfPeerId);
  const peerConnection = _peerConnectionMap.get(peerId);

  if (!peerConnection) return;
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

// handle ice candidate
function _handleWebRTCNewICECandidateArival(payload) {
  const peerId = payload.from;
  const iceCandidate = payload.iceCandidate;

  if (!iceCandidate || peerId.length === 0) return;
  var indexOfPeerId = _locatePeerConnection(peerId);
  console.log("get new_ice_candidate from " + indexOfPeerId);
  const peerConnection = _peerConnectionMap.get(peerId);

  if (!peerConnection) return;
  peerConnection.addIceCandidate(iceCandidate);
}

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

export default {
  // The delegate will be set up in 2 required steps and 1 optional step:
  //
  // Required STEP 1, setup some of event handlers(peer connection + websocket) listed that you care about
  //
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
  //
  // Required STEP 2, login for authentication usage
  //
  login(username) {
    console.log(`login as ${username}`);
    _login(username);
  },
  //
  // Optional STEP 3
  //
  createNewRoom(roomName) {
    _createNewRoom(roomName);
  },
  //
  // Optional STEP 4
  //
  joinRoom(roomId) {
    _joinRoom(roomId);
  },
  //
  // Optional STEP 5
  //
  leaveRoom(roomId) {
    _leaveRoom(roomId);
  },
  //
  // Optional STEP 6, logout for authentication usage
  //
  logout() {
    console.log(`logout`);
    _logout();
  },

  // External util properties:
  //
  // 1. signal types getter
  //
  get SignalMessageType() {
    return {
      ..._SignalMessageType,
    };
  },
  //
  // 3. set up local media stream constraints
  //
  setupMediaStreamConstraints(constraints) {
    const passChecking = _checkMediaStreamConstraints(constraints);
    if (!passChecking) return;
    _mediaStreamConstraints = constraints;
  },
  //
  // 4. set up peer connection ICE servers config
  //
  setupPeerConnectionConfig(config) {
    const passChecking = _checkPeerConnectionConfig(config);
    if (!passChecking) return;
    _peerConnectionConfig = config;
  },
  //
  // 4. get self user id
  //
  get getSelfId() {
    return _selfId;
  },
  //
  // 5. start calling to open WebRTC connection
  //
  startCalling() {
    _startCalling();
  },
  //
  // 6. hang up the call to close WebRTC connection
  //
  hangUpCalling() {
    // TODO: do some work to close WebRTC connection to other peers and close local media streams
    _hangUpCalling();
  },
  //
  // 7. current streams can be checked through the two getters
  //
  get localMediaStream() {
    return _localMediaStream;
  },
  get peerMediaStreamMap() {
    return _peerMediaStreamMap;
  },
};
