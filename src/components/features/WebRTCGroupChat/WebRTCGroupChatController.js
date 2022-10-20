/**
 *
 * WebRTCGroupChatController collects all WebRTC connection establishment logic including authtication,
 * peer connections management, (local && remote) media streams management, signaling, and ICE candidates management.
 *
 * The module's exported properties are designed to build any custom UI aiming to realize the real-time group-chatting feature
 */

import axios from "axios";
import SocketService from "./SocketService.js";
import FileDataStore from "./FileDataStore.js";
import FileDataUtil from "./FileDataUtil.js";

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

const _webSocketHost = location.hostname;
const _webSocketPort = "3002"; // websocket port number should same as mock express server port number
const _webSocketUrl = `ws://${_webSocketHost}:${_webSocketPort}`;

const _httpSignalTypeEnum = {
  // Session singals
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,
};

let _handleWebSocketOpened;
let _handleWebSocketClosed;

let _handleJoinRoomSuccess;
let _handleLeaveRoomSuccess;
let _handleRoomsUpdated;

let _handleCallingStateChanged;
let _handleNewPeerArivalExternally;

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
  _handleNewPeerArivalInternally(payload);
  // external usage
  if (_handleNewPeerArivalExternally) {
    _handleNewPeerArivalExternally(payload);
  }
}

function _handleSocketNewWebRTCPassthroughArival(payload) {
  console.log("WebRTCGroupChatController: WEBRTC_NEW_PASSTHROUGH signal received");
  // internal usage
  _handleNewPassthroughArival(payload);
}

