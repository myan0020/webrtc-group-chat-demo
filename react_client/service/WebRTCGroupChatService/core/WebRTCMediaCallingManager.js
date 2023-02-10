/**
 * reusable track transceivers
 */

const _reusableAudioTransceiversMap = _createReusableTransceiversMap(true);
const _reusableVideoTransceiversMap = _createReusableTransceiversMap(false);
function _createReusableTransceiversMap(isAudio) {
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
    entries() {
      return this.peerMap.entries();
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

function _deletePeerTransceiver(peerId) {
  _reusableAudioTransceiversMap.delete(peerId);
  _reusableVideoTransceiversMap.delete(peerId);
  console.debug(
    `WebRTCGroupChatController: both reusable audio && video transceivers for a peer( ${peerId} ) deleted`
  );
}

function _clearAllPeerTransceivers() {
  _reusableAudioTransceiversMap.clear();
  _reusableVideoTransceiversMap.clear();
  console.debug(`WebRTCGroupChatController: all reusable audio && video transceivers cleared`);
}

function _pauseAllTransceiverSending() {
  _reusableAudioTransceiversMap.replaceAllSenders(null);
  _reusableVideoTransceiversMap.replaceAllSenders(null);
}

/**
 * peer track receiving
 */

let _handlePeerMediaStreamMapChanged;
const _peerMediaStreamMap = {
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
  muteTrack(peerId, trackId, kind) {},
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
      console.debug(
        `WebRTCGroupChatController: _peerMediaStreamMap delete executed, and its size changed from ${prevSize} to ${curSize}`
      );
    } else {
      this.peerMap.set(peerId, newMediaStream);
    }

    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(_shadowCopyPlainObject(this));
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

    console.debug(
      `WebRTCGroupChatController: _peerMediaStreamMap size changed from ${prevSize} to ${this.peerMap.size}`
    );

    if (_handlePeerMediaStreamMapChanged) {
      _handlePeerMediaStreamMapChanged(_shadowCopyPlainObject(this));
    }
  },
};

function _handlePeerConnectionTrackEvent(event, peerId) {
  if (!(event.target instanceof RTCPeerConnection) || !event.track) {
    console.debug(`WebRTCGroupChatController: unexpected event target / track during 'ontrack'`);
    return;
  }
  if (!peerId) {
    console.debug(`WebRTCGroupChatController: unexpected peerId ( ${peerId} ) during 'ontrack'`);
    return;
  }

  const track = event.track;
  _setupTrackEventHandlers(track, peerId, event.target);
}

function _setupTrackEventHandlers(track, peerId, peerConnection) {
  // chromium issue: https://bugs.chromium.org/p/chromium/issues/detail?id=931033
  if (
    peerConnection.callingConstraints &&
    peerConnection.callingConstraints[_callingInputTypeEnum.CALLING_INPUT_TYPE_VIDEO_SCREEN]
  ) {
    _peerMediaStreamMap.setTrack(peerId, track);
    return;
  }

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
  _peerMediaStreamMap.setTrack(peerId, track);
  console.debug(`WebRTCGroupChatController: unmute a track for a peer( ${peerId} )`, track);
}

function _handleIncomingTrackMute(event, peerId) {
  const track = event.target;
  _peerMediaStreamMap.deleteTrack(peerId, track.kind);
  console.debug(
    `WebRTCGroupChatController: muted a track for a peer( ${peerId}, kind(${track.kind}) )`,
    track
  );
}

function _handleIncomingTrackEnded(event, peerId) {
  const track = event.target;
  _peerMediaStreamMap.deleteTrack(peerId, track.kind);
  console.debug(`WebRTCGroupChatController: ended a track for a peer( ${peerId} )`, track);
}

/**
 * local track sending
 */

const _localMediaSourceStreams = [];
let _localMediaDestinationStream;
let _localMediaDestinationStreamPromise;
let _localAudioCtx;
let _localAudioDestinationNode;
let _localAudioGainNode;
const _localAudioSourceNodes = [];

let _handleLocalMediaStreamChanged;
let _handleLocalAudioEnableAvaliableChanged;
let _handleLocalVideoEnableAvaliableChanged;
let _handleLocalAudioMuteAvaliableChanged;
let _handleLocalVideoMuteAvaliableChanged;

let _callingConstraints;

const _callingInputTypeEnum = {
  CALLING_INPUT_TYPE_AUDIO_MICROPHONE: "microphone_audio",
  CALLING_INPUT_TYPE_AUDIO_SCREEN: "screen_audio",
  CALLING_INPUT_TYPE_VIDEO_CAMERA: "camera_video",
  CALLING_INPUT_TYPE_VIDEO_SCREEN: "screen_video",
};

