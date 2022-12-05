import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import SingleTabSwitch, {
  singleTabSwitchOptionBuilder,
  singleTabSwitchPropsBuilder,
} from "../../generic/switch/SingleTabSwitch.jsx";
import { selectMediaChat, toggleAudioEnabling } from "../mediaChatSlice";
import enableAudioUrl from "./images/enable_audio_1x.png";
import disableAudioUrl from "./images/disable_audio_1x.png";
import audioEnablingDisabledUrl from "./images/audio_enabling_disabled_1x.png";

const MediaAudioEnablingSwitchWrapper = styled.div`
  width: 55px;
  height: 55px;
  margin-left: 5px;
  margin-right: 5px;
`;

export const MediaAudioEnablingSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaAudioEnablingSwitch({}) {
  const dispatch = useDispatch();
  const {
    audioRelated: { isAudioEnablingAvaliable, isAudioEnabled },
  } = useSelector(selectMediaChat);

  const enableAudioOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(0, 150, 136)",
    switchOptionBackgroundColor: "rgb(0, 150, 136)",
    switchOptionBackgroundImageUrl: enableAudioUrl,
    switchOptionOnClick: () => {
      dispatch(toggleAudioEnabling());
    },
    switchOptionSelected: !isAudioEnabled,
  });
  const disableAudioOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(244, 67, 54)",
    switchOptionBackgroundColor: "rgb(244, 67, 54)",
    switchOptionBackgroundImageUrl: disableAudioUrl,
    switchOptionOnClick: () => {
      dispatch(toggleAudioEnabling());
    },
    switchOptionSelected: isAudioEnabled,
  });

  return (
    <MediaAudioEnablingSwitchWrapper>
      <SingleTabSwitch
        {...singleTabSwitchPropsBuilder({
          switchEnabled: isAudioEnablingAvaliable,
          switchBackgroundImageUrl: audioEnablingDisabledUrl,
          switchOneOption: enableAudioOption,
          switchAnotherOption: disableAudioOption,
        })}
      />
    </MediaAudioEnablingSwitchWrapper>
  );
}
