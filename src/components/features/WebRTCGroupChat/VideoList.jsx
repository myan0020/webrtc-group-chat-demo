import React from "react";

import style from "./WebRTCGroupChat.module.css";

export default function VideoList({ mediaStreamsMap }) {
  const addMediaStreamToVideoDOM = (videoDOM, mediaStream) => {
    if (!videoDOM) return;
    videoDOM.srcObject = mediaStream;
  };
  const videoList = Array.from(mediaStreamsMap.values()).map(
    (mediaStream, index) => {
      return (
        <video
          key={index}
          className={style.videoContentLocal}
          ref={(videoDOM) => {
            addMediaStreamToVideoDOM(videoDOM, mediaStream);
          }}
          autoPlay
        ></video>
      );
    }
  );

  return <>{videoList}</>;
}