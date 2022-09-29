/**
 *
 * WebRTCGroupChatHelper collects all WebRTC connection establishment logic including authtication,
 * peer connections management, (local && remote) media streams management, signaling, and ICE candidates management.
 *
 * The module's exported properties are designed to build any custom UI aiming to realize the real-time group-chatting feature
 */

import axios from "axios";

/**
 * The self id given by server side
 */

let _selfId = "";

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

let _websocket;
const _webSocketHost = location.hostname;
const _webSocketPort = "3002"; // websocket port number should same as mock express server port number

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
  WEBRTC_NEW_PASSTHROUGH: 11,
  WEBRTC_HANG_UP: 12,
};

let _handleWebSocketOpened;
let _handleWebSocketClosed;

let _handleJoinRoomSuccess;
let _handleLeaveRoomSuccess;
let _handleRoomsUpdated;

let _handleCallingStateChanged;
let _handleNewPeerArivalExternally;

function _createSignal(url) {
  const passChecking = _checkSocketUrl(url);
  if (!passChecking) return;
  _websocket = new WebSocket(url);
  _websocket.addEventListener("open", function (event) {
    console.log("WebRTCGroupChatHelper: websocket connected");
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
        console.log(
          "WebRTCGroupChatHelper: UPDATE_ROOMS signal received"
        );

        // external usage
        if (_handleRoomsUpdated) {
          _handleRoomsUpdated(payload);
        }
        break;
      }
      case _SignalMessageType.JOIN_ROOM_SUCCESS: {
        console.log(
          "WebRTCGroupChatHelper: JOIN_ROOM_SUCCESS signal received"
        );

        // external usage
        if (_handleJoinRoomSuccess) {
          _handleJoinRoomSuccess(payload);
        }
        break;
      }
      case _SignalMessageType.LEAVE_ROOM_SUCCESS: {
        console.log(
          "WebRTCGroupChatHelper: LEAVE_ROOM_SUCCESS signal received"
        );

        // external usage
        if (_handleLeaveRoomSuccess) {
          _handleLeaveRoomSuccess(payload);
        }
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_PEER: {
        console.log(
          "WebRTCGroupChatHelper: WEBRTC_NEW_PEER signal received"
        );

        // internal usage
        _handleNewPeerArivalInternally(payload);

        // external usage
        if (_handleNewPeerArivalExternally) {
          _handleNewPeerArivalExternally(payload);
        }
        break;
      }
      case _SignalMessageType.WEBRTC_NEW_PASSTHROUGH: {
        console.log(
          "WebRTCGroupChatHelper: WEBRTC_NEW_PASSTHROUGH signal received"
        );

        // internal usage
        _handleNewPassthroughArival(payload);
        break;
      }
      case _SignalMessageType.WEBRTC_HANG_UP: {
        console.log(
          "WebRTCGroupChatHelper: WEBRTC_HANG_UP signal received"
        );

        // internal usage
        _handleHangedUpByRemotePeer(payload);
        break;
      }
      default:
        break;
    }
  });
  _websocket.addEventListener("close", function (event) {
    console.log(
      "WebRTCGroupChatHelper: client side heared websocket onclose event"
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
      "WebRTCGroupChatHelper: client side will close websocket connection"
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
        console.log(
          "WebRTCGroupChatHelper: LOG_OUT_SUCCESS signal received"
        );

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
    return this.map.has(key);
  },
  size() {
    return this.map.size;
  },
  set(key, value) {
    const prevSize = this.map.size;
    this.map.set(key, value);
    const curSize = this.map.size;
    console.log(
      `WebRTCGroupChatHelper: _peerConnectionMap set executed, and its size changed from ${prevSize} to ${curSize}`
    );
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
    console.log(
      `WebRTCGroupChatHelper: _peerConnectionMap delete executed, and its size changed from ${prevSize} to ${curSize}`
    );
  },
  clear() {
    const prevSize = this.map.size;
    this.map.clear();
    const curSize = this.map.size;
    console.log(
      `WebRTCGroupChatHelper: _peerConnectionMap clear executed, and its size changed from ${prevSize} to ${curSize}`
    );
  },
  forEach(func) {
    this.map.forEach(func);
  },
};

function _handleNewPeerArivalInternally(payload) {
  const peerId = payload.userId;
  const isNewPeerPolite = payload.isPolite;

  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatHelper: unexpected peerId ( ${peerId} ) during '_handleNewPeerArivalInternally' method`
    );
    return;
  }
  const peerConnection = _locatePeerConnection(peerId);
  if (!peerConnection) {
    return;
  }

  // offer collision setup
  peerConnection.makingOffer = false;
  peerConnection.ignoreRemoteOffer = false;
  peerConnection.isSettingRemoteAnswerPending = false;
  peerConnection.isLocalPoliteDuringOfferCollision = !isNewPeerPolite;
}

function _handleNewPassthroughArival(payload) {
  const peerId = payload.from;
  const { sdp, iceCandidate } = payload;
  const isSDP = sdp !== undefined;
  const isICE = iceCandidate !== undefined;

  console.log(
    `WebRTCGroupChatHelper: does this passthrough carry sdp (${isSDP}${
      isSDP ? "-" + sdp.type : ""
    }) ? or ICE (${isICE}) ?`
  );

  if (!peerId || peerId.length === 0 || (!isSDP && !isICE)) {
    console.log(
      `WebRTCGroupChatHelper: unexpected new passthrough ( sdp: ${sdp}, iceCandidate: ${iceCandidate} ) for peerId of ${peerId}, during '_handleNewPassthroughArival' method`
    );
    return;
  }

  const peerConnection = _locatePeerConnection(peerId);
  if (!peerConnection) {
    console.log(
      `WebRTCGroupChatHelper: unexpected non-existent peer connection ( ${peerConnection} ) with peerId of ${peerId} after '_locatePeerConnection' method`
    );
    return;
  }

  // offer collision setup
  peerConnection.makingOffer = false;
  peerConnection.ignoreRemoteOffer = false;
  peerConnection.isSettingRemoteAnswerPending = false;
  peerConnection.isLocalPoliteDuringOfferCollision = false;

  console.log(
    `WebRTCGroupChatHelper: before consuming the new passthrough, the current peerConnection signalingState is ${
      peerConnection.signalingState
    }, the localDescription type is ${
      peerConnection.localDescription
        ? peerConnection.localDescription.type
        : "unknown"
    }, the remoteDescription type is ${
      peerConnection.remoteDescription
        ? peerConnection.remoteDescription.type
        : "unknown"
    }`
  );

  // distinguish the type of new passthrough, and then process it based on its type
  if (isSDP && isICE) {
    console.error(
      `WebRTCGroupChatHelper: unexpected new passthrough type, it cannot be both 'SDP' and 'ICE'`
    );
    return;
  }

  console.log(
    `WebRTCGroupChatHelper: start consuming the new passthrough ... ...`
  );

  if (isICE) {
    peerConnection
      .addIceCandidate(iceCandidate)
      .then(() => {
        console.log(
          `WebRTCGroupChatHelper: peerId (${peerId})'s 'addIceCandidate' done with no issue`
        );
      })
      .catch((error) => {
        // Suppress ignored offer's candidates
        if (!peerConnection.ignoreRemoteOffer) {
          console.error(
            `WebRTCGroupChatHelper: Found error with message of ${error}`
          );
        }
      });
    return;
  }

  const isPeerConnectionStable =
    peerConnection.signalingState == "stable" ||
    (peerConnection.signalingState == "have-local-offer" &&
      peerConnection.isSettingRemoteAnswerPending);
  const isPeerConnectionReadyForOffer =
    !peerConnection.makingOffer && isPeerConnectionStable;
  const isOfferCollision =
    sdp.type == "offer" && !isPeerConnectionReadyForOffer;

  if (isOfferCollision) {
    console.log(
      `WebRTCGroupChatHelper: an offer collision has happened ( signalingState: ${peerConnection.signalingState}, isSettingRemoteAnswerPending: ${peerConnection.isSettingRemoteAnswerPending}, makingOffer: ${peerConnection.makingOffer}, isPeerConnectionStable: ${isPeerConnectionStable}, sdp type: ${sdp.type} )`
    );
  }

  peerConnection.ignoreRemoteOffer =
    isOfferCollision &&
    !peerConnection.isLocalPoliteDuringOfferCollision;

  if (peerConnection.ignoreRemoteOffer) {
    console.log(
      `WebRTCGroupChatHelper: the local peer ignore the ${sdp.type} typed SDP for peer connection of peerId ( ${peerId} ), during this offer collision`
    );
    return;
  }

  if (sdp.type == "answer") {
    peerConnection.isSettingRemoteAnswerPending = true;
  }

  console.log(
    `WebRTCGroupChatHelper: before setting 'setRemoteDescription', the remoteDescription is ${
      peerConnection.remoteDescription
        ? peerConnection.remoteDescription.type
        : "unknown"
    }`
  );

  peerConnection
    .setRemoteDescription(sdp) // SRD rolls back as needed
    .then(() => {
      console.log(
        `WebRTCGroupChatHelper: the local peer accept the ( ${sdp.type} ) typed SDP as a param of 'setRemoteDescription' for peer connection of peerId ( ${peerId} )`
      );
      console.log(
        `WebRTCGroupChatHelper: after setting 'setRemoteDescription', the remoteDescription is ${
          peerConnection.remoteDescription
            ? peerConnection.remoteDescription.type
            : "unknown"
        }`
      );

      if (sdp.type == "answer") {
        peerConnection.isSettingRemoteAnswerPending = false;
        return;
      }

      return peerConnection.setLocalDescription();
    })
    .then(() => {
      if (sdp.type == "answer") {
        return;
      }

      if (_websocket) {
        console.log(
          `WebRTCGroupChatHelper: the local peer send the new answer`
        );

        const data = {
          type: _SignalMessageType.WEBRTC_NEW_PASSTHROUGH,
          payload: {
            sdp: peerConnection.localDescription,
            userId: peerId,
          },
        };
        _websocket.send(JSON.stringify(data));
      }
    })
    .catch((error) => {
      console.error(
        `WebRTCGroupChatHelper: Found an error with message of ${error} during 'setRemoteDescription' or 'setLocalDescription'`
      );
    });
}

