import * as React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import SingleTabSwitch, {
  singleTabSwitchOptionBuilder,
  singleTabSwitchPropsBuilder,
} from "../../../generic/switch/SingleTabSwitch";
import { selectAudioRelated, toggleAudioEnabling } from "store/mediaChatSlice";
import enableAudioUrl from "resource/image/enable_audio_3x.png";
import disableAudioUrl from "resource/image/disable_audio_3x.png";
import audioEnablingDisabledUrl from "resource/image/audio_enabling_disabled_3x.png";

export const MediaAudioEnablingSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaAudioEnablingSwitch({}) {
  const dispatch = useDispatch();
  const { isAudioEnablingAvaliable, isAudioEnabled } = useSelector(selectAudioRelated);

  const enableAudioOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(0, 150, 136)",
    switchOptionBackgroundColor: "rgb(0, 150, 136)",
    switchOptionBackgroundImageUrl: enableAudioUrl,
    switchOptionBackgroundImageSize: "24px auto",
    switchOptionOnClick: () => {
      dispatch(toggleAudioEnabling());
    },
    switchOptionSelected: !isAudioEnabled,
  });
  const disableAudioOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(244, 67, 54)",
    switchOptionBackgroundColor: "rgb(244, 67, 54)",
    switchOptionBackgroundImageUrl: disableAudioUrl,
    switchOptionBackgroundImageSize: "24px auto",
    switchOptionOnClick: () => {
      dispatch(toggleAudioEnabling());
    },
    switchOptionSelected: isAudioEnabled,
  });

  return (
    <Wrapper>
      <SingleTabSwitch
        {...singleTabSwitchPropsBuilder({
          switchEnabled: isAudioEnablingAvaliable,
          switchBackgroundImageUrl: audioEnablingDisabledUrl,
          switchBackgroundImageSize: "24px auto",
          switchOneOption: enableAudioOption,
          switchAnotherOption: disableAudioOption,
        })}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 55px;
  height: 55px;
  margin-left: 5px;
  margin-right: 5px;
`;