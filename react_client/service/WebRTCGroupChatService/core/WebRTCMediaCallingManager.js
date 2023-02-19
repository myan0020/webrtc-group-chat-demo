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

let _handlePeerMediaContextMapChanged;

const _peerMediaContextMap = {
  map: new Map(),
  has(key) {
    return this.map.has(key);
  },
  size() {
    return this.map.size;
  },
  getMediaContext(key) {
    if (!this.map.get(key)) {
      return undefined;
    }
    return this.map.get(key);
  },
  muteTrack(peerId, trackId, kind) {},
  deleteTrack(peerId, kind, id) {
    if (!this.getMediaContext(peerId)) {
      return;
    }

    const mediaContext = this.getMediaContext(peerId);
    const audioProcessor = mediaContext.audioProcessor;

    if (kind === "video") {
      mediaContext.videoTrack = null;
    } else if (kind === "audio") {
      mediaContext.audioTrack = null;

      const audioSourceNode = audioProcessor.audioSourceNode;
      audioSourceNode.disconnect();
      audioProcessor.audioSourceNode = null;
      if (audioProcessor.audioAnalyserNode) {
        audioProcessor.audioAnalyserNode = null;
      }
      if (audioProcessor.audioGainNode) {
        audioProcessor.audioGainNode.disconnect();
        audioProcessor.audioGainNode = null;
      }
      if (audioProcessor.audioContext) {
        audioProcessor.audioContext.close();
        audioProcessor.audioContext = null;
      }
    }

    if (!mediaContext.videoTrack && !mediaContext.audioTrack) {
      this.map.delete(peerId);
    } else {
      this.map.set(peerId, mediaContext);
    }

    if (_handlePeerMediaContextMapChanged) {
      _handlePeerMediaContextMapChanged(_shadowCopyPlainObject(this));
    }
  },

  setTrack(peerId, track) {
    const prevSize = this.map.size;

    if (!this.getMediaContext(peerId)) {
      const thatPeerMediaContextMap = this;

      const newMediaContext = {
        videoTrack: null,
        audioTrack: null,
        audioProcessor: {
          audioContext: null,
          audioGainNode: null,
          audioSourceNode: null,
          audioAnalyserNode: null,

          // Chromium Issue: MediaStream from RTC is silent for Web Audio API
          // https://bugs.chromium.org/p/chromium/issues/detail?id=933677#c4
          playWithAudioDOMLoaded(audioDOMLoaded) {
            if (!(audioDOMLoaded instanceof HTMLMediaElement)) {
              return;
            }
            if (this.audioSourceNode) {
              return;
            }
            if (
              !(newMediaContext.audioTrack instanceof MediaStreamTrack) ||
              newMediaContext.audioTrack.kind !== "audio"
            ) {
              return;
            }

            const audioStream = new MediaStream([newMediaContext.audioTrack]);

            // It is a required step to output audio stream before using audio context
            audioDOMLoaded.srcObject = audioStream;
            // Make sure that only audio context instead of audio DOM element can output this audio stream
            audioDOMLoaded.volume = 0;

            this.audioContext = new AudioContext();
            this.audioGainNode = this.audioContext.createGain();

            const audioSourceNode = this.audioContext.createMediaStreamSource(audioStream);
            const audioAnalyserNode = this.audioContext.createAnalyser();
            audioSourceNode.connect(this.audioGainNode);
            audioSourceNode.connect(audioAnalyserNode);
            this.audioGainNode.connect(this.audioContext.destination);
            this.audioSourceNode = audioSourceNode;
            this.audioAnalyserNode = audioAnalyserNode;

            if (_handlePeerMediaContextMapChanged) {
              _handlePeerMediaContextMapChanged(_shadowCopyPlainObject(thatPeerMediaContextMap));
            }
          },

          set volumeMultipler(newMultipler) {
            if (!this.audioGainNode) {
              return;
            }
            this.audioGainNode.gain.value = newMultipler;
          },
          get volumeMultipler() {
            if (!this.audioGainNode) {
              return 0;
            }
            return this.audioGainNode.gain.value;
          },
        },
      };
      this.map.set(peerId, newMediaContext);
    }

    const mediaContext = this.getMediaContext(peerId);

    if (track.kind === "video") {
      mediaContext.videoTrack = track;
    } else if (track.kind === "audio") {
      mediaContext.audioTrack = track;
    }

    this.map.set(peerId, mediaContext);

    console.debug(
      `WebRTCGroupChatController: _peerMediaContextMap size changed from ${prevSize} to ${this.map.size}`
    );

    if (_handlePeerMediaContextMapChanged) {
      _handlePeerMediaContextMapChanged(_shadowCopyPlainObject(this));
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
  // Chromium Issue: Video Track repeatedly firing muted and unmuted when using Tab Sharing
  // https://bugs.chromium.org/p/chromium/issues/detail?id=931033
  if (
    peerConnection.callingConstraints &&
    peerConnection.callingConstraints[_callingInputTypeEnum.CALLING_INPUT_TYPE_VIDEO_SCREEN]
  ) {
    _peerMediaContextMap.setTrack(peerId, track);
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
  _peerMediaContextMap.setTrack(peerId, track);
  console.debug(`WebRTCGroupChatController: unmute a track for a peer( ${peerId} )`, track);
}

function _handleIncomingTrackMute(event, peerId) {
  const track = event.target;
  _peerMediaContextMap.deleteTrack(peerId, track.kind, track.id);
  console.debug(
    `WebRTCGroupChatController: muted a track for a peer( ${peerId}, kind(${track.kind}) )`,
    track
  );
}

function _handleIncomingTrackEnded(event, peerId) {
  const track = event.target;
  _peerMediaContextMap.deleteTrack(peerId, track.kind, track.id);
  console.debug(`WebRTCGroupChatController: ended a track for a peer( ${peerId} )`, track);
}

/**
 * local track sending
 */

let _localMediaContext = {
  mediaSourceStreams: [],
  videoTrack: null,
  audioTrack: null,
  audioProcessor: {
    audioContext: null,
    audioGainNode: null,
    audioAnalyserSourceNode: null,
    audioAnalyserNode: null,
    audioDestinationNode: null,
    audioSourceNodeMap: new Map(),
    set volumeMultipler(newMultipler) {
      if (!this.audioGainNode) {
        return;
      }
      this.audioGainNode.gain.value = newMultipler;
    },
    get volumeMultipler() {
      if (!this.audioGainNode) {
        return undefined;
      }
      return this.audioGainNode.gain.value;
    },
  },
};
let _localMediaContextCreatingPromise;

let _handleLocalMediaContextChanged;
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

  _localMediaContextCreatingPromise = _createLocalMediaContext();
}

async function _createLocalMediaContext() {
  const promise = new Promise((resolve, _) => {
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
      mediaDevices.getUserMedia({ audio: true, video: false }).then((mediaStream) => {
        _localMediaContext.mediaSourceStreams.push(mediaStream);
        _buildLocalMediaDestinationTracks();
        resolve();
      });
    } else if (
      enableMicrophoneAudioTrack &&
      enableCameraVideoTrack &&
      !enableScreenAudioTrack &&
      !enableScreenVideoTrack
    ) {
      mediaDevices.getUserMedia({ audio: true, video: true }).then((mediaStream) => {
        _localMediaContext.mediaSourceStreams.push(mediaStream);
        _buildLocalMediaDestinationTracks();
        resolve();
      });
    } else if (
      enableScreenAudioTrack &&
      enableScreenVideoTrack &&
      !enableMicrophoneAudioTrack &&
      !enableCameraVideoTrack
    ) {
      mediaDevices.getDisplayMedia({ audio: true, video: false }).then((mediaStream) => {
        _localMediaContext.mediaSourceStreams.push(mediaStream);
        _buildLocalMediaDestinationTracks();
        resolve();
      });
    } else if (
      enableScreenAudioTrack &&
      enableScreenVideoTrack &&
      enableMicrophoneAudioTrack &&
      !enableCameraVideoTrack
    ) {
      Promise.all([
        mediaDevices.getDisplayMedia({ audio: true, video: true }),
        mediaDevices.getUserMedia({ audio: true, video: false }),
      ]).then((mediaStreams) => {
        if (!(mediaStreams instanceof Array)) {
          return;
        }

        mediaStreams.forEach((mediaStream) => {
          _localMediaContext.mediaSourceStreams.push(mediaStream);
        });
        _buildLocalMediaDestinationTracks();
        resolve();
      });
    } else {
      // use no video, only microphone
      mediaDevices.getUserMedia({ audio: true, video: false }).then((mediaStream) => {
        _localMediaContext.mediaSourceStreams.push(mediaStream);
        _buildLocalMediaDestinationTracks();
        resolve();
      });
    }
  });

  return promise;
}

function _buildLocalMediaDestinationTracks() {
  if (_localMediaContext.mediaSourceStreams.length === 0) {
    return;
  }

  let audioDestinationTrack;
  let videoDestinationTrack;

  const audioCtx = new AudioContext();
  const audioGainNode = audioCtx.createGain();
  const audioAnalyserNode = audioCtx.createAnalyser();
  const audioDestinationNode = audioCtx.createMediaStreamDestination();
  audioGainNode.connect(audioAnalyserNode);

  _localMediaContext.audioProcessor.audioContext = audioCtx;
  _localMediaContext.audioProcessor.audioGainNode = audioGainNode;
  _localMediaContext.audioProcessor.audioAnalyserNode = audioAnalyserNode;
  _localMediaContext.audioProcessor.audioDestinationNode = audioDestinationNode;

  const audioSourceTracks = [];
  const videoSourceTracks = [];

  _localMediaContext.mediaSourceStreams.forEach((mediaStream) => {
    mediaStream.getAudioTracks().forEach((audioTrack) => {
      audioSourceTracks.push(audioTrack);
    });

    mediaStream.getVideoTracks().forEach((videoTrack) => {
      videoSourceTracks.push(videoTrack);
    });
  });

  if (audioSourceTracks.length > 0) {
    audioSourceTracks.forEach((audioSourceTrack) => {
      const audioSourceStream = new MediaStream([audioSourceTrack]);
      const audioSourceNode = audioCtx.createMediaStreamSource(audioSourceStream);
      audioSourceNode.connect(audioGainNode);
      audioSourceNode.connect(audioDestinationNode);
      _localMediaContext.audioProcessor.audioSourceNodeMap.set(
        audioSourceTrack.id,
        audioSourceNode
      );
    });

    if (audioDestinationNode.stream.getAudioTracks().length > 0) {
      audioDestinationTrack = audioDestinationNode.stream.getAudioTracks()[0];
    }
  }

  if (videoSourceTracks.length > 0) {
    videoDestinationTrack = videoSourceTracks[0];
  }

  if (audioDestinationTrack) {
    _localMediaContext.audioTrack = audioDestinationTrack;
    if (_handleLocalAudioEnableAvaliableChanged) {
      _handleLocalAudioEnableAvaliableChanged(true);
    }
  }

  if (videoDestinationTrack) {
    _localMediaContext.videoTrack = videoDestinationTrack;
    if (_handleLocalVideoEnableAvaliableChanged) {
      _handleLocalVideoEnableAvaliableChanged(true);
    }
  }

  if (audioDestinationTrack || videoDestinationTrack) {
    if (_handleLocalMediaContextChanged) {
      _handleLocalMediaContextChanged(_shadowCopyPlainObject(_localMediaContext));
    }
  }
}

function _addLocalMediaStream(peerConnectionMap) {
  if (!_localMediaContext.audioTrack && !_localMediaContext.videoTrack) {
    console.debug(
      `WebRTCGroupChatController: unexpected _localMediaContext when adding local media stream to all peer connections`,
      _localMediaContext
    );
    return;
  }

  const tracks = [];
  if (_localMediaContext.audioTrack) {
    tracks.push(_localMediaContext.audioTrack);
  }
  if (_localMediaContext.videoTrack) {
    tracks.push(_localMediaContext.videoTrack);
  }

  tracks.forEach((track, index) => {
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
  const tracks = [];
  if (_localMediaContext.audioTrack) {
    tracks.push(_localMediaContext.audioTrack);
  }
  if (_localMediaContext.videoTrack) {
    tracks.push(_localMediaContext.videoTrack);
  }

  if (tracks.length > 0) {
    tracks.forEach((track, index) => {
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

function _releaseLocalMediaContext() {
  // release source streams
  if (_localMediaContext.mediaSourceStreams.length > 0) {
    _localMediaContext.mediaSourceStreams.forEach((localMediaSourceStream) => {
      localMediaSourceStream.getTracks().forEach((localMediaSourceTrack) => {
        localMediaSourceTrack.stop();
      });
    });
    _localMediaContext.mediaSourceStreams.length = 0;
  }

  // release destination tracks
  const tracks = [];
  if (_localMediaContext.audioTrack) {
    tracks.push(_localMediaContext.audioTrack);
  }
  if (_localMediaContext.videoTrack) {
    tracks.push(_localMediaContext.videoTrack);
  }
  if (tracks.length > 0) {
    let handleLocalEnableAvaliableChanged;
    let handleLocalMuteAvaliableChanged;

    tracks.forEach(function (track) {
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

    _localMediaContext.audioTrack = null;
    _localMediaContext.videoTrack = null;
  }

  // release audio processor
  const audioProcessor = _localMediaContext.audioProcessor;
  if (audioProcessor.audioAnalyserNode) {
    audioProcessor.audioAnalyserNode = null;
  }
  if (audioProcessor.audioGainNode) {
    audioProcessor.audioGainNode.disconnect();
    audioProcessor.audioGainNode = null;
  }
  if (audioProcessor.audioSourceNodeMap.size > 0) {
    audioProcessor.audioSourceNodeMap.forEach(function (audioSourceNode) {
      audioSourceNode.disconnect();
    });
    audioProcessor.audioSourceNodeMap.clear();
  }
  if (audioProcessor.audioDestinationNode) {
    audioProcessor.audioDestinationNode.disconnect();
    audioProcessor.audioDestinationNode = null;
  }
  if (audioProcessor.audioContext) {
    audioProcessor.audioContext.close();
    audioProcessor.audioContext = null;
  }

  // call listener
  if (_handleLocalMediaContextChanged) {
    _handleLocalMediaContextChanged(_shadowCopyPlainObject(_localMediaContext));
  }
}

function _getLocalMediaTrackEnabled(trackKind) {
  let trackEnabled = false;

  if (!_localMediaContext.audioTrack && !_localMediaContext.videoTrack) {
    return trackEnabled;
  }

  let track;
  if (trackKind === "audio") {
    track = _localMediaContext.audioTrack;
  } else if (trackKind === "video") {
    track = _localMediaContext.videoTrack;
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
  if (!_localMediaContext.audioTrack && !_localMediaContext.videoTrack) {
    console.error(
      `WebRTCGroupChatController: unexpected empty _localMediaContext.mediaStream when 'set' enabling ( ${trackKind} ) kind of local media device`
    );
    return;
  }

  let track;
  if (trackKind === "audio") {
    track = _localMediaContext.audioTrack;
  } else if (trackKind === "video") {
    track = _localMediaContext.videoTrack;
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
  if (!_localMediaContext.audioTrack && !_localMediaContext.videoTrack) {
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
  if (trackKind === "audio") {
    track = _localMediaContext.audioTrack;
  } else if (trackKind === "video") {
    track = _localMediaContext.videoTrack;
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
  if (!_localMediaContextCreatingPromise) {
    console.debug(`unexpected empty '_localMediaContextCreatingPromise' during starting calling`);
    return;
  }

  _changeCallingState(true);
  _localMediaContextCreatingPromise.then(
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
  _releaseLocalMediaContext();

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
  onLocalMediaContextChanged: function (handler) {
    _handleLocalMediaContextChanged = handler;
  },
  onPeerMediaContextMapChanged: function (handler) {
    _handlePeerMediaContextMapChanged = handler;
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
