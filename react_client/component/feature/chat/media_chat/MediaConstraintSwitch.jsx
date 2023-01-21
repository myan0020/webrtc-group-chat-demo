import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import MultiTabSwitch, {
  multiTabSwitchTabBuilder,
  multiTabSwitchPropsBuilder,
} from "../../../generic/switch/MultiTabSwitch";
import {
  selectEnableVideoCallingInput,
  selectIsCalling,
  selectVideoCallingInputType,
  updateVideoCallingInputType,
  videoCallingInputTypeEnum,
} from "store/mediaChatSlice";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import { GlobalContext } from "context/global-context";

export const MediaConstraintSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaConstraintSwitch({}) {
  const { localizedStrings } = useContext(GlobalContext);
  return <MemorizedMediaConstraintSwitch localizedStrings={localizedStrings} />;
}

const MemorizedMediaConstraintSwitch = React.memo(MediaConstraintSwitchToMemo, arePropsEqual);

function MediaConstraintSwitchToMemo({ localizedStrings }) {
  const dispatch = useDispatch();
  const isCalling = useSelector(selectIsCalling);
  const enableVideoCallingInput = useSelector(selectEnableVideoCallingInput);
  const videoCallingInputType = useSelector(selectVideoCallingInputType);

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

const arePropsEqual = (prevProps, nextProps) => {
  return Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
};

const Wrapper = styled.div`
  width: 146px;
  height: 40px;
`;