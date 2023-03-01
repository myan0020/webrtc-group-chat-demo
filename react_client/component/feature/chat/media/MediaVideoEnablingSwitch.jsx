import * as React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import SingleTabSwitch, {
  singleTabSwitchOptionBuilder,
  singleTabSwitchPropsBuilder,
} from "../../../generic/switch/SingleTabSwitch";
import { selectVideoRelated, toggleVideoEnabling } from "store/mediaChatSlice";
import * as enableVideoUrl from "resource/image/enable_video_3x.png";
import * as disableVideoUrl from "resource/image/disable_video_3x.png";
import * as videoEnablingDisabledUrl from "resource/image/video_enabling_disabled_3x.png";

export const MediaVideoEnablingSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaVideoEnablingSwitch({}) {
  const dispatch = useDispatch();
  const { isVideoEnablingAvaliable, isVideoEnabled } = useSelector(selectVideoRelated);

  const enableVideoOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(0, 150, 136)",
    switchOptionBackgroundColor: "rgb(0, 150, 136)",
    switchOptionBackgroundImageUrl: enableVideoUrl,
    switchOptionBackgroundImageSize: "24px auto",
    switchOptionOnClick: () => {
      dispatch(toggleVideoEnabling());
    },
    switchOptionSelected: !isVideoEnabled,
  });
  const disableVideoOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(244, 67, 54)",
    switchOptionBackgroundColor: "rgb(244, 67, 54)",
    switchOptionBackgroundImageUrl: disableVideoUrl,
    switchOptionBackgroundImageSize: "24px auto",
    switchOptionOnClick: () => {
      dispatch(toggleVideoEnabling());
    },
    switchOptionSelected: isVideoEnabled,
  });

  return (
    <Wrapper>
      <SingleTabSwitch
        {...singleTabSwitchPropsBuilder({
          switchEnabled: isVideoEnablingAvaliable,
          switchBackgroundImageUrl: videoEnablingDisabledUrl,
          switchBackgroundImageSize: "24px auto",
          switchOneOption: enableVideoOption,
          switchAnotherOption: disableVideoOption,
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