function _handleSocketNewWebRTCPeerLeave(payload) {
  console.log("WebRTCGroupChatController: WEBRTC_NEW_PEER_LEAVE signal received");
  // internal usage
  _handleNewPeerLeave(payload);
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
      if (type === _httpSignalTypeEnum.LOG_IN_SUCCESS) {
        SocketService.createSocket(_webSocketUrl, _handleSocketOpen, _handleSocketClose);
        SocketService.registerMessageEvent(
          _webSocketUrl,
          SocketService.typeEnum.UPDATE_ROOMS,
          _handleSocketUpdateRooms
        );
        SocketService.registerMessageEvent(
          _webSocketUrl,
          SocketService.typeEnum.JOIN_ROOM_SUCCESS,
          _handleSocketJoinRoomSuccess
        );
        SocketService.registerMessageEvent(
          _webSocketUrl,
          SocketService.typeEnum.LEAVE_ROOM_SUCCESS,
          _handleSocketLeaveRoomSuccess
        );
        SocketService.registerMessageEvent(
          _webSocketUrl,
          SocketService.typeEnum.WEBRTC_NEW_PEER_ARIVAL,
          _handleSocketNewWebRTCPeerArival
        );
        SocketService.registerMessageEvent(
          _webSocketUrl,
          SocketService.typeEnum.WEBRTC_NEW_PASSTHROUGH,
          _handleSocketNewWebRTCPassthroughArival
        );
        SocketService.registerMessageEvent(
          _webSocketUrl,
          SocketService.typeEnum.WEBRTC_NEW_PEER_LEAVE,
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

function _logout() {
  _leaveRoom();

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
  peerMap: new Map(),
  has(key) {
    return this.peerMap.has(key);
  },
  size() {
    return this.peerMap.size;
  },
  set(key, value) {
    const prevSize = this.peerMap.size;
    this.peerMap.set(key, value);
    const curSize = this.peerMap.size;
    console.log(
      `WebRTCGroupChatController: _peerConnectionMap set executed, and its size changed from ${prevSize} to ${curSize}`
    );
  },
  get(key) {
    return this.peerMap.get(key);
  },
  getFirstKeyByValue: function (searchValue) {
    for (let [key, value] of this.peerMap.entries()) {
      if (value === searchValue) return key;
    }
  },
  delete(key) {
    const prevSize = this.peerMap.size;
    this.peerMap.delete(key);
    const curSize = this.peerMap.size;
    console.log(
      `WebRTCGroupChatController: _peerConnectionMap delete executed, and its size changed from ${prevSize} to ${curSize}`
    );
  },
  clear() {
    const prevSize = this.peerMap.size;
    this.peerMap.clear();
    const curSize = this.peerMap.size;
    console.log(
      `WebRTCGroupChatController: _peerConnectionMap clear executed, and its size changed from ${prevSize} to ${curSize}`
    );
  },
  forEach(func) {
    this.peerMap.forEach(func);
  },
};

function _handleNewPeerArivalInternally(payload) {
  const { userId: peerId, userIdList: peerIdList, isPolite: isNewPeerPolite } = payload;
  const peerIdValid = peerId && peerId.length > 0;
  const peerIdListValid = peerIdList && peerIdList.length > 0;

  if (peerIdValid && peerIdListValid) {
    console.log(
      `WebRTCGroupChatController: unexpected peerId ( ${peerId} ) and peerIdList ( ${peerIdList} ) during '_handleNewPeerArivalInternally' method`
    );
    return;
  }

  if (!peerIdValid && !peerIdListValid) {
    console.log(
      `WebRTCGroupChatController: unexpected peerId ( ${peerId} ) or peerIdList ( ${peerIdList} ) during '_handleNewPeerArivalInternally' method`
    );
    return;
  }

  const peerConnectionOfferCollisionSetup = (peerConnection, isNewPeerPolite) => {
    peerConnection.makingOffer = false;
    peerConnection.ignoreRemoteOffer = false;
    peerConnection.isSettingRemoteAnswerPending = false;
    peerConnection.isLocalPoliteDuringOfferCollision = !isNewPeerPolite;
  };

  if (peerIdValid) {
    const peerConnection = _locatePeerConnection(peerId);
    peerConnectionOfferCollisionSetup(peerConnection, isNewPeerPolite);
    return;
  }

  peerIdList.forEach((peerId) => {
    if (peerId && peerId.length > 0) {
      const peerConnection = _locatePeerConnection(peerId);
      peerConnectionOfferCollisionSetup(peerConnection, isNewPeerPolite);
    }
  });
}

function _handleNewPassthroughArival(payload) {
  const peerId = payload.from;
  const { sdp, iceCandidate } = payload;
  const isSDP = sdp !== undefined;
  const isICE = iceCandidate !== undefined;

  console.log(
    `WebRTCGroupChatController: does this passthrough carry sdp (${isSDP}${
      isSDP ? "-" + sdp.type : ""
    }) ? or ICE (${isICE}) ?`
  );

  if (!peerId || peerId.length === 0 || (!isSDP && !isICE)) {
    console.log(
      `WebRTCGroupChatController: unexpected new passthrough ( sdp: ${sdp}, iceCandidate: ${iceCandidate} ) for peerId of ${peerId}, during '_handleNewPassthroughArival' method`
    );
    return;
  }

  const peerConnection = _locatePeerConnection(peerId);
  if (!peerConnection) {
    console.log(
      `WebRTCGroupChatController: unexpected non-existent peer connection ( ${peerConnection} ) with peerId of ${peerId} after '_locatePeerConnection' method`
    );
    return;
  }

  console.log(
    `WebRTCGroupChatController: before consuming the new passthrough, the current peerConnection signalingState is ${
      peerConnection.signalingState
    }, the localDescription type is ${
      peerConnection.localDescription ? peerConnection.localDescription.type : "unknown"
    }, the remoteDescription type is ${
      peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
    }`
  );

  // distinguish the type of new passthrough, and then process it based on its type
  if (isSDP && isICE) {
    console.error(
      `WebRTCGroupChatController: unexpected new passthrough type, it cannot be both 'SDP' and 'ICE'`
    );
    return;
  }

  console.log(`WebRTCGroupChatController: start consuming the new passthrough ... ...`);

  if (isICE) {
    peerConnection
      .addIceCandidate(iceCandidate)
      .then(() => {
        console.log(
          `WebRTCGroupChatController: peerId (${peerId})'s 'addIceCandidate' done with no issue`
        );
      })
      .catch((error) => {
        // Suppress ignored offer's candidates
        if (!peerConnection.ignoreRemoteOffer) {
          console.error(`WebRTCGroupChatController: Found error with message of ${error}`);
        }
      });
    return;
  }

  const isPeerConnectionStable =
    peerConnection.signalingState == "stable" ||
    (peerConnection.signalingState == "have-local-offer" &&
      peerConnection.isSettingRemoteAnswerPending);
  const isPeerConnectionReadyForOffer = !peerConnection.makingOffer && isPeerConnectionStable;
  const isOfferCollision = sdp.type == "offer" && !isPeerConnectionReadyForOffer;

  if (isOfferCollision) {
    console.log(
      `WebRTCGroupChatController: an offer collision has happened ( signalingState: ${peerConnection.signalingState}, isSettingRemoteAnswerPending: ${peerConnection.isSettingRemoteAnswerPending}, makingOffer: ${peerConnection.makingOffer}, isPeerConnectionStable: ${isPeerConnectionStable}, sdp type: ${sdp.type} )`
    );
  }

  peerConnection.ignoreRemoteOffer =
    isOfferCollision && !peerConnection.isLocalPoliteDuringOfferCollision;

  if (peerConnection.ignoreRemoteOffer) {
    console.log(
      `WebRTCGroupChatController: the local peer ignore the ${sdp.type} typed SDP for peer connection of peerId ( ${peerId} ), during this offer collision`
    );
    return;
  }

  if (sdp.type == "answer") {
    peerConnection.isSettingRemoteAnswerPending = true;
  }

  console.log(
    `WebRTCGroupChatController: before setting 'setRemoteDescription', the remoteDescription is ${
      peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
    }`
  );

  peerConnection
    .setRemoteDescription(sdp) // SRD rolls back as needed
    .then(() => {
      console.log(
        `WebRTCGroupChatController: the local peer accept the ( ${sdp.type} ) typed SDP as a param of 'setRemoteDescription' for peer connection of peerId ( ${peerId} )`
      );
      console.log(
        `WebRTCGroupChatController: after setting 'setRemoteDescription', the remoteDescription is ${
          peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
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

      SocketService.emitMessageEvent(_webSocketUrl, SocketService.typeEnum.WEBRTC_NEW_PASSTHROUGH, {
        sdp: peerConnection.localDescription,
        userId: peerId,
      });
    })
    .catch((error) => {
      console.error(
        `WebRTCGroupChatController: Found an error with message of ${error} during 'setRemoteDescription' or 'setLocalDescription'`
      );
    });
}

function _handleNewPeerLeave(payload) {
  const peerId = payload.userId;
  if (!peerId || peerId.length === 0) {
    return;
  }

  _deletePeerTransceiver(peerId);
  _closePeerConnection(peerId);
}

function _locatePeerConnection(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatController: unexpected peerId ( ${peerId} ) during '_locatePeerConnection'`
    );
    return;
  }
  if (!_peerConnectionMap.has(peerId)) {
    const prevPeerIdsSize = _peerConnectionMap.size();
    _addPeerConnection(peerId);
    console.log(
      `WebRTCGroupChatController: after '_addPeerConnection' method, peer connection count changed from ${prevPeerIdsSize} to ${_peerConnectionMap.size()}`
    );
  }
  return _peerConnectionMap.get(peerId);
}

function _addPeerConnection(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatController: unexpected peerId of ${peerId} during creating and adding a new peer connection`
    );
    return;
  }
  const peerConnection = new RTCPeerConnection(_peerConnectionConfig);
  console.log(`WebRTCGroupChatController: a new 'RTCPeerConnection' is created`);

  _peerConnectionMap.set(peerId, peerConnection);

  peerConnection.onicecandidate = _handlePeerConnectionICECandidateEvent;
  peerConnection.oniceconnectionstatechange = _handlePeerConnectionICEConnectionStateChangeEvent;
  peerConnection.onnegotiationneeded = _handlePeerConnectionNegotiationEvent;
  peerConnection.ontrack = _handlePeerConnectionTrackEvent;
  peerConnection.ondatachannel = _handlePeerConnectionDataChannelEvent;
}

function _handlePeerConnectionICECandidateEvent(event) {
  if (!(event.target instanceof RTCPeerConnection)) {
    return;
  }

  const peerConnection = event.target;
  const peerId = _peerConnectionMap.getFirstKeyByValue(peerConnection);

  if (event.candidate) {
    SocketService.emitMessageEvent(_webSocketUrl, SocketService.typeEnum.WEBRTC_NEW_PASSTHROUGH, {
      iceCandidate: event.candidate,
      userId: peerId,
    });

    console.log(
      `WebRTCGroupChatController: a peer connection's 'onicecandidate' fired with a new ICE candidate, then it's sent from ${_selfId} to ${peerId}`
    );
  }
}

function _handlePeerConnectionICEConnectionStateChangeEvent(event) {
  if (!(event.target instanceof RTCPeerConnection)) {
    return;
  }

  const peerConnection = event.target;

  console.log(
    `WebRTCGroupChatController: a peer connection's 'oniceconnectionstatechange' fired with the state of '${peerConnection.iceConnectionState}'`
  );
}

function _handlePeerConnectionNegotiationEvent(event) {
  if (!(event.target instanceof RTCPeerConnection)) {
    return;
  }

  const peerConnection = event.target;
  const peerId = _peerConnectionMap.getFirstKeyByValue(peerConnection);

  console.log(
    `WebRTCGroupChatController: a peer connection's 'onnegotiationneeded' fired, maybe it's time to create a new SDP offer ? the current remoteDescription is ${
      peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
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
        `WebRTCGroupChatController: a new localDescription of type '${offer.type}' created to peerId of ${peerId} during 'onnegotiationneeded'`
      );
      console.log(
        `WebRTCGroupChatController: the current localDescription is ${
          peerConnection.localDescription.type
        }, the current remoteDescription is ${
          peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
        },  during 'onnegotiationneeded'`
      );

      SocketService.emitMessageEvent(_webSocketUrl, SocketService.typeEnum.WEBRTC_NEW_PASSTHROUGH, {
        sdp: offer,
        userId: peerId,
      });
    })
    .catch((error) => {
      console.error(`WebRTCGroupChatController: Found error with message of ${error}`);
    })
    .finally(() => {
      peerConnection.makingOffer = false;
    });
}

function _handlePeerConnectionTrackEvent(event) {
  if (!(event.target instanceof RTCPeerConnection) || !event.track || !event.transceiver) {
    console.log(
      `WebRTCGroupChatController: unexpected event target / track / transceiver during 'ontrack'`
    );
    return;
  }

  const peerConnection = event.target;
  const track = event.track;
  const transceiver = event.transceiver;
  const peerId = _peerConnectionMap.getFirstKeyByValue(peerConnection);

  if (!peerId) {
    console.log(`WebRTCGroupChatController: unexpected peerId ( ${peerId} ) during 'ontrack'`);
    return;
  }

  const incomingTrackKind = event.track.kind;

  _setupTransceiverMap(transceiver, incomingTrackKind, peerId);
  _setupTrackMuteEventHandlers(track, peerId);
  _respondToPeerWithEqualKindTrackIfNeeded(peerId, transceiver, incomingTrackKind);
}

function _closePeerConnection(peerId) {
  if (!peerId || peerId.length === 0) {
    console.log(`WebRTCGroupChatController: unexpected peerId when stopping peer side connection`);
    return;
  }

  const peerConnection = _peerConnectionMap.get(peerId);
  if (!peerConnection) return;

  peerConnection.close();
  _peerConnectionMap.delete(peerId);
}

function _closeALLPeerConnections() {
  _peerConnectionMap.forEach((peerConnection, peerId) => {
    if (peerConnection) {
      peerConnection.close();
      console.log(`WebRTCGroupChatController: the peerConnection with peerId of ${peerId} closed`);
    }
  });
  _peerConnectionMap.clear();
  console.log(`WebRTCGroupChatController: all peer connections cleared`);
}

/**
 * Peer Connection Data Channel
 */

 const MAXIMUM_MESSAGE_SIZE = 16384;
 const META_DATA_CHANNEL_LABEL = "META_DATA_CHANNEL_LABEL";
 const META_DATA_ACKNOWLEDGE = "META_DATA_ACKNOWLEDGE";
 const START_OF_FILE_MESSAGE = "START_OF_FILE_MESSAGE";
 const CANCEL_MESSAGE = "CANCEL_MESSAGE";

 // ( sender + receiver )
const _peerFileMetaDataChannelMap = createDataChannelMap();
const _peerFileDataChannelMap = createDataChannelMap();
function createDataChannelMap() {
  const dataChannelMap = {};

  dataChannelMap.peerMap = new Map();

  dataChannelMap.setChannel = function (peerId, label, channel) {
    let peerSpecificObject = dataChannelMap.peerMap.get(peerId);
    if (!peerSpecificObject) {
      peerSpecificObject = {};
    }
    peerSpecificObject[label] = channel;

    dataChannelMap.peerMap.set(peerId, peerSpecificObject);

    console.log(
      `WebRTCGroupChatController: a new channel of`,
      channel,
      `with a label (${label})`,
      `is set to the dataChannelMap`,
      dataChannelMap
    );
  };

  dataChannelMap.getChannel = function (peerId, label) {
    if (!dataChannelMap.peerMap.has(peerId)) {
      return null;
    }
    return dataChannelMap.peerMap.get(peerId)[label];
  };

  dataChannelMap.hasChannel = function (peerId, label) {
    let peerSpecificObject = dataChannelMap.peerMap.get(peerId);
    if (!peerSpecificObject) {
      return false;
    }
    if (!peerSpecificObject[label]) {
      return false;
    }
    return true;
  };

  return dataChannelMap;
}

// ( sender )
const _peerSendFileCallbackQueueMap = {
  peerMap: new Map(),
  shiftSendFileCallbackFromPeer(peerId) {
    let sendFileCallbackQueue = this.peerMap.get(peerId);
    if (!sendFileCallbackQueue) {
      sendFileCallbackQueue = [];
    }
    return sendFileCallbackQueue.shift();
  },
  pushSendFileCallbackToPeer(peerId, sendFileCallback) {
    let sendFileCallbackQueue = this.peerMap.get(peerId);
    if (!sendFileCallbackQueue) {
      sendFileCallbackQueue = [];
    }
    sendFileCallbackQueue.push(sendFileCallback);
    this.peerMap.set(peerId, sendFileCallbackQueue);
  },
};

// ( sender )
function _sendFileToAllPeer(files) {
  _peerConnectionMap.forEach((_, peerId) => {
    _sendFileToPeer(files, peerId);
  });
}

// ( sender )
async function _sendFileToPeer(files, peerId) {
  if (!files) {
    console.log(
      `WebRTCGroupChatController: unexpected files ( ${files} ) during file meta data sending`
    );
    return;
  }

  // transform the files into a file hash to file object
  const fileHashToFile = await FileDataUtil.getUniqueFiles(files);

  FileDataStore.prepareSendingMetaData(fileHashToFile);

  // transform the file hash to file object into a file hash to file meta data object
  const fileHashToMetaData = Object.keys(fileHashToFile).reduce((accumulator, fileHash) => {
    const { name, type, size } = fileHashToFile[fileHash];
    accumulator[fileHash] = { name, type, size };
    return accumulator;
  }, {});

  console.log(
    `WebRTCGroupChatController: the input files of`,
    files,
    `has been finnally converted into a file hash to file meta data object of`,
    fileHashToMetaData
  );

  // create and store a data channel to transfer the prepared file hash to file meta data object
  const fileMetaDataChannel = _createAndStoreDataChannel(
    peerId,
    META_DATA_CHANNEL_LABEL,
    () => {
      if (fileMetaDataChannel.readyState === "open") {
        fileMetaDataChannel.send(JSON.stringify(fileHashToMetaData));

        console.log(
          `WebRTCGroupChatController: the file hash to meta data object of `,
          fileHashToMetaData,
          `has been sent to a peer (${peerId})`
        );
      }
    },
    (event) => {
      const { data } = event;
      if (data === META_DATA_ACKNOWLEDGE) {
        _sendFileDataToPeer(files, peerId);
      }
    },
    (event) => {},
    (event) => {
      _handleChannelClose(event, peerId);
    }
  );
}

// ( sender )
async function _sendFileDataToPeer(files, peerId) {
  if (!files) {
    console.log(`WebRTCGroupChatController: unfound files during file data sending`);
    return;
  }

  const fileHashToFile = await FileDataUtil.getUniqueFiles(files);
  const checkingPassed = FileDataStore.checkIfSendingMetaDataPrepared(fileHashToFile);
  if (!checkingPassed) {
    console.log(
      `WebRTCGroupChatController: unexpected file hash to file of`,
      fileHashToFile,
      `because it cannot pass file hash to meta data preparation checking during file data sending`
    );
    return;
  }

  Object.keys(fileHashToFile).forEach((fileHash) => {
    if (!FileDataStore.getSendingProgress(peerId, fileHash)) {
      const sendFileCallback = () => {
        if (FileDataStore.getSendingCancelled(peerId, fileHash)) {
          _handleSenderChannelClose(peerId);
          return;
        }
        const label = `file-${fileHash}`;
        const file = fileHashToFile[fileHash];
        FileDataStore.resetSendingProgress(peerId, fileHash);
        const fileDataChannel = _createAndStoreDataChannel(
          peerId,
          label,
          (event) => {
            _handleChannelOpen(event, fileDataChannel);
          },
          null,
          (event) => {
            _handleSenderChannelBufferedAmountLow(event, peerId, fileDataChannel, fileHash, file);
          },
          () => {
            _handleSenderChannelClose(peerId);
          }
        );
        fileDataChannel.binaryType = "arraybuffer";
      };

      _peerSendFileCallbackQueueMap.pushSendFileCallbackToPeer(peerId, sendFileCallback);
    }
  });

  const sendFileCallback = _peerSendFileCallbackQueueMap.shiftSendFileCallbackFromPeer(peerId);
  if (sendFileCallback) {
    FileDataStore.setSendingStatus(peerId, true);
    sendFileCallback();
  }
}

// ( sender )
function _createAndStoreDataChannel(
  peerId,
  label,
  onOpenHandler,
  onMessageHandler,
  onBufferedAmountLowHandler,
  onCloseHandler
) {
  if (!peerId || peerId.length === 0 || !label || label.length === 0) {
    console.log(
      `WebRTCGroupChatController: unexpected peerId( ${peerId} ) / label( ${label} ) during data channel creating`
    );
    return;
  }
  const peerConnection = _peerConnectionMap.get(peerId);
  if (!peerConnection) {
    console.log(
      `WebRTCGroupChatController: unfound peer connection of peer( ${peerId} ) during data channel creating`
    );
    return;
  }

  const dataChannel = peerConnection.createDataChannel(label);

  if (onOpenHandler) {
    dataChannel.onopen = onOpenHandler;
  }
  if (onMessageHandler) {
    dataChannel.onmessage = onMessageHandler;
  }
  if (onBufferedAmountLowHandler) {
    dataChannel.onbufferedamountlow = onBufferedAmountLowHandler;
  }
  if (onCloseHandler) {
    dataChannel.onclose = onCloseHandler;
  }

  if (label === META_DATA_CHANNEL_LABEL) {
    _peerFileMetaDataChannelMap.setChannel(peerId, label, dataChannel);
  } else {
    _peerFileDataChannelMap.setChannel(peerId, label, dataChannel);
  }

  return dataChannel;
}

// ( sender )
async function _handleSenderChannelBufferedAmountLow(event, peerId, dataChannel, fileHash, file) {
  const offset = FileDataStore.getSendingProgress(peerId, fileHash);
  if (offset >= file.size) {
    return;
  }

  const newOffset = await _sendChunk(file, offset, dataChannel);
  FileDataStore.setSendingProgress(peerId, fileHash, newOffset);

  if (newOffset >= file.size) {
    dataChannel.close();
  }
}

// ( sender )
async function _sendChunk(file, offset, dataChannel) {
  const chunk = file.slice(offset, offset + MAXIMUM_MESSAGE_SIZE);
  const buffer = await chunk.arrayBuffer();

  if (dataChannel.readyState !== "open") {
    return offset;
  }

  dataChannel.send(buffer);
  return offset + chunk.size;
}

// ( sender )
function _handleSenderChannelClose(peerId) {
  const sendFileCallback = _peerSendFileCallbackQueueMap.shiftSendFileCallbackFromPeer(peerId);

  if (!sendFileCallback) {
    FileDataStore.setSendingStatus(peerId, false);
    return;
  }

  sendFileCallback();
}

// ( sender )
function _cancelSenderSendingOperationToAllPeer(fileHash) {
  _peerConnectionMap.forEach((_, peerId) => {
    _cancelSenderSendingOperation(peerId, fileHash);
  });
}

// ( sender )
function _cancelSenderSendingOperation(peerId, fileHash) {
  const dataChannelLabel = `file-${fileHash}`;
  const dataChannel = _peerFileDataChannelMap.getChannel(peerId, dataChannelLabel);
  FileDataStore.resetSendingProgress(peerId, fileHash);

  FileDataStore.setSendingCancelled(peerId, fileHash, true);
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(CANCEL_MESSAGE);
    dataChannel.close();
  }
}

// ( sender + receiver )
function _handleChannelOpen(event, dataChannel) {
  dataChannel.send(START_OF_FILE_MESSAGE);
}

// ( sender + receiver )
function _handleChannelClose(event, peerId) {
  const { target: dataChannel } = event;

  if (!(dataChannel instanceof RTCDataChannel)) {
    console.log(
      `WebRTCGroupChatController: unexpected event target type, it is not 'RTCDataChannel' typed`
    );
    return;
  }

  const label = dataChannel.label;

  dataChannel.close();

  console.log(
    `WebRTCGroupChatController: the (${label}) labelled channel for a peer (${peerId}) heard close event and has been closed`
  );
}

// ( receiver )
function _handlePeerConnectionDataChannelEvent(event) {
  const {
    channel,
    channel: { label },
    target: peerConnection,
  } = event;

  console.log(`WebRTCGroupChatController: 'ondatachannel' fired with a label ${label}`);

  const peerId = _peerConnectionMap.getFirstKeyByValue(peerConnection);

  if (label === META_DATA_CHANNEL_LABEL) {
    _peerFileMetaDataChannelMap.setChannel(peerId, label, channel);
    channel.onmessage = (event) => {
      _handleReceiverChannelFileMetaDataMessage(event, peerId, label);
    };
  } else {
    _peerFileDataChannelMap.setChannel(peerId, label, channel);
    channel.onmessage = (event) => {
      _handleReceiverChannelFileDataMessage(event, peerId);
    };
  }
  channel.onclose = (event) => {
    _handleChannelClose(event, peerId)
  }
}

// ( receiver )
function _handleReceiverChannelFileMetaDataMessage(event, peerId, label) {
  const { data } = event;

  if (typeof data !== "string") {
    console.log(`WebRTCGroupChatController: unexpected 'data' type, it is not type of 'string'`);
    return;
  }

  const fileHashToMetaData = JSON.parse(data);

  console.log(
    `WebRTCGroupChatController: the '${
      label ? label : "unknown"
    }' labeled data channel's 'onmessage' fired with a file hash to meta data object of `,
    fileHashToMetaData
  );

  FileDataStore.mergeReceivingHashToMetaData(peerId, fileHashToMetaData);

  // meta data acknowledge
  if (_peerFileMetaDataChannelMap.hasChannel(peerId, label)) {
    const senderChannel = _peerFileMetaDataChannelMap.getChannel(peerId, label);
    if (senderChannel.readyState === "open") {
      senderChannel.send(META_DATA_ACKNOWLEDGE);
      senderChannel.close();
    }
  }
}

// ( receiver )
async function _handleReceiverChannelFileDataMessage(event, peerId) {
  const { data, target: dataChannel } = event;
  if (!(dataChannel instanceof RTCDataChannel)) {
    console.log(
      `WebRTCGroupChatController: unexpected event target type, it is not 'RTCDataChannel' typed`
    );
    return;
  }

  const label = dataChannel.label;
  const fileHash = label.split("-")?.[1];

  if (data === START_OF_FILE_MESSAGE) {
    FileDataStore.resetReceivingBufferList(peerId, fileHash);
  } else if (data === CANCEL_MESSAGE) {
    _cancelReceiverReceivingOperation(peerId, fileHash);
  } else {
    if (data instanceof ArrayBuffer) {
      FileDataStore.addReceivingBuffer(peerId, fileHash, data);
    } else if (data instanceof Blob) {
      FileDataStore.addReceivingBuffer(peerId, fileHash, await data.arrayBuffer());
    }
  }
}

// ( receiver )
function _cancelReceiverReceivingOperation(peerId, fileHash) {
  FileDataStore.resetReceivingBufferList(peerId, fileHash);
}

/**
 * Media Streams management
 */

let _mediaStreamConstraints = {
  video: true,
  audio: true,
};
let _localMediaStream;
const _peerMediaStreamMap = {
  peerMap: new Map(), // [[ peerId, { mediaStream } ], ...]
  has(key) {
    return this.peerMap.has(key);
  },
  hasKindOfTrack(peerId, trackKind) {
    const mediaStream = this.peerMap.get(peerId);
    if (!mediaStream) {
      return false;
    }
    mediaStream.getTracks().forEach((existTrack) => {
      if (existTrack === trackKind) {
        return true;
      }
    });
    return false;
  },
  size() {
    return this.peerMap.size;
  },
  get(key) {
    return this.peerMap.get(key);
  },
  clear() {
    const prevSize = this.peerMap.size;
    this.peerMap.clear();
    const curSize = this.peerMap.size;
    console.log(
      `WebRTCGroupChatController: _peerMediaStreamMap clear executed, and its size changed from ${prevSize} to ${curSize}`
    );

    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(this);
    }
  },

  deleteTrack(peerId, kind) {
    if (!this.peerMap.get(peerId)) {
      return;
    }
    const oldMediaStream = this.peerMap.get(peerId);
    const newMediaStream = new MediaStream();

    oldMediaStream.getTracks().forEach((existTrack) => {
      if (existTrack.kind !== kind) {
        newMediaStream.addTrack(existTrack);
      }
    });

    console.log(
      `WebRTCGroupChatController: a media stream's tracks count changed from ${
        oldMediaStream.getTracks().length
      } to ${newMediaStream.getTracks().length}`
    );

    if (newMediaStream.getTracks().length === 0) {
      const prevSize = this.peerMap.size;
      this.peerMap.delete(peerId);
      const curSize = this.peerMap.size;
      console.log(
        `WebRTCGroupChatController: _peerMediaStreamMap delete executed, and its size changed from ${prevSize} to ${curSize}`
      );
    } else {
      this.peerMap.set(peerId, newMediaStream);
    }

    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(this);
    }
  },

  setTrack(peerId, track) {
    if (!(track instanceof MediaStreamTrack)) return;

    const prevSize = this.peerMap.size;

    if (!this.peerMap.get(peerId)) {
      this.peerMap.set(peerId, new MediaStream());
    }

    const oldMediaStream = this.peerMap.get(peerId);

    const newMediaStream = new MediaStream();
    oldMediaStream.getTracks().forEach((existTrack) => {
      if (existTrack.kind !== track.kind) {
        newMediaStream.addTrack(existTrack);
      }
    });
    newMediaStream.addTrack(track);
    this.peerMap.set(peerId, newMediaStream);

    console.log(
      `WebRTCGroupChatController: _peerMediaStreamMap size changed from ${prevSize} to ${this.peerMap.size}`
    );

    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(this);
    }
  },
};
const _audioTransceiverMap = new Map();
const _videoTransceiverMap = new Map();

let _handlePeerMediaStreamMapChanged;
let _handleLocalMediaStreamChanged;

async function _createLocalMediaStream() {
  console.log(`WebRTCGroupChatController: start to create local media stream`);
  return navigator.mediaDevices.getUserMedia(_mediaStreamConstraints).then((mediaStream) => {
    console.log(`WebRTCGroupChatController: local media stream created`);
    _localMediaStream = mediaStream;
    if (_handleLocalMediaStreamChanged) {
      _handleLocalMediaStreamChanged(mediaStream);
    }
  });
}

function _addLocalMediaStream() {
  if (!_localMediaStream) {
    console.log(
      `WebRTCGroupChatController: unexpected _localMediaStream of ${_localMediaStream} when adding local media stream to peer connection (peerId: ${peerId})`
    );
    return;
  }

  _peerConnectionMap.forEach((peerConnection, peerId) => {
    _localMediaStream.getTracks().forEach((track, index) => {
      console.log(
        `WebRTCGroupChatController: add (trackId: ${track.id}) (kind: ${track.kind}) track of local media stream to a peer connection to ${peerId}`
      );
      peerConnection.addTrack(track, _localMediaStream);
    });
  });
}

function _handleIncomingTrackUnmute(event, peerId) {
  console.log(
    `WebRTCGroupChatController: a track from the peer ( ${peerId} ) is available to use, because it's been added by that peer`
  );
  const track = event.target;
  _peerMediaStreamMap.setTrack(peerId, track);
}

function _handleIncomingTrackMute(event, peerId) {
  console.log(
    `WebRTCGroupChatController: a track from the peer ( ${peerId} ) is unavailable to use, because it's been removed by that peer`
  );
  const track = event.target;
  _peerMediaStreamMap.deleteTrack(peerId, track.kind);
}

function _setupTransceiverMap(transceiver, incomingTrackKind, peerId) {
  if (
    !transceiver ||
    !incomingTrackKind ||
    incomingTrackKind.length === 0 ||
    !peerId ||
    peerId.length === 0
  ) {
    console.log(
      `WebRTCGroupChatController: unexpected transceiver/incomingTrackKind/peerId during transceiver map setup`
    );
    return;
  }

  if (incomingTrackKind === "video") {
    _videoTransceiverMap.set(peerId, transceiver);
    console.log(`WebRTCGroupChatController: a new video transceiver received and stored`);
  } else if (incomingTrackKind === "audio") {
    _audioTransceiverMap.set(peerId, transceiver);
    console.log(`WebRTCGroupChatController: a new audio transceiver received and stored`);
  }
}

function _deletePeerTransceiver(peerId) {
  if (!peerId || peerId.length === 0) {
    return;
  }

  _audioTransceiverMap.delete(peerId);
  console.log(`WebRTCGroupChatController: an audio transceiver of peer ( ${peerId} ) deleted`);

  _videoTransceiverMap.delete(peerId);
  console.log(`WebRTCGroupChatController: a video transceiver of peer ( ${peerId} ) deleted`);
}

function _clearAllPeerTransceivers() {
  _audioTransceiverMap.clear();
  _videoTransceiverMap.clear();
  console.log(`WebRTCGroupChatController: all audio/video transceivers cleared`);
}

function _respondToPeerWithEqualKindTrackIfNeeded(peerId, transceiver, incomingTrackKind) {
  if (
    !_localMediaStream ||
    !peerId ||
    peerId.length === 0 ||
    !incomingTrackKind ||
    !_peerConnectionMap.has(peerId) ||
    !transceiver
  ) {
    return;
  }

  const isNeeded = transceiver.sender.track === null;
  if (!isNeeded) {
    return;
  }

  const peerConnection = _peerConnectionMap.get(peerId);
  _localMediaStream.getTracks().forEach((localTrack) => {
    if (localTrack.kind === incomingTrackKind) {
      peerConnection.addTrack(localTrack, _localMediaStream);
    }
  });
}

function _setupTrackMuteEventHandlers(track, peerId) {
  if (!track || !peerId || peerId.length === 0) {
    console.log(
      `WebRTCGroupChatController: unexpected track / peerId during track Mute/Unmute event handler binding`
    );
    return;
  }

  track.onunmute = (event) => {
    _handleIncomingTrackUnmute(event, peerId);
  };
  track.onmute = (event) => {
    _handleIncomingTrackMute(event, peerId);
  };
}

//
// TODO: it needs signal server to route the message
//
function _triggerOneRemoteMuteForLocalTracks(peerId) {
  const peerConnection = _peerConnectionMap.get(peerId);
  if (!peerConnection || !peerConnection.getTransceivers()) {
    return;
  }

  peerConnection.getTransceivers().forEach((transceiver) => {
    const sender = transceiver.sender;
    if (sender) {
      peerConnection.removeTrack(sender);
    }
  });
}

function _triggerAllRemoteMuteForLocalTracks() {
  _peerConnectionMap.forEach((peerConnection) => {
    peerConnection.getTransceivers().forEach((transceiver) => {
      const sender = transceiver.sender;
      if (sender) {
        peerConnection.removeTrack(sender);
      }
    });
  });
}

function _stopLocalTracks() {
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

function _getLocalMediaTrackEnabled(trackKind) {
  let trackEnabled = false;

  if (!_localMediaStream) {
    return trackEnabled;
  }

  let track;
  if (trackKind === "audio" && _localMediaStream.getAudioTracks()) {
    track = _localMediaStream.getAudioTracks()[0];
  } else if (trackKind === "video" && _localMediaStream.getVideoTracks()) {
    track = _localMediaStream.getVideoTracks()[0];
  }

  if (!track) {
    console.error(
      `WebRTCGroupChatController: unexpected empty track when 'get' enabling ( ${trackKind} ) kind of local media device`
    );
    return trackEnabled;
  }

  trackEnabled = track.enabled;
  return trackEnabled;
}

function _setLocalMediaTrackEnabled(trackKind, enabled) {
  if (!_localMediaStream) {
    console.error(
      `WebRTCGroupChatController: unexpected empty _localMediaStream when 'set' enabling ( ${trackKind} ) kind of local media device`
    );
    return;
  }

  let track;
  if (trackKind === "audio" && _localMediaStream.getAudioTracks()) {
    track = _localMediaStream.getAudioTracks()[0];
  } else if (trackKind === "video" && _localMediaStream.getVideoTracks()) {
    track = _localMediaStream.getVideoTracks()[0];
  }

  if (!track) {
    console.error(
      `WebRTCGroupChatController: unexpected empty track when enabling ( ${trackKind} ) kind of local media device`
    );
    return;
  }
  track.enabled = enabled;
}

function _getLocalMediaTrackMuted(trackKind) {
  let isLocalMediaTrackMuted = true;

  if (trackKind === "audio") {
    _audioTransceiverMap.forEach((audioTransceiver) => {
      switch (audioTransceiver.currentDirection) {
        case "sendrecv":
        case "sendonly":
          isLocalMediaTrackMuted = false;
          return;
        default:
          break;
      }
    });
  } else if (trackKind === "video") {
    _videoTransceiverMap.forEach((videoTransceiver, peerId) => {
      switch (videoTransceiver.currentDirection) {
        case "sendrecv":
        case "sendonly":
          isLocalMediaTrackMuted = false;
          return;
        default:
          break;
      }
    });
  }

  return isLocalMediaTrackMuted;
}

function _setLocalMediaTrackMuted(trackKind, muted) {
  if (trackKind === "audio") {
    _audioTransceiverMap.forEach((audioTransceiver) => {
      if (audioTransceiver) {
        audioTransceiver.direction = muted ? "recvonly" : "sendrecv";
      }
    });
  } else if (trackKind === "video") {
    _videoTransceiverMap.forEach((videoTransceiver) => {
      if (videoTransceiver) {
        videoTransceiver.direction = muted ? "recvonly" : "sendrecv";
      }
    });
  }
}

/**
 * Calling management
 */

let _isCalling = false;

function _changeCallingState(toCalling) {
  console.log(`WebRTCGroupChatController: change calling state to toCalling of ${toCalling}`);

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
  _createLocalMediaStream().then(_addLocalMediaStream, (error) => {
    console.log(
      `WebRTCGroupChatController: met error of ${error} when creating local media stream`
    );
    _changeCallingState(false);
  });
}

function _hangUpCalling() {
  _changeCallingState(false);
  _triggerAllRemoteMuteForLocalTracks();
  _stopLocalTracks();
}

/**
 * Chat room management
 */

function _createNewRoom(roomName) {
  if (roomName.length > 0) {
    SocketService.emitMessageEvent(_webSocketUrl, SocketService.typeEnum.CREATE_ROOM, {
      roomName: roomName,
    });
  }
}

function _joinRoom(roomId) {
  if (roomId.length > 0) {
    SocketService.emitMessageEvent(_webSocketUrl, SocketService.typeEnum.JOIN_ROOM, {
      roomId: roomId,
    });
  }
}

function _leaveRoom() {
  if (_isCalling) {
    _hangUpCalling();
  }

  _clearAllPeerTransceivers();
  _closeALLPeerConnections();

  SocketService.emitMessageEvent(_webSocketUrl, SocketService.typeEnum.LEAVE_ROOM, {});
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
    console.log(`WebRTCGroupChatController: login as ${username}`);
    _login(username);
  },
  logout: function () {
    console.log(`WebRTCGroupChatController: logout`);
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
    return _getLocalMediaTrackEnabled("audio");
  },
  set localMicEnabled(enabled) {
    _setLocalMediaTrackEnabled("audio", enabled);
  },
  get localCameraEnabled() {
    return _getLocalMediaTrackEnabled("video");
  },
  set localCameraEnabled(enabled) {
    _setLocalMediaTrackEnabled("video", enabled);
  },

  // media tracks' transceiver controlling during media calling
  get localMicMuted() {
    return _getLocalMediaTrackMuted("audio");
  },
  set localMicMuted(muted) {
    _setLocalMediaTrackMuted("audio", muted);
  },
  get localCameraMuted() {
    return _getLocalMediaTrackMuted("video");
  },
  set localCameraMuted(muted) {
    _setLocalMediaTrackMuted("video", muted);
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
  // File Transceiving
  //

  async createFileHashToFileObject(files) {
    const fileHashToFileObject = await FileDataUtil.getUniqueFiles(files);
    return fileHashToFileObject;
  },

  // send file to all peers
  sendFileToAllPeer(files) {
    _sendFileToAllPeer(files);
  },

  // cancel sending
  cancelSendingOperationToAllPeer(fileHash) {
    _cancelSenderSendingOperationToAllPeer(fileHash);
  },

  // slice keys to referring data for UI modeling
  get fileSendingSliceContainerKey() {
    return FileDataStore.sendingSliceContainerKey;
  },
  get fileSendingMetaDataSliceKey() {
    return FileDataStore.sendingMetaDataSliceKey;
  },
  get fileSendingMinProgressSliceKey() {
    return FileDataStore.sendingMinProgressSliceKey;
  },
  get fileReceivingSliceContainerKey() {
    return FileDataStore.receivingSliceContainerKey;
  },
  get fileReceivingMetaDataSliceKey() {
    return FileDataStore.receivingMetaDataSliceKey;
  },
  get fileReceivingBufferSliceKey() {
    return FileDataStore.receivingBufferSliceKey;
  },
  get fileReceivingProgressSliceKey() {
    return FileDataStore.receivingProgressSliceKey;
  },

  // listeners for UI modeling
  onFileSendingRelatedDataChanged: function (handler) {
    FileDataStore.onSendingRelatedDataChanged(handler);
  },
  onFileReceivingRelatedDataChanged: function (handler) {
    FileDataStore.onReceivingRelatedDataChanged(handler);
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
