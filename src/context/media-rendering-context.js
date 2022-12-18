import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";
import { selectAuth } from "store/authSlice";

const MediaRenderingContext = React.createContext();
MediaRenderingContext.displayName = "MediaRenderingContext";

export const mediaAccessibilityTypeEnum = {
  MEDIA_ACCESSIBILITY_TYPE_PRESENTATION: "free_for_presentation",
  MEDIA_ACCESSIBILITY_TYPE_EQUALITY: "free_for_equality",
};

const numberOfInitialVisibleMediaMembers = 4;

function MediaRenderingContextProvider({ children }) {
  const { authenticatedUserId } = useSelector(selectAuth);
  const [localMediaStream, setLocalMediaStream] = useState();
  const [peerUserMediaStreamMap, setPeerUserMediaStreamMap] = useState();
  const [mediaAccessibilityType, setMediaAccessibilityType] = useState(
    mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
  );
  const [presenterId, setPresenterId] = useState();

  const mediaAccessibilityTypeRef = useRef(mediaAccessibilityType);
  mediaAccessibilityTypeRef.current = mediaAccessibilityType;

  useEffect(() => {
    WebRTCGroupChatService.onLocalMediaStreamChanged((mediaStream) => {
      setLocalMediaStream(mediaStream);
    });
    WebRTCGroupChatService.onPeerMediaStreamMapChanged((peerUserMediaStreamMap) => {
      console.log(
        `onPeerMediaStreamMapChanged called with peer stream map size ${
          peerUserMediaStreamMap ? peerUserMediaStreamMap.size() : "unknown"
        }`
      );
      setPeerUserMediaStreamMap(peerUserMediaStreamMap);
    });
  }, []);

  // config media rendering data source list
  const mediaRenderingDataSourceList = [
    { userId: authenticatedUserId, userName: "You", mediaStream: localMediaStream },
  ];
  if (
    peerUserMediaStreamMap &&
    peerUserMediaStreamMap.size() > 0 &&
    peerUserMediaStreamMap.peerMap
  ) {
    Array.from(peerUserMediaStreamMap.peerMap.entries()).forEach(([peerId, mediaStream]) => {
      mediaRenderingDataSourceList.push({ userId: peerId, userName: peerId, mediaStream });
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
      mediaAccessibilityType === mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
    ) {
      setPresenterId(presenterId);
    }
  };

  const updateMediaAccessibilityType = (toMediaAccessibilityType) => {
    if (mediaAccessibilityTypeRef.current !== toMediaAccessibilityType) {
      setMediaAccessibilityType(toMediaAccessibilityType);
    }
  };

  const contextValue = {
    numberOfInitialVisibleMediaMembers: numberOfInitialVisibleMediaMembers,
    mediaRenderingDataSourceList,
    mediaRenderingDataSourceForPresenter: { ...mediaRenderingDataSourceForPresenter },
    updatePresenterId,
    mediaAccessibilityTypeEnum,
    mediaAccessibilityType,
    updateMediaAccessibilityType,
  };
  return (
    <MediaRenderingContext.Provider value={contextValue}>{children}</MediaRenderingContext.Provider>
  );
}

export { MediaRenderingContextProvider, MediaRenderingContext };