function _applyCallingInputTypes(callingInputTypes) {
  _callingConstraints = {};

  callingInputTypes.forEach((callingInputType) => {
    _callingConstraints[callingInputType] = true;
  });

  _localMediaDestinationStreamPromise = _createLocalMediaStream();
}

async function _createLocalMediaStream() {
  let promise = new Promise((resolve, _) => {
    resolve(undefined);
  });

  const enableCameraVideoTrack =
    _callingConstraints[_callingInputTypeEnum.CALLING_INPUT_TYPE_VIDEO_CAMERA];
  const enableMicrophoneAudioTrack =
    _callingConstraints[_callingInputTypeEnum.CALLING_INPUT_TYPE_AUDIO_MICROPHONE];
  const enableScreenVideoTrack =
    _callingConstraints[_callingInputTypeEnum.CALLING_INPUT_TYPE_VIDEO_SCREEN];
  const enableScreenAudioTrack =
    _callingConstraints[_callingInputTypeEnum.CALLING_INPUT_TYPE_AUDIO_SCREEN];

  const mediaDevices = navigator.mediaDevices;

  if (
    enableMicrophoneAudioTrack &&
    !enableCameraVideoTrack &&
    !enableScreenAudioTrack &&
    !enableScreenVideoTrack
  ) {
    promise = mediaDevices.getUserMedia({ audio: true, video: false }).then((mediaStream) => {
      _localMediaSourceStreams.push(mediaStream);
      return mediaStream;
    });
  } else if (
    enableMicrophoneAudioTrack &&
    enableCameraVideoTrack &&
    !enableScreenAudioTrack &&
    !enableScreenVideoTrack
  ) {
    promise = mediaDevices.getUserMedia({ audio: true, video: true }).then((mediaStream) => {
      _localMediaSourceStreams.push(mediaStream);
      return mediaStream;
    });
  } else if (
    enableScreenAudioTrack &&
    enableScreenVideoTrack &&
    !enableMicrophoneAudioTrack &&
    !enableCameraVideoTrack
  ) {
    promise = mediaDevices.getDisplayMedia({ audio: true, video: false }).then((mediaStream) => {
      _localMediaSourceStreams.push(mediaStream);
      return mediaStream;
    });
  } else if (
    enableScreenAudioTrack &&
    enableScreenVideoTrack &&
    enableMicrophoneAudioTrack &&
    !enableCameraVideoTrack
  ) {
    promise = Promise.all([
      mediaDevices.getDisplayMedia({ audio: true, video: true }),
      mediaDevices.getUserMedia({ audio: true, video: false }),
    ]).then((mediaStreams) => {
      if (!(mediaStreams instanceof Array)) {
        return null;
      }

      mediaStreams.forEach((mediaStream) => {
        _localMediaSourceStreams.push(mediaStream);
      });

      if (mediaStreams.length !== 2) {
        return null;
      }

      // perform audio track mixing

      _localAudioCtx = new AudioContext();
      _localAudioGainNode = _localAudioCtx.createGain();
      _localAudioDestinationNode = _localAudioCtx.createMediaStreamDestination();
      _localAudioGainNode.connect(_localAudioCtx.destination);
      _localAudioGainNode.gain.value = 0; // use gain node to prevent echo

      mediaStreams.forEach(function (mediaStream) {
        if (
          !mediaStream.getTracks().filter(function (track) {
            return track.kind === "audio";
          }).length
        ) {
          return;
        }

        const audioSourceNode = _localAudioCtx.createMediaStreamSource(mediaStream);
        audioSourceNode.connect(_localAudioGainNode);
        _localAudioSourceNodes.push(audioSourceNode);
      });

      const [localDisplayMediaStream] = mediaStreams;
      const localScreenVideoTrack = localDisplayMediaStream.getVideoTracks()[0];

      _localAudioSourceNodes.forEach(function (audioSourceNode) {
        audioSourceNode.connect(_localAudioDestinationNode);
      });
      const localMediaStream = new MediaStream([
        ..._localAudioDestinationNode.stream.getTracks(),
        localScreenVideoTrack,
      ]);

      return localMediaStream;
    });
  } else {
    // use no video, only microphone
    promise = mediaDevices.getUserMedia({ audio: true, video: false });
  }

  promise = promise.then((localMediaStream) => {
    console.debug(`WebRTCGroupChatController: local media stream created`);

    _localMediaDestinationStream = localMediaStream;
    if (_handleLocalMediaStreamChanged) {
      _handleLocalMediaStreamChanged(localMediaStream);
    }
    // 'getUserMedia' or 'getDisplayMedia' may return a media stream that contains a lower number of tracks than expected
    localMediaStream.getTracks().forEach((track, index) => {
      let handleLocalEnableAvaliableChanged;
      if (track.kind === "audio") {
        handleLocalEnableAvaliableChanged = _handleLocalAudioEnableAvaliableChanged;
      } else if (track.kind === "video") {
        handleLocalEnableAvaliableChanged = _handleLocalVideoEnableAvaliableChanged;
      }
      if (handleLocalEnableAvaliableChanged) {
        handleLocalEnableAvaliableChanged(true);
      }
    });
  });
  return promise;
}

