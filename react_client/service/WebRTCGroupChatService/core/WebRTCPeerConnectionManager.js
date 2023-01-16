import WebRTCDataChannelManager from "./WebRTCDataChannelManager.js";
import WebRTCMediaCallingManager from "./WebRTCMediaCallingManager.js";
import WebRTCSignalingManager from "./WebRTCSignalingManager.js";

let _peerConnectionConfig = {
  iceServers: [
    {
      username: "mingdongshensen",
      credential: "123456",
      urls: "turn:81.68.228.106:3478",
    },
  ],
};

function _changePeerConnectionConfig(config) {
  const passChecking = _checkPeerConnectionConfig(config);
  if (!passChecking) return;
  _peerConnectionConfig = config;
}

const _peerConnectionMap = {
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
    console.debug(
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
    console.debug(
      `WebRTCGroupChatController: _peerConnectionMap delete executed, and its size changed from ${prevSize} to ${curSize}`
    );
  },
  clear() {
    const prevSize = this.peerMap.size;
    this.peerMap.clear();
    const curSize = this.peerMap.size;
    console.debug(
      `WebRTCGroupChatController: _peerConnectionMap clear executed, and its size changed from ${prevSize} to ${curSize}`
    );
  },
  forEach(func) {
    this.peerMap.forEach(func);
  },
};

