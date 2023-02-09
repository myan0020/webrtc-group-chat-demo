import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";
import { selectAuthenticatedUserId, selectAuthenticatedUserName } from "store/authSlice";
import * as mediaChatEnum from "constant/enum/media-chat";

const MediaRenderingContext = React.createContext();
MediaRenderingContext.displayName = "MediaRenderingContext";

const numberOfInitialVisibleMediaMembers = 4;

function MediaRenderingContextProvider({ children }) {
  const authenticatedUserId = useSelector(selectAuthenticatedUserId);
  const authenticatedUserName = useSelector(selectAuthenticatedUserName);
  const [localMediaStream, setLocalMediaStream] = useState();
  const [peerUserMediaStreamMap, setPeerUserMediaStreamMap] = useState();
  const [mediaAccessibilityType, setMediaAccessibilityType] = useState(
    mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
  );
  const [presenterId, setPresenterId] = useState();

  const mediaAccessibilityTypeRef = useRef(mediaAccessibilityType);
  mediaAccessibilityTypeRef.current = mediaAccessibilityType;

  useEffect(() => {
    WebRTCGroupChatService.onLocalMediaStreamChanged((mediaStream) => {
      setLocalMediaStream(mediaStream);
    });
    WebRTCGroupChatService.onPeerMediaStreamMapChanged((peerUserMediaStreamMap) => {
      console.debug(
        `onPeerMediaStreamMapChanged called with peer stream map size ${
          peerUserMediaStreamMap ? peerUserMediaStreamMap.size() : "unknown"
        }`
      );
      setPeerUserMediaStreamMap(peerUserMediaStreamMap);
    });
  }, []);

  // config media rendering data source list
  const mediaRenderingDataSourceList = [
    {
      userId: authenticatedUserId,
      userName: authenticatedUserName,
      mediaStream: localMediaStream,
      volume: 0,
    },
  ];
  if (
    peerUserMediaStreamMap &&
    peerUserMediaStreamMap.size() > 0 &&
    peerUserMediaStreamMap.peerMap
  ) {
    Array.from(peerUserMediaStreamMap.peerMap.entries()).forEach(([peerId, mediaStream]) => {
      const peerName = WebRTCGroupChatService.getPeerNameById(peerId);
      mediaRenderingDataSourceList.push({
        userId: peerId,
        userName: peerName,
        mediaStream,
        volume: 1,
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
    setLocalMediaStream(null);
    setPeerUserMediaStreamMap(null);
    setMediaAccessibilityType(
      mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
    );
    setPresenterId(undefined);
  };

  const contextValue = {
    numberOfInitialVisibleMediaMembers: numberOfInitialVisibleMediaMembers,
    mediaRenderingDataSourceList,
    mediaRenderingDataSourceForPresenter: { ...mediaRenderingDataSourceForPresenter, volume: 0 },
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