function _addLocalMediaStream(peerConnectionMap) {
  if (!_localMediaDestinationStream) {
    console.debug(
      `WebRTCGroupChatController: unexpected _localMediaDestinationStream of ${_localMediaDestinationStream} when adding local media stream to peer connection (peerId: ${peerId})`
    );
    return;
  }

  _localMediaDestinationStream.getTracks().forEach((track, index) => {
    let reusableTransceiversMap;
    let handleLocalMuteAvaliableChanged;
    if (track.kind === "audio") {
      reusableTransceiversMap = _reusableAudioTransceiversMap;
      handleLocalMuteAvaliableChanged = _handleLocalAudioMuteAvaliableChanged;
    } else if (track.kind === "video") {
      reusableTransceiversMap = _reusableVideoTransceiversMap;
      handleLocalMuteAvaliableChanged = _handleLocalVideoMuteAvaliableChanged;
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

    // local mute avaliable
    if (handleLocalMuteAvaliableChanged) {
      handleLocalMuteAvaliableChanged(true);
    }
  });
}

function _addLocalTracksIfPossible(peerId, peerConnection) {
  if (_localMediaDestinationStream) {
    _localMediaDestinationStream.getTracks().forEach((track, index) => {
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
        //
        // TODO:
        //
        // Priority Level: Middle
        //
        // ”前面的人进入房间后，打开媒体流，然后点击enable或mute按钮，接着当前房间进来了新人，但无法给新人同步前面的加入者所点击过的enable或mute状态“
        //
        const muted = _getLocalMediaTrackMuted(track.kind);
        peerConnection.addTrack(track);
        reusableTransceiversMap.set(peerId, _getTransceiversOfPureKind(peerConnection, track.kind));
      }
    });
  }
}

function _releaseLocalMediaDestination() {
  if (_localMediaDestinationStream) {
    let handleLocalEnableAvaliableChanged;
    let handleLocalMuteAvaliableChanged;

    _localMediaDestinationStream.getTracks().forEach(function (track) {
      if (track.kind === "audio") {
        handleLocalEnableAvaliableChanged = _handleLocalAudioEnableAvaliableChanged;
        handleLocalMuteAvaliableChanged = _handleLocalAudioMuteAvaliableChanged;
      } else if (track.kind === "video") {
        handleLocalEnableAvaliableChanged = _handleLocalVideoEnableAvaliableChanged;
        handleLocalMuteAvaliableChanged = _handleLocalVideoMuteAvaliableChanged;
      }

      track.stop();

      if (handleLocalEnableAvaliableChanged) {
        handleLocalEnableAvaliableChanged(false);
      }
      if (handleLocalMuteAvaliableChanged) {
        handleLocalMuteAvaliableChanged(false);
      }
    });

    _localMediaDestinationStream = null;
    if (_handleLocalMediaStreamChanged) {
      _handleLocalMediaStreamChanged(_localMediaDestinationStream);
    }
  }
}

function _releaseLocalMediaSources() {
  if (_localMediaSourceStreams.length > 0) {
    _localMediaSourceStreams.forEach((localMediaSourceStream) => {
      localMediaSourceStream.getTracks().forEach((localMediaSourceTrack) => {
        localMediaSourceTrack.stop();
      });
    });
    _localMediaSourceStreams.length = 0;
  }
}

function _releaseLocalAudioGraph() {
  if (_localAudioGainNode) {
    _localAudioGainNode.disconnect();
    _localAudioGainNode = null;
  }

  if (_localAudioSourceNodes.length > 0) {
    _localAudioSourceNodes.forEach(function (audioSourceNode) {
      audioSourceNode.disconnect();
    });
    _localAudioSourceNodes.length = 0;
  }

  if (_localAudioDestinationNode) {
    _localAudioDestinationNode.disconnect();
    _localAudioDestinationNode = null;
  }

  if (_localAudioCtx) {
    _localAudioCtx.close();
    _localAudioCtx = null;
  }
}

