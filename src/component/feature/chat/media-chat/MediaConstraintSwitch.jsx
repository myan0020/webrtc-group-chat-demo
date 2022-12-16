import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import MultiTabSwitch, {
  multiTabSwitchTabBuilder,
  multiTabSwitchPropsBuilder,
} from "../../../generic/switch/MultiTabSwitch.jsx";
import {
  selectMediaChat,
  updateVideoCallingInputType,
  videoCallingInputTypeEnum,
} from "../../../../store/mediaChatSlice.js";

const Wrapper = styled.div`
  width: 146px;
  height: 40px;
`;

export const MediaConstraintSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaConstraintSwitch({}) {
  const dispatch = useDispatch();
  const { enableVideoCallingInput, videoCallingInputType, isCalling } =
    useSelector(selectMediaChat);

  const switchEnabled = !isCalling && enableVideoCallingInput;
  const cameraTab = multiTabSwitchTabBuilder({
    switchTabName: "Camera",
    switchTabOnClick: () => {
      dispatch(
        updateVideoCallingInputType(videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_CAMERA)
      );
    },
    switchTabSelected:
      videoCallingInputType === videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_CAMERA,
  });
  const screenTab = multiTabSwitchTabBuilder({
    switchTabName: "Screen",
    switchTabOnClick: () => {
      dispatch(
        updateVideoCallingInputType(videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_SCREEN)
      );
    },
    switchTabSelected:
      videoCallingInputType === videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_SCREEN,
  });

  return (
    <Wrapper>
      <MultiTabSwitch
        {...multiTabSwitchPropsBuilder({
          switchTabs: [cameraTab, screenTab],
          switchEnabled: switchEnabled,
        })}
      />
    </Wrapper>
  );
}
