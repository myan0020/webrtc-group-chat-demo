import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const audioAnalyserNodeFFTSize = 512;
const audioCanvasFillColor = "rgba(255, 255, 255, 0)";
const audioCanvasStrokeColor = "rgb(0, 150, 136)";

export default function MediaAudioRenderer(props) {
  const isAudioSourceAvaliable = props.isAudioSourceAvaliable;
  const audioProcessor = props.audioProcessor;

  const [audioCanvasSize, setAudioCanvasSize] = useState({ width: 300, height: 150 });

  const audioCanvasRef = useRef();

  const audioCanvasSizeRef = useRef();
  audioCanvasSizeRef.current = audioCanvasSize;

  const isAudioAnalyserAvaliableRef = useRef();
  const isAudioAnalyserAvaliable =
    isAudioSourceAvaliable && audioProcessor && audioProcessor.audioAnalyserNode ? true : false;
  isAudioAnalyserAvaliableRef.current = isAudioAnalyserAvaliable;

  useEffect(() => {
    if (!isAudioAnalyserAvaliableRef.current) {
      return;
    }

    const audioAnalyserNode = audioProcessor.audioAnalyserNode;
    const audioCanvas = audioCanvasRef.current;

    if (
      audioCanvasSizeRef.current.width !== audioCanvas.clientWidth ||
      audioCanvasSizeRef.current.height !== audioCanvas.clientHeight
    ) {
      setAudioCanvasSize({ width: audioCanvas.clientWidth, height: audioCanvas.clientHeight });
      return;
    }

    const audioCanvasContext = audioCanvas.getContext("2d");
    const audioAnimationIDRef = drawAudioWaveformAnimation(audioAnalyserNode, audioCanvasContext);

    return () => {
      if (typeof audioAnimationIDRef.current === undefined) {
        return;
      }
      cancelAnimationFrame(audioAnimationIDRef.current);
    };
  }, [isAudioAnalyserAvaliableRef.current, audioCanvasSize]);

  const playAudioIfPossible = (audioDOM) => {
    if (!audioDOM) return;
    if (audioProcessor && audioProcessor.playWithAudioDOMLoaded) {
      audioProcessor.playWithAudioDOMLoaded(audioDOM);
    }
  };

  return (
    <Wrapper>
      <Audio
        ref={(audioDOM) => {
          playAudioIfPossible(audioDOM);
        }}
        autoPlay
      />
      <AudioCanvas
        ref={audioCanvasRef}
        width={audioCanvasSize.width}
        height={audioCanvasSize.height}
      />
    </Wrapper>
  );
}

function drawAudioWaveformAnimation(audioAnalyserNode, audioCanvasContext) {
  const animationIDRef = {};

  audioAnalyserNode.fftSize = audioAnalyserNodeFFTSize;
  const bufferLength = audioAnalyserNode.fftSize;

  // We can use Float32Array instead of Uint8Array if we want higher precision
  // const dataArray = new Float32Array(bufferLength);
  const dataArray = new Uint8Array(bufferLength);

  const draw = function () {
    animationIDRef.current = requestAnimationFrame(draw);

    audioAnalyserNode.getByteTimeDomainData(dataArray);

    const WIDTH = audioCanvasContext.canvas.width;
    const HEIGHT = audioCanvasContext.canvas.height;

    audioCanvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    audioCanvasContext.fillStyle = audioCanvasFillColor;
    audioCanvasContext.fillRect(0, 0, WIDTH, HEIGHT);
    audioCanvasContext.lineWidth = 1;
    audioCanvasContext.strokeStyle = audioCanvasStrokeColor;
    audioCanvasContext.beginPath();

    const sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      // 128 (bit) = 1 (byte) / 2
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        audioCanvasContext.moveTo(x, y);
      } else {
        audioCanvasContext.lineTo(x, y);
      }

      x += sliceWidth;
    }

    audioCanvasContext.lineTo(WIDTH, HEIGHT / 2);
    audioCanvasContext.stroke();
  };

  draw();
  return animationIDRef;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Audio = styled.audio``;

const AudioCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;