function _getLocalMediaTrackEnabled(trackKind) {
  let trackEnabled = false;

  if (!_localMediaDestinationStream) {
    return trackEnabled;
  }

  let track;
  if (trackKind === "audio" && _localMediaDestinationStream.getAudioTracks()) {
    track = _localMediaDestinationStream.getAudioTracks()[0];
  } else if (trackKind === "video" && _localMediaDestinationStream.getVideoTracks()) {
    track = _localMediaDestinationStream.getVideoTracks()[0];
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
  if (!_localMediaDestinationStream) {
    console.error(
      `WebRTCGroupChatController: unexpected empty _localMediaDestinationStream when 'set' enabling ( ${trackKind} ) kind of local media device`
    );
    return;
  }

  let track;
  if (trackKind === "audio" && _localMediaDestinationStream.getAudioTracks()) {
    track = _localMediaDestinationStream.getAudioTracks()[0];
  } else if (trackKind === "video" && _localMediaDestinationStream.getVideoTracks()) {
    track = _localMediaDestinationStream.getVideoTracks()[0];
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
  if (!_localMediaDestinationStream) {
    return true;
  }

  let reusableTransceiversMap;
  if (trackKind === "audio") {
    reusableTransceiversMap = _reusableAudioTransceiversMap;
  } else if (trackKind === "video") {
    reusableTransceiversMap = _reusableVideoTransceiversMap;
  }
  let transceiverMuted = false;
  for (let [peerId, transceivers] of reusableTransceiversMap.entries()) {
    const transceiver = transceivers[0];
    // warning: some potential issues about transceiving direction may exist
    if (
      transceiver.currentDirection === "inactive" ||
      (transceiver.currentDirection === "recvonly" && transceiver.direction === "recvonly") ||
      transceiver.currentDirection === "stopped"
    ) {
      transceiverMuted = true;
      break;
    }
  }
  if (transceiverMuted) {
    return true;
  }

  let track;
  if (trackKind === "audio" && _localMediaDestinationStream.getAudioTracks()) {
    track = _localMediaDestinationStream.getAudioTracks()[0];
  } else if (trackKind === "video" && _localMediaDestinationStream.getVideoTracks()) {
    track = _localMediaDestinationStream.getVideoTracks()[0];
  }
  if (!track) {
    console.error(
      `WebRTCGroupChatController: unexpected empty track when 'get' muting ( ${trackKind} ) kind of local media device`
    );
    return true;
  }

  return track.muted;
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
      // transceiver.sender.replaceTrack(null).then(() => {
      // });
      transceiver.direction = muted ? "recvonly" : "sendrecv";
    }
  });
}

/**
 * calling
 */

let _isCalling = false;
let _handleCallingStateChanged;

function _startCalling(peerConnectionMap) {
  if (!_localMediaDestinationStreamPromise) {
    console.debug(`unexpected empty '_localMediaDestinationStreamPromise' during starting calling`);
    return;
  }

  _changeCallingState(true);
  _localMediaDestinationStreamPromise.then(
    () => {
      _addLocalMediaStream(peerConnectionMap);
    },
    (error) => {
      console.debug(
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

  _releaseLocalMediaSources();
  _releaseLocalMediaDestination();
  _releaseLocalAudioGraph();

  if (!isLeavingRoom) {
    _pauseAllTransceiverSending();
  }
}

function _changeCallingState(changeToCalling) {
  console.debug(
    `WebRTCGroupChatController: change calling state to toCalling of ${changeToCalling}`
  );

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

/**
 * utils
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
  callingInputTypeEnum: _callingInputTypeEnum,
  applyCallingInputTypes: _applyCallingInputTypes,

  startCalling: _startCalling,
  hangUpCalling: _hangUpCalling,

  addLocalTracksIfPossible: _addLocalTracksIfPossible,

  deletePeerTransceiver: _deletePeerTransceiver,
  clearAllPeerTransceivers: _clearAllPeerTransceivers,

  get callingConstraints() {
    return _callingConstraints;
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

  // listeners
  onWebRTCCallingStateChanged: function (handler) {
    _handleCallingStateChanged = handler;
  },
  onLocalMediaStreamChanged: function (handler) {
    _handleLocalMediaStreamChanged = handler;
  },
  onPeerMediaStreamMapChanged: function (handler) {
    _handlePeerMediaStreamMapChanged = handler;
  },
  onLocalAudioEnableAvaliableChanged: function (handler) {
    _handleLocalAudioEnableAvaliableChanged = handler;
  },
  onLocalVideoEnableAvaliableChanged: function (handler) {
    _handleLocalVideoEnableAvaliableChanged = handler;
  },
  onLocalAudioMuteAvaliableChanged: function (handler) {
    _handleLocalAudioMuteAvaliableChanged = handler;
  },
  onLocalVideoMuteAvaliableChanged: function (handler) {
    _handleLocalVideoMuteAvaliableChanged = handler;
  },

  handlePeerConnectionTrackEvent: _handlePeerConnectionTrackEvent,
};
