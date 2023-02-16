import React, { useState } from "react";
import styled from "styled-components";

import volumeUnmutedIconUrl from "resource/image/sound_volume_unmuted_3x.png";
import volumeMutedIconUrl from "resource/image/sound_volume_muted_3x.png";

export default function MediaVideoVolumeController({ audioProcessor }) {
  const [volumeMultipler, setVolumeMultipler] = useState(audioProcessor.volumeMultipler);
  const volumeIconUrl = volumeMultipler === 0 ? volumeMutedIconUrl : volumeUnmutedIconUrl;

  const handleVolumnMultiplierChange = (e) => {
    if (!audioProcessor) {
      return;
    }
    audioProcessor.volumeMultipler = e.target.value;
    setVolumeMultipler(e.target.value);
  };

  const handleVolumnMultiplierChangeToFixValue = (e) => {
    if (!audioProcessor) {
      return;
    }
    const newVolumnMultiplier = volumeMultipler === 0 ? 1 : 0;
    audioProcessor.volumeMultipler = newVolumnMultiplier;
    setVolumeMultipler(newVolumnMultiplier);
  };

  return (
    <Wrapper>
      <VolumeIconWrapper
        volumeIconUrl={volumeIconUrl}
        onClick={handleVolumnMultiplierChangeToFixValue}
      />
      <VolumeMultiplierInput
        type='range'
        min='0'
        max='2'
        value={volumeMultipler}
        step='0.1'
        onChange={handleVolumnMultiplierChange}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const VolumeIconWrapper = styled.button`
  flex: 0 0 content;
  height: 100%;
  aspect-ratio: 1;
  background-image: url(${(props) => props.volumeIconUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  background-color: transparent;
  border-color: transparent;
`;

const VolumeMultiplierInput = styled.input`
  flex: 1 1 0;
  height: 30%;
  width: 50px;
  border-radius: 5px;

  -webkit-appearance: none;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;

  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: #04aa6d;
    cursor: pointer;
    width: 16px;
    height: 16px;
    border-radius: 8px;
  }

  &::-moz-range-thumb {
    background: #04aa6d;
    cursor: pointer;
    width: 16px;
    height: 16px;
    border-radius: 8px;
  }
`;
