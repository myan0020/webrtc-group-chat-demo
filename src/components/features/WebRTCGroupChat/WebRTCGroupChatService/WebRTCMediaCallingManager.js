/**
 * Media Streams management
 */

let _handlePeerUserMediaStreamMapChanged;
let _handleLocalUserMediaStreamChanged;

let _mediaStreamConstraints = {
  video: true,
  audio: true,
};

function _changeMediaStreamConstraints(constraints) {
  const passChecking = _checkMediaStreamConstraints(constraints);
  if (!passChecking) return;
  _mediaStreamConstraints = constraints;
}

let _localUserMediaStream;
const _peerUserMediaStreamMap = {
  peerMap: new Map(),
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

    if (newMediaStream.getTracks().length === 0) {
      const prevSize = this.peerMap.size;
      this.peerMap.delete(peerId);
      const curSize = this.peerMap.size;
      console.log(
        `WebRTCGroupChatController: _peerUserMediaStreamMap delete executed, and its size changed from ${prevSize} to ${curSize}`
      );
    } else {
      this.peerMap.set(peerId, newMediaStream);
    }

    if (_handlePeerUserMediaStreamMapChanged) {
      _handlePeerUserMediaStreamMapChanged(_shadowCopyPlainObject(this));
    }
  },

  setTrack(peerId, track) {
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
      `WebRTCGroupChatController: _peerUserMediaStreamMap size changed from ${prevSize} to ${this.peerMap.size}`
    );

    if (_handlePeerUserMediaStreamMapChanged) {
      _handlePeerUserMediaStreamMapChanged(_shadowCopyPlainObject(this));
    }
  },
};

const _reusableAudioTransceiversMap = _createReusableTransceiversMap();
const _reusableVideoTransceiversMap = _createReusableTransceiversMap();

function _createReusableTransceiversMap() {
  return {
    peerMap: new Map(),
    set(peerId, transceivers) {
      this.peerMap.set(peerId, transceivers);
    },
    get(peerId) {
      return this.peerMap.get(peerId);
    },
    has(peerId) {
      return this.peerMap.has(peerId);
    },
    delete(peerId) {
      this.peerMap.delete(peerId);
    },
    clear() {
      this.peerMap.clear();
    },
    forEach(callback) {
      this.peerMap.forEach(callback);
    },
    replaceAllSenders(withTrack) {
      this.peerMap.forEach((transceivers, peerId) => {
        if (transceivers && transceivers.length > 0 && transceivers[0].sender) {
          const transceiver = transceivers[0];
          transceiver.sender.replaceTrack(withTrack).then(() => {
            if (transceiver.currentDirection === "stopped") {
              return;
            }
            if (!withTrack) {
              transceiver.direction = "recvonly";
            }
          });
        }
      });
    },
  };
}

function _handlePeerConnectionTrackEvent(event, peerId) {
  if (!(event.target instanceof RTCPeerConnection) || !event.track) {
    console.log(`WebRTCGroupChatController: unexpected event target / track during 'ontrack'`);
    return;
  }
  if (!peerId) {
    console.log(`WebRTCGroupChatController: unexpected peerId ( ${peerId} ) during 'ontrack'`);
    return;
  }

  const track = event.track;
  _setupTrackEventHandlers(track, peerId);
}

function _addLocalTracksIfPossible(peerId, peerConnection) {
  if (_localUserMediaStream) {
    _localUserMediaStream.getTracks().forEach((track, index) => {
      let reusableTransceiversMap;
      if (track.kind === "audio") {
        reusableTransceiversMap = _reusableAudioTransceiversMap;
      } else if (track.kind === "video") {
        reusableTransceiversMap = _reusableVideoTransceiversMap;
      }

      const transceivers = reusableTransceiversMap.get(peerId);
      if (transceivers && transceivers.length > 0 && transceivers[0].sender) {
        const transceiver = transceivers[0];
        transceiver.sender.replaceTrack(track).then(() => {
          transceiver.direction = "sendrecv";
        });
      } else if (!transceivers || transceivers.length === 0) {
        peerConnection.addTrack(track);
        reusableTransceiversMap.set(peerId, _getTransceiversOfPureKind(peerConnection, track.kind));
      }
    });
  }
}

function _setupTrackEventHandlers(track, peerId) {
  track.onunmute = (event) => {
    _handleIncomingTrackUnmute(event, peerId);
  };
  track.onmute = (event) => {
    _handleIncomingTrackMute(event, peerId);
  };
  track.onended = (event) => {
    _handleIncomingTrackEnded(event, peerId);
  };
}

