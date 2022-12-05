import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import MultiTabSwitch, {
  multiTabSwitchTabBuilder,
  multiTabSwitchPropsBuilder,
} from "../../generic/switch/MultiTabSwitch.jsx";
import {
  selectMediaChat,
  updateVideoCallingInputType,
  videoCallingInputTypeEnum,
} from "../mediaChatSlice.js";

const MediaRenderingStyleSwitchWrapper = styled.div`
  width: 146px;
  height: 40px;
`;

export default function MediaRenderingStyleSwitch({}) {
  const dispatch = useDispatch();
  const { enableVideoCallingInput, videoCallingInputType, isCalling } =
    useSelector(selectMediaChat);

  const switchEnabled = !isCalling && enableVideoCallingInput;
  const cameraTab = multiTabSwitchTabBuilder(
    "Camera",
    () => {
      dispatch(
        updateVideoCallingInputType(videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_CAMERA)
      );
    },
    videoCallingInputType === videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_CAMERA
  );
  const sceenTab = multiTabSwitchTabBuilder(
    "Screen",
    () => {
      dispatch(
        updateVideoCallingInputType(videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_SCREEN)
      );
    },
    videoCallingInputType === videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_SCREEN
  );

  return (
    <MediaRenderingStyleSwitchWrapper>
      <MultiTabSwitch
        {...multiTabSwitchPropsBuilder({
          switchTabs: [cameraTab, sceenTab],
          switchEnabled: switchEnabled,
        })}
      />
    </MediaRenderingStyleSwitchWrapper>
  );
}
