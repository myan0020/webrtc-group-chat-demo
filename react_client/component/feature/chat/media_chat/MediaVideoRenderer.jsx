import React, { useContext } from "react";
import styled from "styled-components";

import MediaUserTag from "./MediaUserTag";
import cancelImageUrl from "../../../../resource/image/cancel_media_presenting_3x.png";
import { GlobalContext } from "../../../../context/global-context";

const Wrapper = styled.div`
  box-sizing: border-box;
  border-width: 3px;
  width: 100%;
  height: 100%;
  position: relative;
  border: 3px solid rgba(250, 250, 250);
  border-radius: 10px;
  background-color: rgb(236, 239, 241);
`;

const MediaUserTagContainer = styled.div`
  visibility: ${(props) => props.visibility};
  position: absolute;
  top: 5px;
  left: 5px;
  max-width: calc(100% - 2 * 5px);
  height: 25px;
  border-radius: 10px;
  border-color: transparent;
  overflow: hidden;
  z-index: 1;
`;

const CancelButton = styled.button`
  visibility: ${(props) => props.visibility};
  position: absolute;
  top: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  border-color: transparent;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  background-image: url(${cancelImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;

const Video = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  &:active {
    opacity: ${(props) => (props.isClickable ? 0.7 : 1)};
  }
  &:hover {
    opacity: ${(props) => (props.isClickable ? 0.7 : 1)};
  }
`;

function MediaVideoRendererToMemo(props) {
  const userId = props.userId;
  const userName = props.userName;
  const mediaStream = props.mediaStream;
  const volume = props.volume;
  const isCancellable = props.isCancellable;
  const isVideoClickable = props.isVideoClickable;
  const updatePresenterId = props.updatePresenterId;

  const addMediaStreamToVideoDOM = (videoDOM, mediaStream) => {
    if (!videoDOM) return;
    if (typeof volume === "number") {
      videoDOM.volume = volume;
    }
    videoDOM.srcObject = mediaStream;
  };
  const handleVideoClick = () => {
    if (!isVideoClickable) {
      return;
    }
    updatePresenterId(userId);
  };
  const handleCancelClick = () => {
    updatePresenterId(undefined);
  };

  return (
    <Wrapper>
      <MediaUserTagContainer visibility={mediaStream ? "visible" : "hidden"}>
        <MediaUserTag userName={userName} />
      </MediaUserTagContainer>
      {mediaStream && (
        <Video
          ref={(videoDOM) => {
            addMediaStreamToVideoDOM(videoDOM, mediaStream);
          }}
          autoPlay
          isClickable={isVideoClickable}
          onClick={handleVideoClick}
        ></Video>
      )}
      <CancelButton
        visibility={isCancellable ? "visible" : "hidden"}
        onClick={handleCancelClick}
      />
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isUserIdEqual = Object.is(prevProps.userId, nextProps.userId);
  const isUserNameEqual = Object.is(prevProps.userName, nextProps.userName);
  const isMediaStreamEqual = Object.is(prevProps.mediaStream, nextProps.mediaStream);
  const isVolumeEqual = Object.is(prevProps.volume, nextProps.volume);
  const isIsCancellableEqual = Object.is(prevProps.isCancellable, nextProps.isCancellable);
  const isIsVideoClickableEqual = Object.is(prevProps.isVideoClickable, nextProps.isVideoClickable);
  const isUpdatePresenterIdEqual = Object.is(
    prevProps.updatePresenterId,
    nextProps.updatePresenterId
  );
  return (
    isUserIdEqual &&
    isUserNameEqual &&
    isMediaStreamEqual &&
    isVolumeEqual &&
    isIsCancellableEqual &&
    isIsVideoClickableEqual &&
    isUpdatePresenterIdEqual
  );
};

const MemorizedMediaVideoRenderer = React.memo(MediaVideoRendererToMemo, arePropsEqual);

export default function MediaVideoRenderer(props) {
  const userId = props.userId;
  const userName = props.userName;
  const mediaStream = props.mediaStream;
  const volume = props.volume;
  const isCancellable = props.isCancellable;
  const isVideoClickable = props.isVideoClickable;

  const { updatePresenterId } = useContext(GlobalContext);

  return (
    <MemorizedMediaVideoRenderer
      userId={userId}
      userName={userName}
      mediaStream={mediaStream}
      volume={volume}
      isCancellable={isCancellable}
      isVideoClickable={isVideoClickable}
      updatePresenterId={updatePresenterId}
    />
  );
}