function _handleIncomingTrackUnmute(event, peerId) {
  const track = event.target;
  _peerUserMediaStreamMap.setTrack(peerId, track);
  console.log(`WebRTCGroupChatController: unmute a track for a peer( ${peerId} )`, track);
}

function _handleIncomingTrackMute(event, peerId) {
  const track = event.target;
  _peerUserMediaStreamMap.deleteTrack(peerId, track.kind);
  console.log(`WebRTCGroupChatController: muted a track for a peer( ${peerId} )`, track);
}

function _handleIncomingTrackEnded(event, peerId) {
  const track = event.target;
  _peerUserMediaStreamMap.deleteTrack(peerId, track.kind);
  console.log(`WebRTCGroupChatController: ended a track for a peer( ${peerId} )`, track);
}

async function _createLocalUserMediaStream() {
  console.log(`WebRTCGroupChatController: start to create local user media stream`);
  return navigator.mediaDevices
    .getUserMedia(_mediaStreamConstraints)
    .then((localUserMediaStream) => {
      console.log(`WebRTCGroupChatController: local media stream created`);
      _localUserMediaStream = localUserMediaStream;
      if (_handleLocalUserMediaStreamChanged) {
        _handleLocalUserMediaStreamChanged(localUserMediaStream);
      }
    });
}

function _addLocalUserMediaStream(peerConnectionMap) {
  if (!_localUserMediaStream) {
    console.log(
      `WebRTCGroupChatController: unexpected _localUserMediaStream of ${_localUserMediaStream} when adding local media stream to peer connection (peerId: ${peerId})`
    );
    return;
  }

  _localUserMediaStream.getTracks().forEach((track, index) => {
    let reusableTransceiversMap;
    if (track.kind === "audio") {
      reusableTransceiversMap = _reusableAudioTransceiversMap;
    } else if (track.kind === "video") {
      reusableTransceiversMap = _reusableVideoTransceiversMap;
    }

    peerConnectionMap.forEach((peerConnection, peerId) => {
      const transceivers = reusableTransceiversMap.get(peerId);
      if (transceivers && transceivers.length > 0 && transceivers[0].sender) {
        const transceiver = transceivers[0];
        transceiver.sender.replaceTrack(track).then(() => {
          transceiver.direction = "sendrecv";
        });
      } else if (!transceivers || transceivers.length === 0) {
        peerConnection.addTrack(track);
        reusableTransceiversMap.set(peerId, _getTransceiversOfPureKind(peerConnection, track.kind));
      }
    });
  });
}

function _deletePeerTransceiver(peerId) {
  _reusableAudioTransceiversMap.delete(peerId);
  _reusableVideoTransceiversMap.delete(peerId);
  console.log(
    `WebRTCGroupChatController: both reusable audio && video transceivers for a peer( ${peerId} ) deleted`
  );
}

function _clearAllPeerTransceivers() {
  _reusableAudioTransceiversMap.clear();
  _reusableVideoTransceiversMap.clear();
  console.log(`WebRTCGroupChatController: all reusable audio && video transceivers cleared`);
}

function _pauseAllTransceiverSending() {
  _reusableAudioTransceiversMap.replaceAllSenders(null);
  _reusableVideoTransceiversMap.replaceAllSenders(null);
}

function _stopLocalUserMediaTracks() {
  if (_localUserMediaStream) {
    _localUserMediaStream.getTracks().forEach(function (track) {
      track.stop();
    });

    _localUserMediaStream = null;
    if (_handleLocalUserMediaStreamChanged) {
      _handleLocalUserMediaStreamChanged(_localUserMediaStream);
    }
  }
}

