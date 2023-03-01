import * as React from "react";
import styled from "styled-components";

import * as volumeUnmutedIconUrl from "resource/image/sound_volume_unmuted_3x.png";
import * as volumeMutedIconUrl from "resource/image/sound_volume_muted_3x.png";

const minVolumeMultipler = 0;
const defaultVolumeMultipler = 1;
const maxVolumeMultipler = 10;
const volumeMultiplerStep = 0.1;

export default function MediaVideoVolumeController({ audioProcessor }) {
  const [volumeMultipler, setVolumeMultipler] = React.useState(audioProcessor.volumeMultipler);

  const volumeIconUrl =
    volumeMultipler <= minVolumeMultipler + volumeMultiplerStep
      ? volumeMutedIconUrl
      : volumeUnmutedIconUrl;

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
    const newVolumnMultiplier =
      volumeMultipler === minVolumeMultipler ? defaultVolumeMultipler : minVolumeMultipler;
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
        min={minVolumeMultipler}
        max={maxVolumeMultipler}
        value={volumeMultipler}
        step={volumeMultiplerStep}
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
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }
`;

const VolumeMultiplierInput = styled.input`
  flex: 1 1 0;
  height: 30%;
  width: 50px;
  border-radius: 5px;

  -webkit-appearance: none;
  background: #d3d3d3;
  outline: none;
  opacity: 0.4;
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