function _handleNewPeerArivalInternally(payload) {
  const {
    userId: peerId,
    userName: peerName,
    userContainer: peerContainer,
    isPolite: isNewPeerPolite,
  } = payload;
  const peerIdValid = peerId && peerId.length > 0;
  const peerContainerValid = peerContainer && Object.keys(peerContainer).length > 0;

  if (peerIdValid && peerContainerValid) {
    console.debug(
      `WebRTCGroupChatController: unexpected peerId ( ${peerId} ) and peerContainerValid ( ${peerContainer} ) during '_handleNewPeerArivalInternally' method`
    );
    return;
  }

  if (!peerIdValid && !peerContainerValid) {
    console.debug(
      `WebRTCGroupChatController: unexpected peerId ( ${peerId} ) or peerContainer ( ${peerContainer} ) during '_handleNewPeerArivalInternally' method`
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
    const peerConnection = _locatePeerConnection(peerId, peerName);
    peerConnectionOfferCollisionSetup(peerConnection, isNewPeerPolite);
    return;
  }

  Object.entries(peerContainer).forEach(([peerId, peerName]) => {
    if (peerId && peerId.length > 0) {
      const peerConnection = _locatePeerConnection(peerId, peerName);
      peerConnectionOfferCollisionSetup(peerConnection, isNewPeerPolite);
    }
  });
}

function _handleNewPassthroughArival(payload) {
  const peerId = payload.from;
  const { sdp, iceCandidate, callingConstraints } = payload;
  const isSDP = sdp !== undefined;
  const isICE = iceCandidate !== undefined;

  console.debug(
    `WebRTCGroupChatController: does this passthrough carry sdp (${isSDP}${
      isSDP ? "-" + sdp.type : ""
    }) ? or ICE (${isICE}) ?`
  );

  if (!peerId || peerId.length === 0 || (!isSDP && !isICE)) {
    console.debug(
      `WebRTCGroupChatController: unexpected new passthrough ( sdp: ${sdp}, iceCandidate: ${iceCandidate} ) for peerId of ${peerId}, during '_handleNewPassthroughArival' method`
    );
    return;
  }

  const peerConnection = _locatePeerConnection(peerId);
  if (!peerConnection) {
    console.debug(
      `WebRTCGroupChatController: unexpected non-existent peer connection ( ${peerConnection} ) with peerId of ${peerId} after '_locatePeerConnection' method`
    );
    return;
  }

  console.debug(
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

  console.debug(`WebRTCGroupChatController: start consuming the new passthrough ... ...`);

  if (isICE) {
    peerConnection
      .addIceCandidate(iceCandidate)
      .then(() => {
        console.debug(
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
    console.debug(
      `WebRTCGroupChatController: an offer collision has happened ( signalingState: ${peerConnection.signalingState}, isSettingRemoteAnswerPending: ${peerConnection.isSettingRemoteAnswerPending}, makingOffer: ${peerConnection.makingOffer}, isPeerConnectionStable: ${isPeerConnectionStable}, sdp type: ${sdp.type} )`
    );
  }

  peerConnection.ignoreRemoteOffer =
    isOfferCollision && !peerConnection.isLocalPoliteDuringOfferCollision;

  if (peerConnection.ignoreRemoteOffer) {
    console.debug(
      `WebRTCGroupChatController: the local peer ignore the ${sdp.type} typed SDP for peer connection of peerId ( ${peerId} ), during this offer collision`
    );
    return;
  }

  if (sdp.type == "answer") {
    peerConnection.isSettingRemoteAnswerPending = true;
  }

  if (callingConstraints) {
    console.debug(`callingConstraints:`, callingConstraints);
    peerConnection.callingConstraints = callingConstraints;
  }

  console.debug(
    `WebRTCGroupChatController: before setting 'setRemoteDescription', the remoteDescription is ${
      peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
    }`
  );

  peerConnection
    .setRemoteDescription(sdp) // SRD rolls back as needed
    .then(() => {
      console.debug(
        `WebRTCGroupChatController: the local peer accept the ( ${sdp.type} ) typed SDP as a param of 'setRemoteDescription' for peer connection of peerId ( ${peerId} )`
      );
      console.debug(
        `WebRTCGroupChatController: after setting 'setRemoteDescription', the remoteDescription is ${
          peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
        }`
      );

      // remote description is answer
      if (sdp.type == "answer") {
        peerConnection.isSettingRemoteAnswerPending = false;
        return;
      }

      // remote description is offer
      return peerConnection.setLocalDescription();
    })
    .then(() => {
      if (sdp.type == "answer") {
        return;
      }
      WebRTCSignalingManager.passThroughSignaling({
        sdp: peerConnection.localDescription,
        to: peerId,
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

  WebRTCMediaCallingManager.deletePeerTransceiver(peerId);
  _closePeerConnection(peerId);
}

function _locatePeerConnection(peerId, peerName) {
  if (!peerId || peerId.length === 0) {
    console.debug(
      `WebRTCGroupChatController: unexpected peerId ( ${peerId} ) during '_locatePeerConnection'`
    );
    return;
  }
  if (!_peerConnectionMap.has(peerId)) {
    const prevPeerIdsSize = _peerConnectionMap.size();
    _addPeerConnection(peerId, peerName);
    console.debug(
      `WebRTCGroupChatController: after '_addPeerConnection' method, peer connection count changed from ${prevPeerIdsSize} to ${_peerConnectionMap.size()}`
    );
  }
  return _peerConnectionMap.get(peerId);
}

function _addPeerConnection(peerId, peerName) {
  if (!peerId || peerId.length === 0) {
    console.debug(
      `WebRTCGroupChatController: unexpected peerId of ${peerId} during creating and adding a new peer connection`
    );
    return;
  }
  const peerConnection = new RTCPeerConnection(_peerConnectionConfig);
  console.debug(`WebRTCGroupChatController: a new 'RTCPeerConnection' is created`);

  peerConnection.peerName = peerName;

  _peerConnectionMap.set(peerId, peerConnection);

  peerConnection.onicecandidate = (event) => {
    _handlePeerConnectionICECandidateEvent(event, peerId);
  };
  peerConnection.oniceconnectionstatechange = _handlePeerConnectionICEConnectionStateChangeEvent;
  peerConnection.onnegotiationneeded = _handlePeerConnectionNegotiationEvent;
  peerConnection.ondatachannel = (event) => {
    WebRTCDataChannelManager.handlePeerConnectionDataChannelEvent(event, peerId, peerName);
  };

  peerConnection.ontrack = (event) => {
    WebRTCMediaCallingManager.handlePeerConnectionTrackEvent(event, peerId, peerConnection);
  };
  WebRTCMediaCallingManager.addLocalTracksIfPossible(peerId, peerConnection);
}

function _handlePeerConnectionICECandidateEvent(event, peerId) {
  if (event.candidate) {
    WebRTCSignalingManager.passThroughSignaling({
      iceCandidate: event.candidate,
      to: peerId,
    });
    console.debug(
      `WebRTCGroupChatController: a peer connection's 'onicecandidate' fired with a new ICE candidate, then it's sent to ${peerId}`
    );
  }
}

function _handlePeerConnectionICEConnectionStateChangeEvent(event) {
  if (!(event.target instanceof RTCPeerConnection)) {
    return;
  }
  const peerConnection = event.target;
  console.debug(
    `WebRTCGroupChatController: a peer connection's 'oniceconnectionstatechange' fired with the state of '${peerConnection.iceConnectionState}'`
  );
}

function _handlePeerConnectionNegotiationEvent(event) {
  if (!(event.target instanceof RTCPeerConnection)) {
    return;
  }

  const peerConnection = event.target;
  const peerId = _peerConnectionMap.getFirstKeyByValue(peerConnection);

  console.debug(
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

      console.debug(
        `WebRTCGroupChatController: a new localDescription of type '${offer.type}' created to peerId of ${peerId} during 'onnegotiationneeded'`
      );
      console.debug(
        `WebRTCGroupChatController: the current localDescription is ${
          peerConnection.localDescription.type
        }, the current remoteDescription is ${
          peerConnection.remoteDescription ? peerConnection.remoteDescription.type : "unknown"
        },  during 'onnegotiationneeded'`
      );

      WebRTCSignalingManager.passThroughSignaling({
        sdp: offer,
        to: peerId,
        callingConstraints: WebRTCMediaCallingManager.callingConstraints,
      });
    })
    .catch((error) => {
      console.error(`WebRTCGroupChatController: Found error with message of ${error}`);
    })
    .finally(() => {
      peerConnection.makingOffer = false;
    });
}

function _closePeerConnection(peerId) {
  if (!peerId || peerId.length === 0) {
    console.debug(
      `WebRTCGroupChatController: unexpected peerId when stopping peer side connection`
    );
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
      console.debug(
        `WebRTCGroupChatController: the peerConnection with peerId of ${peerId} closed`
      );
    }
  });
  _peerConnectionMap.clear();
  console.debug(`WebRTCGroupChatController: all peer connections cleared`);
}

/**
 *
 * Utils
 */

function _checkPeerConnectionConfig(config) {
  // use regular expression to check it literally
  return true;
}

export default {
  get peerConnectionMap() {
    return _peerConnectionMap;
  },

  getPeerNameById(peerId) {
    const peerConnection = _peerConnectionMap.get(peerId);
    if (!peerConnection || typeof peerConnection.peerName !== "string") {
      return undefined;
    }
    return peerConnection.peerName;
  },

  handleNewPeerArivalInternally: _handleNewPeerArivalInternally,
  handleNewPassthroughArival: _handleNewPassthroughArival,
  handleNewPeerLeave: _handleNewPeerLeave,

  closeALLPeerConnections: _closeALLPeerConnections,
};
