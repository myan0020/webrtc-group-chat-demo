import React from "react";
import styled from "styled-components";

export default function MediaVideoRenderer({ videoStream }) {
  const addVideoStreamToVideoDOM = (videoDOM, videoStream) => {
    if (!videoDOM) return;
    if (!(videoStream instanceof MediaStream)) return;
    videoDOM.srcObject = videoStream;
  };

  return (
    <Wrapper>
      <Video
        ref={(videoDOM) => {
          addVideoStreamToVideoDOM(videoDOM, videoStream);
        }}
        autoPlay
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  display: block;
  width: 100%;
  height: 100%;
`;