function _locatePeerConnection(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatHelper: unexpected peerId ( ${peerId} ) during '_locatePeerConnection'`
    );
    return;
  }
  if (!_peerConnectionMap.has(peerId)) {
    const prevPeerIdsSize = _peerConnectionMap.size();
    _addPeerConnection(peerId);
    console.log(
      `WebRTCGroupChatHelper: after '_addPeerConnection' method, peer connection count changed from ${prevPeerIdsSize} to ${_peerConnectionMap.size()}`
    );
  }
  return _peerConnectionMap.get(peerId);
}

function _addPeerConnection(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatHelper: unexpected peerId of ${peerId} during creating and adding a new peer connection`
    );
    return;
  }
  const peerConnection = new RTCPeerConnection(_peerConnectionConfig);
  console.log(
    `WebRTCGroupChatHelper: a new 'RTCPeerConnection' is created`
  );

  _peerConnectionMap.set(peerId, peerConnection);
  _addLocalMediaStream(peerId, peerConnection);

  peerConnection.onicecandidate = function (event) {
    console.log(``);
    if (event.candidate && _websocket) {
      _websocket.send(
        JSON.stringify({
          type: _SignalMessageType.WEBRTC_NEW_PASSTHROUGH,
          payload: {
            iceCandidate: event.candidate,
            userId: peerId,
          },
          // token: call_token,
        })
      );
      console.log(
        `WebRTCGroupChatHelper: a peer connection's 'onicecandidate' fired with a new ICE candidate, then it's sent from ${_selfId} to ${peerId}`
      );
    }
  };

  peerConnection.oniceconnectionstatechange = (event) => {
    console.log(
      `WebRTCGroupChatHelper: a peer connection's 'oniceconnectionstatechange' fired with the state of '${peerConnection.iceConnectionState}'`
    );
  };

  peerConnection.onnegotiationneeded = (event) => {
    console.log(
      `WebRTCGroupChatHelper: a peer connection's 'onnegotiationneeded' fired, maybe it's time to create a new SDP offer ? the current remoteDescription is ${
        peerConnection.remoteDescription
          ? peerConnection.remoteDescription.type
          : "unknown"
      }`
    );

    peerConnection.makingOffer = true;
    peerConnection
      .setLocalDescription()
      .then(() => {
        const offer = peerConnection.localDescription;
        if (offer.type !== "offer") {
          throw new Error(
            `unexpected localDescription of type '${offer.type}' created to \
            peerId of ${peerId} during 'onnegotiationneeded'`
          );
        }

        console.log(
          `WebRTCGroupChatHelper: a new localDescription of type '${offer.type}' created to peerId of ${peerId} during 'onnegotiationneeded'`
        );
        console.log(
          `WebRTCGroupChatHelper: the current localDescription is ${
            peerConnection.localDescription.type
          }, the current remoteDescription is ${
            peerConnection.remoteDescription
              ? peerConnection.remoteDescription.type
              : "unknown"
          },  during 'onnegotiationneeded'`
        );

        if (_websocket) {
          const data = {
            type: _SignalMessageType.WEBRTC_NEW_PASSTHROUGH,
            payload: {
              sdp: offer,
              userId: peerId,
            },
          };
          _websocket.send(JSON.stringify(data));
        }
      })
      .catch((error) => {
        console.error(
          `WebRTCGroupChatHelper: Found error with message of ${error}`
        );
      })
      .finally(() => {
        peerConnection.makingOffer = false;
      });
  };

  peerConnection.ontrack = function (event) {
    if (event.track && event.track.kind === "video") {
      _videoTransceiver = event.transceiver;

      // TEST:
      // window._videoTransceiver = _videoTransceiver;

      console.log(`WebRTCGroupChatHelper: a video transceiver has been set during 'ontrack'`)
    } else if (event.track && event.track.kind === "audio") {
      _audioTransceiver = event.transceiver;

      // TEST:
      // window._audioTransceiver = _audioTransceiver;
      
      console.log(`WebRTCGroupChatHelper: an audio transceiver has been set during 'ontrack'`)
    }

    console.log(
      `WebRTCGroupChatHelper: a peer connection's 'ontrack' fired with a (id: ${
        event.track.id
      }) (kind: ${event.track.kind}) track, the fired event has ${
        event.streams.length
      } streams, the first mediaStream obj has ${
        event.streams[0].getTracks().length
      } track(s)`
    );

    const incomingNewTrack = event.track;
    if (!incomingNewTrack) {
      console.log(
        `WebRTCGroupChatHelper: unexpected incoming new track of ${incomingNewTrack}`
      );
    }

    const peerId =
      _peerConnectionMap.getFirstKeyByValue(peerConnection);
    _addIncomingNewTrack(peerId, incomingNewTrack);
  };
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

