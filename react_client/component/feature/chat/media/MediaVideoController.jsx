import React, { useContext } from "react";
import styled from "styled-components";

import { GlobalContext } from "context/global-context";
import MediaVideoVolumeController from "./MediaVideoVolumeController";
import updatePresenterImageUrl from "resource/image/present_video_3x.png";
import cancelImageUrl from "resource/image/cancel_media_presenting_3x.png";

export default function MediaVideoController(props) {
  const userId = props.userId;

  const forceAudioUnavaliable = props.forceAudioUnavaliable;
  const audioProcessor = props.audioProcessor;

  const forceVideoUnpresentable = props.forceVideoUnpresentable;
  const isVideoAvaliable = props.isVideoAvaliable;
  const isVideoCancellable = props.isVideoCancellable;

  const { updatePresenterId } = useContext(GlobalContext);

  return (
    <MemorizedMediaVideoController
      userId={userId}
      forceAudioUnavaliable={forceAudioUnavaliable}
      audioProcessor={audioProcessor}
      forceVideoUnpresentable={forceVideoUnpresentable}
      isVideoAvaliable={isVideoAvaliable}
      isVideoCancellable={isVideoCancellable}
      updatePresenterId={updatePresenterId}
    />
  );
}

const MemorizedMediaVideoController = React.memo(MediaVideoControllerToMemo, arePropsEqual);

function MediaVideoControllerToMemo(props) {
  const userId = props.userId;

  const forceAudioUnavaliable = props.forceAudioUnavaliable;
  const audioProcessor = props.audioProcessor;

  const forceVideoUnpresentable = props.forceVideoUnpresentable;
  const isVideoAvaliable = props.isVideoAvaliable;
  const isVideoCancellable = props.isVideoCancellable;

  const updatePresenterId = props.updatePresenterId;

  const isAudioGainNodeAvaliable = audioProcessor && audioProcessor.audioGainNode ? true : false;
  const isAudioVolumeControlAvaliable = forceAudioUnavaliable ? false : isAudioGainNodeAvaliable;
  const isVideoPresentable = forceVideoUnpresentable ? false : isVideoAvaliable;

  const handleUpdatePresenterClick = () => {
    updatePresenterId(userId);
  };
  const handleCancelClick = () => {
    updatePresenterId(undefined);
  };

  return (
    <Wrapper>
      <CancelButton
        onClick={handleCancelClick}
        visibility={isVideoCancellable ? "visible" : "hidden"}
      />
      <UpdatePresenterButton
        onClick={handleUpdatePresenterClick}
        visibility={isVideoPresentable ? "visible" : "hidden"}
      />
      <MediaVideoVolumeControllerContainer>
        {isAudioVolumeControlAvaliable && (
          <MediaVideoVolumeController audioProcessor={audioProcessor} />
        )}
      </MediaVideoVolumeControllerContainer>
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isUserIdEqual = Object.is(prevProps.userId, nextProps.userId);

  const isForceAudioUnavaliableEqual = Object.is(
    prevProps.forceAudioUnavaliable,
    nextProps.forceAudioUnavaliable
  );
  const isAudioProcessorEqual = Object.is(prevProps.audioProcessor, nextProps.audioProcessor);

  const isForceVideoUnpresentableEqual = Object.is(
    prevProps.forceVideoUnpresentable,
    nextProps.forceVideoUnpresentable
  );
  const isIsVideoAvaliableEqual = Object.is(prevProps.isVideoAvaliable, nextProps.isVideoAvaliable);
  const isIsVideoCancellableEqual = Object.is(
    prevProps.isVideoCancellable,
    nextProps.isVideoCancellable
  );

  const isUpdatePresenterIdEqual = Object.is(
    prevProps.updatePresenterId,
    nextProps.updatePresenterId
  );

  return (
    isUserIdEqual &&
    isForceAudioUnavaliableEqual &&
    isAudioProcessorEqual &&
    isForceVideoUnpresentableEqual &&
    isIsVideoAvaliableEqual &&
    isIsVideoCancellableEqual &&
    isUpdatePresenterIdEqual
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UpdatePresenterButton = styled.button`
  width: 200px;
  height: 150px;
  visibility: ${(props) => props.visibility};
  background-image: url(${updatePresenterImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  background-color: transparent;
  border-color: transparent;
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

const MediaVideoVolumeControllerContainer = styled.div`
  position: absolute;
  bottom: 5%;
  right: 10%;
  width: 80%;
  height: 50px;
`;
