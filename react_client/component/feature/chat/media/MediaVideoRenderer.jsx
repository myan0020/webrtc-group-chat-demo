import React, { useContext, useState } from "react";
import styled from "styled-components";

import MediaUserTag from "./MediaUserTag";
import cancelImageUrl from "resource/image/cancel_media_presenting_3x.png";
import { GlobalContext } from "context/global-context";

export default function MediaVideoRenderer(props) {
  const ignoreAudioAvaliablity = props.ignoreAudioAvaliablity;
  const userId = props.userId;
  const userName = props.userName;
  const videoStream = props.videoStream;
  const isCancellable = props.isCancellable;
  const isVideoClickable = props.isVideoClickable;
  const audioProcessor = props.audioProcessor;

  const { updatePresenterId } = useContext(GlobalContext);

  return (
    <MemorizedMediaVideoRenderer
      ignoreAudioAvaliablity={ignoreAudioAvaliablity}
      userId={userId}
      userName={userName}
      videoStream={videoStream}
      isCancellable={isCancellable}
      isVideoClickable={isVideoClickable}
      updatePresenterId={updatePresenterId}
      audioProcessor={audioProcessor}
    />
  );
}

const MemorizedMediaVideoRenderer = React.memo(MediaVideoRendererToMemo, arePropsEqual);

function MediaVideoRendererToMemo(props) {
  const ignoreAudioAvaliablity = props.ignoreAudioAvaliablity;
  const userId = props.userId;
  const userName = props.userName;
  const videoStream = props.videoStream;
  const isCancellable = props.isCancellable;
  const isVideoClickable = props.isVideoClickable;
  const updatePresenterId = props.updatePresenterId;

  const audioProcessor = props.audioProcessor;

  const isAudioAvaliable = audioProcessor && audioProcessor.audioGainNode;
  const isVideoAvaliable = videoStream instanceof MediaStream && videoStream.getTracks().length > 0;

  const addVideoStreamToVideoDOM = (videoDOM, videoStream) => {
    if (!videoDOM) return;
    if (!(videoStream instanceof MediaStream)) return;
    videoDOM.srcObject = videoStream;
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

  const isMediaUserTagAvaliable =
    (ignoreAudioAvaliablity ? false : isAudioAvaliable) || isVideoAvaliable;
  const isCancelButtonAvaliable = isVideoAvaliable && isCancellable;
  const isAudioVolumeControlAvaliable = ignoreAudioAvaliablity ? false : isAudioAvaliable;

  return (
    <Wrapper>
      <MediaUserTagContainer visibility={isMediaUserTagAvaliable ? "visible" : "hidden"}>
        <MediaUserTag userName={userName} />
      </MediaUserTagContainer>
      {isVideoAvaliable && (
        <Video
          ref={(videoDOM) => {
            addVideoStreamToVideoDOM(videoDOM, videoStream);
          }}
          autoPlay
          isClickable={isVideoClickable}
          onClick={handleVideoClick}
        ></Video>
      )}
      <CancelButton
        visibility={isCancelButtonAvaliable ? "visible" : "hidden"}
        onClick={handleCancelClick}
      />

      {isAudioVolumeControlAvaliable && <AudioVolumeControl audioProcessor={audioProcessor} />}
    </Wrapper>
  );
}

function AudioVolumeControl({ audioProcessor }) {
  const [volumeMultipler, setVolumeMultipler] = useState(audioProcessor.volumeMultipler);
  const handleVolumnMultiplierChange = (e) => {
    if (!audioProcessor) {
      return;
    }
    audioProcessor.volumeMultipler = e.target.value;
    setVolumeMultipler(e.target.value);
  };

  return (
    <VolumeMultiplierInput
      type='range'
      visibility={"visible"}
      min='0'
      max='2'
      value={volumeMultipler}
      step='0.1'
      onChange={handleVolumnMultiplierChange}
    />
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isIgnoreAudioAvaliablityEqual = Object.is(
    prevProps.ignoreAudioAvaliablity,
    nextProps.ignoreAudioAvaliablity
  );
  const isUserIdEqual = Object.is(prevProps.userId, nextProps.userId);
  const isUserNameEqual = Object.is(prevProps.userName, nextProps.userName);
  const isVideoStreamEqual = Object.is(prevProps.videoStream, nextProps.videoStream);
  const isIsCancellableEqual = Object.is(prevProps.isCancellable, nextProps.isCancellable);
  const isIsVideoClickableEqual = Object.is(prevProps.isVideoClickable, nextProps.isVideoClickable);
  const isUpdatePresenterIdEqual = Object.is(
    prevProps.updatePresenterId,
    nextProps.updatePresenterId
  );

  const isMediaProcessorEqual = Object.is(prevProps.mediaProcessor, nextProps.mediaProcessor);

  return (
    isIgnoreAudioAvaliablityEqual &&
    isUserIdEqual &&
    isUserNameEqual &&
    isVideoStreamEqual &&
    isIsCancellableEqual &&
    isIsVideoClickableEqual &&
    isUpdatePresenterIdEqual &&
    isMediaProcessorEqual
  );
};

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

const VolumeMultiplierInput = styled.input`
  visibility: ${(props) => props.visibility};
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 100px;
  height: 30px;
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
