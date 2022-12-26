import React from "react";

import style from "./WebRTCGroupChat.module.css";

export default function VideoList({ mediaStreamMap }) {
  const addMediaStreamToVideoDOM = (videoDOM, mediaStream) => {
    if (!videoDOM) return;
    videoDOM.srcObject = mediaStream;
  };
  const videoList = Array.from(mediaStreamMap.values()).map((mediaStream, index) => {
    return (
      <video
        key={index}
        className={style.videoContent}
        ref={(videoDOM) => {
          addMediaStreamToVideoDOM(videoDOM, mediaStream);
        }}
        autoPlay
      ></video>
    );
  });

  return <div className={style.videoWrapper}>{videoList}</div>;
}
