import React, { useState } from "react";
import styled from "styled-components";

import MediaUserTag from "./MediaUserTag";
import MediaVideoRenderer from "./MediaVideoRenderer";
import MediaVideoController from "./MediaVideoController";

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

  const playAudioIfPossible = (audioDOM) => {
    if (!audioDOM) return;
    if (audioProcessor && audioProcessor.playWithAudioDOMLoaded) {
      audioProcessor.playWithAudioDOMLoaded(audioDOM);
    }
  };

  return (
    <Wrapper
      onMouseOver={handleMouseOverMediaVideoControllerContainer}
      onMouseLeave={handleMouseLeaveMediaVideoControllerContainer}
    >
      {isAudioSourceAvaliable && (
        <MediaAudioRendererContainer>
          <Audio
            ref={(audioDOM) => {
              playAudioIfPossible(audioDOM);
            }}
            autoPlay
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

  // TODO: 'React.memo' and 'arePropsEqual' not work correctly when checking the prop named 'audioProcessor'

  // return (
  //   <MemorizedMediaVideo
  //     userId={userId}
  //     userName={userName}
  //     forceAudioControlUnavaliable={forceAudioControlUnavaliable}
  //     audioProcessor={audioProcessor}
  //     forceVideoUnpresentable={forceVideoUnpresentable}
  //     videoStream={videoStream}
  //     isVideoCancellable={isVideoCancellable}
  //   />
  // );
}

// function MediaVideoToMemo(props) {
//   const userId = props.userId;
//   const userName = props.userName;

//   const forceAudioControlUnavaliable = props.forceAudioControlUnavaliable;
//   const audioProcessor = props.audioProcessor;

//   const forceVideoUnpresentable = props.forceVideoUnpresentable;
//   const videoStream = props.videoStream;
//   const isVideoCancellable = props.isVideoCancellable;

//   const [isMediaControllerVisible, setIsMediaControllerVisible] = useState(false);

//   const isAudioAvaliable = audioProcessor && audioProcessor.audioGainNode ? true : false;
//   const isVideoAvaliable = videoStream instanceof MediaStream && videoStream.getTracks().length > 0;
//   const isControllable =
//     (forceAudioControlUnavaliable ? false : isAudioAvaliable) || isVideoAvaliable;
//   const isUserTagAvaliable = isAudioAvaliable || isVideoAvaliable;

//   const handleMouseOverMediaVideoControllerContainer = () => {
//     setIsMediaControllerVisible(true);
//   };
//   const handleMouseLeaveMediaVideoControllerContainer = () => {
//     setIsMediaControllerVisible(false);
//   };

//   return (
//     <Wrapper
//       onMouseOver={handleMouseOverMediaVideoControllerContainer}
//       onMouseLeave={handleMouseLeaveMediaVideoControllerContainer}
//     >
//       <MediaUserTagContainer visibility={isUserTagAvaliable ? "visible" : "hidden"}>
//         <MediaUserTag userName={userName} />
//       </MediaUserTagContainer>

//       <MediaVideoRendererContainer>
//         {isVideoAvaliable && <MediaVideoRenderer videoStream={videoStream} />}
//       </MediaVideoRendererContainer>

//       <MediaVideoControllerContainer
//         display={isControllable && isMediaControllerVisible ? "block" : "none"}
//       >
//         <MediaVideoController
//           userId={userId}
//           forceAudioUnavaliable={forceAudioControlUnavaliable}
//           audioProcessor={audioProcessor}
//           forceVideoUnpresentable={forceVideoUnpresentable}
//           isVideoAvaliable={isVideoAvaliable}
//           isVideoCancellable={isVideoCancellable}
//         />
//       </MediaVideoControllerContainer>
//     </Wrapper>
//   );
// }

// const arePropsEqual = (prevProps, nextProps) => {
//   console.log(`test arePropsEqual: `, prevProps, nextProps);

//   const isUserIdEqual = Object.is(prevProps.userId, nextProps.userId);
//   const isUserNameEqual = Object.is(prevProps.userName, nextProps.userName);

//   const isForceAudioControlUnavaliableEqual = Object.is(
//     prevProps.forceAudioControlUnavaliable,
//     nextProps.forceAudioControlUnavaliable
//   );

//   let prevId;
//   let nextId;
//   if (prevProps.audioProcessor) {
//     prevId = prevProps.audioProcessor.id;
//   }
//   if (nextProps.audioProcessor) {
//     nextId = nextProps.audioProcessor.id;
//   }

//   const isAudioProcessorEqual = Object.is(prevId, nextId);

//   const isForceVideoUnpresentableEqual = Object.is(
//     prevProps.forceVideoUnpresentable,
//     nextProps.forceVideoUnpresentable
//   );
//   const isVideoStreamEqual = Object.is(prevProps.videoStream, nextProps.videoStream);
//   const isIsVideoCancellableEqual = Object.is(
//     prevProps.isVideoCancellable,
//     nextProps.isVideoCancellable
//   );

//   return (
//     isUserIdEqual &&
//     isUserNameEqual &&
//     isForceAudioControlUnavaliableEqual &&
//     isAudioProcessorEqual &&
//     isForceVideoUnpresentableEqual &&
//     isVideoStreamEqual &&
//     isIsVideoCancellableEqual
//   );
// };

// const MemorizedMediaVideo = React.memo(MediaVideoToMemo, arePropsEqual);

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

const Audio = styled.audio``;

const MediaVideoRendererContainer = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
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
