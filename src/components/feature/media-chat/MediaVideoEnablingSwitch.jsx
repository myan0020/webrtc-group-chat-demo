import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import SingleTabSwitch, {
  singleTabSwitchOptionBuilder,
  singleTabSwitchPropsBuilder,
} from "../../generic/switch/SingleTabSwitch.jsx";
import { selectMediaChat, toggleVideoEnabling } from "../../../redux/mediaChatSlice";
import enableVideoUrl from "./images/enable_video_1x.png";
import disableVideoUrl from "./images/disable_video_1x.png";
import videoEnablingDisabledUrl from "./images/video_enabling_disabled_1x.png";

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
    switchOptionOnClick: () => {
      dispatch(toggleVideoEnabling());
    },
    switchOptionSelected: !isVideoEnabled,
  });
  const disableVideoOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(244, 67, 54)",
    switchOptionBackgroundColor: "rgb(244, 67, 54)",
    switchOptionBackgroundImageUrl: disableVideoUrl,
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
          switchOneOption: enableVideoOption,
          switchAnotherOption: disableVideoOption,
        })}
      />
    </Wrapper>
  );
}