function _closePeerConnectionTo(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatHelper: unexpected peerId when stopping peer side connection`
    );
    return;
  }
  const peerConnection = _peerConnectionMap.get(peerId);
  if (!peerConnection) return;
  peerConnection.close();
  console.log(
    `WebRTCGroupChatHelper: after the close peerConnection for peerId of ${peerId}, the current peerConnection signalingState is ${
      peerConnection.signalingState
    }, the localDescription type is ${
      peerConnection.localDescription
        ? peerConnection.localDescription.type
        : "unknown"
    }, the remoteDescription type is ${
      peerConnection.remoteDescription
        ? peerConnection.remoteDescription.type
        : "unknown"
    }`
  );
  _peerConnectionMap.delete(peerId);
}

function _clearALLPeerConnections() {
  _peerConnectionMap.forEach((peerConnection, peerId) => {
    if (peerConnection) {
      peerConnection.close();
      console.log(
        `WebRTCGroupChatHelper: after the close peerConnection for peerId of ${peerId}, the current peerConnection signalingState is ${
          peerConnection.signalingState
        }, the localDescription type is ${
          peerConnection.localDescription
            ? peerConnection.localDescription.type
            : "unknown"
        }, the remoteDescription type is ${
          peerConnection.remoteDescription
            ? peerConnection.remoteDescription.type
            : "unknown"
        }`
      );
      console.log(
        `WebRTCGroupChatHelper: the peerConnection with peerId of ${peerId} is closed`
      );
    }
  });
  _peerConnectionMap.clear();
  console.log(`WebRTCGroupChatHelper: all peerConnections cleared`);
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

let _videoTransceiver;
let _audioTransceiver;

let _handleLocalMediaStreamChanged;
let _handlePeerMediaStreamMapChanged;

async function _createLocalMediaStream() {
  console.log(
    `WebRTCGroupChatHelper: start to create local media stream`
  );
  return navigator.mediaDevices
    .getUserMedia(_mediaStreamConstraints)
    .then((mediaStream) => {
      console.log(
        `WebRTCGroupChatHelper: local media stream created`
      );
      _localMediaStream = mediaStream;
      if (_handleLocalMediaStreamChanged) {
        _handleLocalMediaStreamChanged(mediaStream);
      }
    });
}

function _addLocalMediaStream(peerId, peerConnection) {
  if (!_localMediaStream) {
    console.log(
      `WebRTCGroupChatHelper: unexpected _localMediaStream of ${_localMediaStream} when adding local media stream to peer connection (peerId: ${peerId})`
    );
    return;
  }

  _localMediaStream.getTracks().forEach((track, index) => {
    console.log(
      `WebRTCGroupChatHelper: add (trackId: ${track.id}) (kind: ${track.kind}) track of local media stream to a peer connection to ${peerId}`
    );

    peerConnection.addTrack(track, _localMediaStream);
  });
}

function _addIncomingNewTrack(peerId, incomingNewTrack) {
  if (!peerId || peerId.length === 0 || !incomingNewTrack) {
    console.log(
      `WebRTCGroupChatHelper: unexpected peerId of ${peerId} during a peer connection 'ontrack'`
    );
    return;
  }

  const prevPeerMediaStreamCount = _peerMediaStreamMap.size;

  let mediaStream = _peerMediaStreamMap.get(peerId);
  if (!mediaStream) {
    mediaStream = new MediaStream();
  }
  mediaStream.addTrack(incomingNewTrack);
  _peerMediaStreamMap.set(peerId, mediaStream);

  console.log(
    `WebRTCGroupChatHelper: _peerMediaStreamMap size changed from ${prevPeerMediaStreamCount} to ${_peerMediaStreamMap.size}`
  );

  if (_handlePeerMediaStreamMapChanged) {
    _handlePeerMediaStreamMapChanged(_peerMediaStreamMap);
  }
}

function _getLocalMediaTrackEnabled(trackKind) {
  let trackEnabled = false;

  if (!_localMediaStream) {
    return trackEnabled;
  }

  let track;
  if (trackKind === 'audio' && _localMediaStream.getAudioTracks()) {
    track = _localMediaStream.getAudioTracks()[0]
  } else if (trackKind === 'video' && _localMediaStream.getVideoTracks()) {
    track = _localMediaStream.getVideoTracks()[0]
  }

  if (!track) {
    console.error(
      `WebRTCGroupChatHelper: unexpected empty track when 'get' enabling ( ${trackKind} ) kind of local media device`
    );
    return trackEnabled;
  }

  trackEnabled = track.enabled;
  return trackEnabled;
}

function _setLocalMediaTrackEnabled(trackKind, enabled) {
  if (!_localMediaStream) {
    console.error(
      `WebRTCGroupChatHelper: unexpected empty _localMediaStream when 'set' enabling ( ${trackKind} ) kind of local media device`
    );
    return;
  }

  let track;
  if (trackKind === 'audio' && _localMediaStream.getAudioTracks()) {
    track = _localMediaStream.getAudioTracks()[0];
  } else if (trackKind === 'video' && _localMediaStream.getVideoTracks()) {
    track = _localMediaStream.getVideoTracks()[0];
  }

  if (!track) {
    console.error(
      `WebRTCGroupChatHelper: unexpected empty track when enabling ( ${trackKind} ) kind of local media device`
    );
    return;
  }
  track.enabled = enabled;
}

function _getLocalMediaTrackMuted(trackKind) {
  let isLocalMediaTrackMuted = true;
  let transceiver;

  if (trackKind === 'audio') {
    transceiver = _audioTransceiver;
  } else if (trackKind === 'video') {
    transceiver = _videoTransceiver;
  }

  if (!transceiver) {
    return isLocalMediaTrackMuted;
  }

  switch (transceiver.currentDirection) {
    case 'inactive':
    case 'recvonly': 
      isLocalMediaTrackMuted = true;
      break;
    default:
      isLocalMediaTrackMuted = false;
      break;
  }

  return isLocalMediaTrackMuted;
}

function _setLocalMediaTrackMuted(trackKind, muted) {
  let transceiver;

  if (trackKind === 'audio') {
    transceiver = _audioTransceiver;
  } else if (trackKind === 'video') {
    transceiver = _videoTransceiver;
  }

  if (!transceiver) {
    console.error(
      `WebRTCGroupChatHelper: unexpected transceiver of ${transceiver ? transceiver : 'unknown'} when muting ( ${trackKind} ) kind of local media device`
    );
    return;
  }

  transceiver.direction = muted ? 'recvonly' : 'sendrecv';
}

function _closePeerMediaStreamTo(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatHelper: unexpected peerId when stopping peer media stream`
    );
    return;
  }
  const prevPeerMediaStreamCount = _peerMediaStreamMap.size;
  _peerMediaStreamMap.delete(peerId);
  console.log(
    `WebRTCGroupChatHelper: deleted a peer media stream, and _peerMediaStreamMap size changed from ${prevPeerMediaStreamCount} to ${_peerMediaStreamMap.size}`
  );
  if (_handlePeerMediaStreamMapChanged) {
    _handlePeerMediaStreamMapChanged(_peerMediaStreamMap);
  }
}

