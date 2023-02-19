import React, { useState } from "react";
import styled from "styled-components";

import MediaUserTag from "./MediaUserTag";
import MediaVideoRenderer from "./MediaVideoRenderer";
import MediaVideoController from "./MediaVideoController";
import MediaAudioRenderer from "./MediaAudioRenderer";

export default function MediaVideo(props) {
  // required props
  const userId = props.userId;
  const userName = props.userName;
  const forceAudioOutputUnavaliable = props.forceAudioOutputUnavaliable;
  const forceVideoUnpresentable = props.forceVideoUnpresentable;
  const videoStream = props.videoStream;
  const isVideoCancellable = props.isVideoCancellable;
  // nullable props
  const isAudioSourceAvaliable = props.isAudioSourceAvaliable;
  const audioProcessor = props.audioProcessor;

  const [isMediaControllerVisible, setIsMediaControllerVisible] = useState(false);

  const isAudioGainNodeAvaliable = audioProcessor && audioProcessor.audioGainNode ? true : false;
  const isVideoSourceAvaliable =
    videoStream instanceof MediaStream && videoStream.getTracks().length > 0;
  const isUserTagAvaliable = isAudioSourceAvaliable || isVideoSourceAvaliable;
  const isAudioControlAvaliable =
    !forceAudioOutputUnavaliable && isAudioSourceAvaliable && isAudioGainNodeAvaliable;
  const isVideoControlAvaliable =
    isVideoSourceAvaliable && (!forceVideoUnpresentable || isVideoCancellable);
  const isMediaControlAvaliable = isAudioControlAvaliable || isVideoControlAvaliable;

  const handleMouseOverMediaVideoControllerContainer = () => {
    setIsMediaControllerVisible(true);
  };
  const handleMouseLeaveMediaVideoControllerContainer = () => {
    setIsMediaControllerVisible(false);
  };

  return (
    <Wrapper
      onMouseOver={handleMouseOverMediaVideoControllerContainer}
      onMouseLeave={handleMouseLeaveMediaVideoControllerContainer}
    >
      {isAudioSourceAvaliable && (
        <MediaAudioRendererContainer>
          <MediaAudioRenderer
            isAudioSourceAvaliable={isAudioSourceAvaliable}
            audioProcessor={audioProcessor}
          />
        </MediaAudioRendererContainer>
      )}
      {isVideoSourceAvaliable && (
        <MediaVideoRendererContainer>
          <MediaVideoRenderer videoStream={videoStream} />
        </MediaVideoRendererContainer>
      )}
      {isMediaControlAvaliable && isMediaControllerVisible && (
        <MediaVideoControllerContainer>
          <MediaVideoController
            userId={userId}
            isAudioControlAvaliable={isAudioControlAvaliable}
            audioProcessor={audioProcessor}
            forceVideoUnpresentable={forceVideoUnpresentable}
            isVideoSourceAvaliable={isVideoSourceAvaliable}
            isVideoCancellable={isVideoCancellable}
          />
        </MediaVideoControllerContainer>
      )}
      {isUserTagAvaliable && (
        <MediaUserTagContainer>
          <MediaUserTag userName={userName} />
        </MediaUserTagContainer>
      )}
    </Wrapper>
  );
}

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

const MediaAudioRendererContainer = styled.div`
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
`;

const MediaVideoRendererContainer = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  background-color: rgb(236, 239, 241);
`;

const MediaUserTagContainer = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  max-width: calc(100% - 2 * 5px);
  height: 25px;
  border-radius: 10px;
  border-color: transparent;
  overflow: hidden;
`;

const MediaVideoControllerContainer = styled.div`
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
`;
