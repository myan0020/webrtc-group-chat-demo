import * as React from "react";
import { useSelector } from "react-redux";
import GroupChatService from "webrtc-group-chat-client";

import { selectAuthenticatedUserId, selectAuthenticatedUserName } from "store/authSlice";
import * as mediaChatEnum from "constant/enum/media-chat";

const MediaRenderingContext = React.createContext();
MediaRenderingContext.displayName = "MediaRenderingContext";

const numberOfInitialVisibleMediaMembers = 4;

function MediaRenderingContextProvider({ children }) {
  const authenticatedUserId = useSelector(selectAuthenticatedUserId);
  const authenticatedUserName = useSelector(selectAuthenticatedUserName);
  const [localMediaContext, setLocalMediaContext] = React.useState();
  const [peerMediaContextMap, setPeerMediaContextMap] = React.useState();
  const [mediaAccessibilityType, setMediaAccessibilityType] = React.useState(
    mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
  );
  const [presenterId, setPresenterId] = React.useState();

  const mediaAccessibilityTypeRef = React.useRef(mediaAccessibilityType);
  mediaAccessibilityTypeRef.current = mediaAccessibilityType;

  React.useEffect(() => {
    GroupChatService.onLocalMediaContextChanged((localMediaContext) => {
      setLocalMediaContext(localMediaContext);
    });
    GroupChatService.onPeerMediaContextMapChanged((peerMediaContextMap) => {
      console.debug(
        `onPeerMediaContextMapChanged called with peer stream map size ${
          peerMediaContextMap ? peerMediaContextMap.map.size : "unknown"
        }`
      );
      setPeerMediaContextMap(peerMediaContextMap);
    });
  }, []);

  // config media rendering data source list

  let localVideoStream;
  if (localMediaContext && localMediaContext.videoTrack) {
    localVideoStream = new MediaStream([localMediaContext.videoTrack]);
  }

  let localAudioProcessor;
  if (localMediaContext && localMediaContext.audioProcessor) {
    localAudioProcessor = localMediaContext.audioProcessor;
  }

  const mediaRenderingDataSourceList = [
    {
      userId: authenticatedUserId,
      userName: authenticatedUserName,
      isAudioSourceAvaliable: localMediaContext && localMediaContext.audioTrack ? true : false,
      audioProcessor: localAudioProcessor,
      videoStream: localVideoStream,
    },
  ];

  if (peerMediaContextMap && peerMediaContextMap.map.size > 0) {
    Array.from(peerMediaContextMap.map.entries()).forEach(([peerId, peerMediaContext]) => {
      const peerName = GroupChatService.getPeerNameById(peerId);
      if (typeof peerName === undefined) {
        return;
      }
      let videoStream;
      if (peerMediaContext.videoTrack) {
        videoStream = new MediaStream([peerMediaContext.videoTrack]);
      }
      mediaRenderingDataSourceList.push({
        userId: peerId,
        userName: peerName,
        isAudioSourceAvaliable: peerMediaContext && peerMediaContext.audioTrack ? true : false,
        audioProcessor: peerMediaContext.audioProcessor,
        videoStream: videoStream,
      });
    });
  }

  if (mediaRenderingDataSourceList.length < numberOfInitialVisibleMediaMembers) {
    const numberOfRestVisibleMediaMembers =
      numberOfInitialVisibleMediaMembers - mediaRenderingDataSourceList.length;
    for (let index = 0; index < numberOfRestVisibleMediaMembers; index++) {
      const emptyMediaRenderingDataSource = {};
      mediaRenderingDataSourceList.push(emptyMediaRenderingDataSource);
    }
  }

  // config presenter's media rendering data source

  let mediaRenderingDataSourceForPresenter;
  if (typeof presenterId === "string" && presenterId.length > 0) {
    mediaRenderingDataSourceForPresenter = mediaRenderingDataSourceList.find(
      (mediaRenderingDataSource) => mediaRenderingDataSource.userId === presenterId
    );
  }

  const updatePresenterId = (presenterId) => {
    if (
      mediaAccessibilityType ===
      mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
    ) {
      setPresenterId(presenterId);
    }
  };

  const updateMediaAccessibilityType = (toMediaAccessibilityType) => {
    if (mediaAccessibilityTypeRef.current !== toMediaAccessibilityType) {
      setMediaAccessibilityType(toMediaAccessibilityType);
    }
  };

  const resetMediaRenderingContext = () => {
    setLocalMediaContext(null);
    setPeerMediaContextMap(null);
    setMediaAccessibilityType(
      mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
    );
    setPresenterId(undefined);
  };

  const contextValue = {
    numberOfInitialVisibleMediaMembers: numberOfInitialVisibleMediaMembers,
    mediaRenderingDataSourceList,
    mediaRenderingDataSourceForPresenter: { ...mediaRenderingDataSourceForPresenter },
    updatePresenterId,
    mediaAccessibilityType,
    updateMediaAccessibilityType,

    resetMediaRenderingContext,
  };
  return (
    <MediaRenderingContext.Provider value={contextValue}>{children}</MediaRenderingContext.Provider>
  );
}

export { MediaRenderingContextProvider, MediaRenderingContext };