function _clearAllMediaStreams() {
  _clearLocalMediaStream();
  _clearPeerMediaStreamMap();
}

function _clearPeerMediaStreamMap() {
  if (_peerMediaStreamMap.size > 0) {
    const prevPeerMediaStreamCount = _peerMediaStreamMap.size;
    _peerMediaStreamMap.clear();
    console.log(
      `WebRTCGroupChatHelper: clear all peer media streams, and _peerMediaStreamMap size changed from ${prevPeerMediaStreamCount} to ${_peerMediaStreamMap.size}`
    );
    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(_peerMediaStreamMap);
    }
  }
}

function _clearLocalMediaStream() {
  if (_localMediaStream) {
    _localMediaStream.getTracks().forEach(function (track) {
      track.stop();
    });
    _localMediaStream = null;
    if (_handleLocalMediaStreamChanged) {
      _handleLocalMediaStreamChanged(_localMediaStream);
    }
  }
}

/**
 * Calling management
 */

let _isCalling = false;

function _changeCallingState(toCalling) {
  console.log(
    `WebRTCGroupChatHelper: change calling state to toCalling of ${toCalling}`
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
  _createLocalMediaStream().then(
    _requestToSchedulePeerConnection,
    (error) => {
      console.log(
        `WebRTCGroupChatHelper: met error of ${error} when creating local media stream`
      );
      _changeCallingState(false);
    }
  );
}

function _hangUpCalling() {
  _changeCallingState(false);
  _clearAllMediaStreams();
  _clearALLPeerConnections();
  _requestToUnschedulePeerConnection();
}

function _handleHangedUpByRemotePeer(payload) {
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
      payload: {},
    };
    _websocket.send(JSON.stringify(message));
  }
}

