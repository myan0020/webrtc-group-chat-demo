import React, { useContext } from "react";
import styled from "styled-components";

import MediaUserTag from "./MediaUserTag.jsx";
import { MediaRenderingContext } from "../../../../context/media-rendering-context.js";
import cancelImageUrl from "./images/cancel_media_presenting_3x.png";

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

export default function MediaVideoRenderer(props) {
  const userId = props.userId;
  const userName = props.userName;
  const mediaStream = props.mediaStream;
  const isCancellable = props.isCancellable;
  const isVideoClickable = props.isVideoClickable;

  const { updatePresenterId } = useContext(MediaRenderingContext);

  const addMediaStreamToVideoDOM = (videoDOM, mediaStream) => {
    if (!videoDOM) return;
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
