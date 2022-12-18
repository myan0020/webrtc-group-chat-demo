import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import MultiTabSwitch, {
  multiTabSwitchTabBuilder,
  multiTabSwitchPropsBuilder,
} from "component/generic/switch/MultiTabSwitch";
import {
  selectMediaChat,
  updateVideoCallingInputType,
  videoCallingInputTypeEnum,
} from "store/mediaChatSlice";
import { LocalizationContext } from "context/localization-context";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";

const Wrapper = styled.div`
  width: 146px;
  height: 40px;
`;

export const MediaConstraintSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaConstraintSwitch({}) {
  const dispatch = useDispatch();
  const { localizedStrings } = useContext(LocalizationContext);
  const { enableVideoCallingInput, videoCallingInputType, isCalling } =
    useSelector(selectMediaChat);

  const switchEnabled = !isCalling && enableVideoCallingInput;
  const cameraTab = multiTabSwitchTabBuilder({
    switchTabName: localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MEDIA_CONSTRAINT_CAMERA],
    switchTabOnClick: () => {
      dispatch(
        updateVideoCallingInputType(videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_CAMERA)
      );
    },
    switchTabSelected:
      videoCallingInputType === videoCallingInputTypeEnum.VIDEO_CALLING_INPUT_TYPE_CAMERA,
  });
  const screenTab = multiTabSwitchTabBuilder({
    switchTabName: localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MEDIA_CONSTRAINT_SCREEN],
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