/**
 * External usage
 */

export default {
  //
  // Events listening feature
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
    _handleJoinRoomSuccess = handler;
  },
  onLeaveRoomInSuccess: function (handler) {
    _handleLeaveRoomSuccess = handler;
  },
  onWebRTCCallingStateChanged: function (handler) {
    _handleCallingStateChanged = handler;
  },
  onWebRTCNewPeerArived: function (handler) {
    _handleNewPeerArivalExternally = handler;
  },
  onPeerMediaStreamMapChanged: function (handler) {
    _handlePeerMediaStreamMapChanged = handler;
  },
  onLocalMediaStreamChanged: function (handler) {
    _handleLocalMediaStreamChanged = handler;
  },

  //
  // Authentication feature
  //

  login: function (username) {
    console.log(`WebRTCGroupChatHelper: login as ${username}`);
    _login(username);
  },
  logout: function () {
    console.log(`WebRTCGroupChatHelper: logout`);
    _logout();
  },

  //
  // Chat room feature
  //

  createNewRoom: function (roomName) {
    _createNewRoom(roomName);
  },
  joinRoom: function (roomId) {
    _joinRoom(roomId);
  },
  leaveRoom: function () {
    _leaveRoom();
  },

  //
  // Media calling feature
  //

  // calling actions
  startCalling: function () {
    _startCalling();
  },
  hangUpCalling: function () {
    _hangUpCalling();
  },

  // media tracks enabling during media calling
  get localMicEnabled() {
    return _getLocalMediaTrackEnabled('audio');
  },
  set localMicEnabled(enabled) {
    _setLocalMediaTrackEnabled('audio', enabled);
  },
  get localCameraEnabled() {
    return _getLocalMediaTrackEnabled('video');
  },
  set localCameraEnabled(enabled) {
    _setLocalMediaTrackEnabled('video', enabled);
  },

  // media tracks' transceiver controlling during media calling
  get localMicMuted() {
    return _getLocalMediaTrackMuted('audio')
  },
  set localMicMuted(muted) {
    _setLocalMediaTrackMuted('audio', muted);
  },
  get localCameraMuted() {
    return _getLocalMediaTrackMuted('video')
  },
  set localCameraMuted(muted) {
    _setLocalMediaTrackMuted('video', muted);
  },

  //
  // Configurations customization feature
  //

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

  //
  // Internal states accessing feature
  //

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
