import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import SingleTabSwitch, {
  singleTabSwitchOptionBuilder,
  singleTabSwitchPropsBuilder,
} from "../../../generic/switch/SingleTabSwitch.jsx";
import { selectMediaChat, toggleVideoEnabling } from "../../../../store/mediaChatSlice";
import enableVideoUrl from "./images/enable_video_3x.png";
import disableVideoUrl from "./images/disable_video_3x.png";
import videoEnablingDisabledUrl from "./images/video_enabling_disabled_3x.png";

const Wrapper = styled.div`
  width: 55px;
  height: 55px;
  margin-left: 5px;
  margin-right: 5px;
`;

export const MediaVideoEnablingSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaVideoEnablingSwitch({}) {
  const dispatch = useDispatch();
  const {
    videoRelated: { isVideoEnablingAvaliable, isVideoEnabled },
  } = useSelector(selectMediaChat);

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
