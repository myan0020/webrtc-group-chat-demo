import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Hls from "hls.js";
import videojs from "video.js";

import style from "./VideoPlayer.module.css";

export default function VideoPlayer({
  videoId,
  clipFromInSeconds,
  clipToInSeconds,
}) {
  let videoClippingState;
  let setVideoClippingState;
  let clippedVideoSource;
  let setClippedVideoSource;

  let playerRef;

  const regxResult = /([\w-]+)\.(\w+)/g.exec(videoId);
  const videoIdExt = regxResult[2];

  if (
    videoIdExt === "mp4" &&
    !isNaN(clipFromInSeconds) &&
    !isNaN(clipToInSeconds)
  ) {
    [videoClippingState, setVideoClippingState] = useState("idle");
    [clippedVideoSource, setClippedVideoSource] = useState("");
  } else if (videoIdExt === "m3u8") {
    // For video.js
    // playerRef = React.useRef(null);
  }

  // For hls.js
  useEffect(() => {
    if (videoIdExt === "m3u8") {
      const video = document.getElementsByClassName(style.videoContent)[0];
      if (Hls.isSupported() && video) {
        const hls = new Hls();
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(`/video_hls?id=${encodeURIComponent(videoId)}`);
          hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            console.log(
              "HLS: ",
              "Manifest loaded, found " + data.levels.length + " quality level"
            );
          });
        });
      }
    }
  }, []);

  // // For video.js
  // useEffect(() => {
  //   if (videoIdExt === "m3u8") {
  //     if (!playerRef.current) {
  //       const options = {
  //         controls: true,
  //         preload: "auto",
  //         language: "zh-CN",
  //         responsive: true,
  //         fluid: true,
  //       };
  //       const player = (playerRef.current = videojs("video", options));
  //       return () => {
  //         if (player) {
  //           player.dispose();
  //           playerRef.current = null;
  //         }
  //       };
  //     }
  //   }
  // }, [playerRef]);

  useEffect(() => {
    if (videoClippingState === "idle") {
      fetchClippedVideoBuffer(videoId, clipFromInSeconds, clipToInSeconds).then(
        (arraybuffer) => {
          const blob = new Blob([
            new Uint8Array(arraybuffer, 0, arraybuffer.byteLength),
          ]);
          setClippedVideoSource(URL.createObjectURL(blob));
          setVideoClippingState("success");
        }
      );
      setVideoClippingState("clipping");
    }
  }, [videoClippingState]);
  
  if (clippedVideoSource) {
    return (
      <video
        src={clippedVideoSource}
        width="300"
        controls
        className={style.videoContent}
      />
    );
  } else {
    return (
      // For hls.js
      <video id="video" width="400" controls className={`${style.videoContent}`}>
        <source
          src={`/video_hls?id=${encodeURIComponent(videoId)}`}
          type="application/x-mpegURL"
        />
      </video>

      // // For video.js
      // <video id="video" width="400" className="video-js vjs-big-play-centered">
      //   <source
      //     src={`/video_hls?id=${encodeURIComponent(videoId)}`}
      //     type="application/x-mpegURL"
      //   />
      // </video>
    );
  }
}

async function fetchClippedVideoBuffer(
  videoId,
  rangeStartInSeconds,
  rangeEndInSeconds
) {
  const rangeValue = encodeURIComponent(
    `${rangeStartInSeconds}-${rangeEndInSeconds}`
  );
  const url = `/video_clip/?id=${videoId}&rangeInSeconds=${rangeValue}`;
  const config = {
    method: "get",
    url: url,
    responseType: "arraybuffer",
  };
  const response = await axios(config);
  return response.data;
}
