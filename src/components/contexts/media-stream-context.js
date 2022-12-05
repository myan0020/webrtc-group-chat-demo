import React, { useEffect, useState } from "react";

import WebRTCGroupChatService from "../features/WebRTCGroupChat/WebRTCGroupChatService/WebRTCGroupChatService";

const MediaStreamContext = React.createContext();
MediaStreamContext.displayName = "WebRTCGroupChatContext";

function MediaStreamContextProvider({ children }) {
  const [localMediaStream, setLocalMediaStream] = useState();
  const [peerUserMediaStreamMap, setPeerUserMediaStreamMap] = useState();

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

  const contextValue = {
    localMediaStream,
    peerUserMediaStreamMap,
  };
  return <MediaStreamContext.Provider value={contextValue}>{children}</MediaStreamContext.Provider>;
}

export { MediaStreamContextProvider, MediaStreamContext };