function _getLocalMediaTrackEnabled(trackKind) {
  let trackEnabled = false;

  if (!_localUserMediaStream) {
    return trackEnabled;
  }

  let track;
  if (trackKind === "audio" && _localUserMediaStream.getAudioTracks()) {
    track = _localUserMediaStream.getAudioTracks()[0];
  } else if (trackKind === "video" && _localUserMediaStream.getVideoTracks()) {
    track = _localUserMediaStream.getVideoTracks()[0];
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
  if (!_localUserMediaStream) {
    console.error(
      `WebRTCGroupChatController: unexpected empty _localUserMediaStream when 'set' enabling ( ${trackKind} ) kind of local media device`
    );
    return;
  }

  let track;
  if (trackKind === "audio" && _localUserMediaStream.getAudioTracks()) {
    track = _localUserMediaStream.getAudioTracks()[0];
  } else if (trackKind === "video" && _localUserMediaStream.getVideoTracks()) {
    track = _localUserMediaStream.getVideoTracks()[0];
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
  let reusableTransceiversMap;
  if (trackKind === "audio") {
    reusableTransceiversMap = _reusableAudioTransceiversMap;
  } else if (trackKind === "video") {
    reusableTransceiversMap = _reusableVideoTransceiversMap;
  }

  reusableTransceiversMap.forEach((transceivers) => {
    if (transceivers.length > 0) {
      const transceiver = transceivers[0];
      switch (transceiver.currentDirection) {
        case "sendrecv":
        case "sendonly":
          isLocalMediaTrackMuted = false;
          return;
        default:
          break;
      }
    }
  });

  return isLocalMediaTrackMuted;
}

function _setLocalMediaTrackMuted(trackKind, muted) {
  let reusableTransceiversMap;
  if (trackKind === "audio") {
    reusableTransceiversMap = _reusableAudioTransceiversMap;
  } else if (trackKind === "video") {
    reusableTransceiversMap = _reusableVideoTransceiversMap;
  }
  reusableTransceiversMap.forEach((transceivers) => {
    if (transceivers.length > 0) {
      const transceiver = transceivers[0];
      transceiver.direction = muted ? "recvonly" : "sendrecv";
    }
  });
}

let _isCalling = false;
let _handleCallingStateChanged;

function _changeCallingState(changeToCalling) {
  console.log(`WebRTCGroupChatController: change calling state to toCalling of ${changeToCalling}`);

  // change state to no calling
  if (!changeToCalling) {
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

function _startCalling(peerConnectionMap) {
  _changeCallingState(true);
  _createLocalUserMediaStream().then(
    () => {
      _addLocalUserMediaStream(peerConnectionMap);
    },
    (error) => {
      console.log(
        `WebRTCGroupChatController: met error of ${error} when creating local media stream`
      );
      _changeCallingState(false);
    }
  );
}

function _hangUpCalling(isLeavingRoom) {
  if (!_isCalling) {
    return;
  }

  _changeCallingState(false);
  _stopLocalUserMediaTracks();

  if (!isLeavingRoom) {
    _pauseAllTransceiverSending();
  }
}

/**
 * Utils
 */

function _shadowCopyPlainObject(plainObj) {
  const copiedPlainObj = {};
  Object.keys(plainObj).forEach((property) => {
    copiedPlainObj[property] = plainObj[property];
  });
  return copiedPlainObj;
}

function _checkMediaStreamConstraints(constraints) {
  // use regular expression to check it literally
  return true;
}

function _pureKindOfTransceiver(transceiver) {
  let senderKind = "";
  let receiverKind = "";
  if (transceiver.sender && transceiver.sender.track) {
    senderKind = transceiver.sender.track.kind;
  }
  if (transceiver.receiver && transceiver.receiver.track) {
    receiverKind = transceiver.receiver.track.kind;
  }
  if (senderKind !== receiverKind) {
    return undefined;
  }
  return senderKind;
}

function _getTransceiversOfPureKind(peerConnection, pureKind) {
  const transceivers = peerConnection.getTransceivers();
  if (!transceivers || transceivers.length === 0) {
    return [];
  }
  return transceivers.filter((transceiver) => {
    return _pureKindOfTransceiver(transceiver) === pureKind;
  });
}

function _getSendersOfKind(peerConnection, kind) {
  const senders = peerConnection.getSenders();
  if (!senders || senders.length === 0) {
    return [];
  }
  return senders.filter((sender) => {
    return sender.kind === kind;
  });
}

function _getReceiversOfKind(peerConnection, kind) {
  const receivers = peerConnection.getReceivers();
  if (!receivers || receivers.length === 0) {
    return [];
  }
  return receivers.filter((receiver) => {
    return receiver.kind === kind;
  });
}

export default {
  startCalling: _startCalling,
  hangUpCalling: _hangUpCalling,

  addLocalTracksIfPossible: _addLocalTracksIfPossible,
  deletePeerTransceiver: _deletePeerTransceiver,
  clearAllPeerTransceivers: _clearAllPeerTransceivers,

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

  // listeners
  onWebRTCCallingStateChanged: function (handler) {
    _handleCallingStateChanged = handler;
  },
  onLocalMediaStreamChanged: function (handler) {
    _handleLocalUserMediaStreamChanged = handler;
  },
  onPeerMediaStreamMapChanged: function (handler) {
    _handlePeerUserMediaStreamMapChanged = handler;
  },

  handlePeerConnectionTrackEvent: _handlePeerConnectionTrackEvent,
};
