import React, { useContext } from "react";
import styled from "styled-components";

import MultiTabSwitch, {
  multiTabSwitchTabBuilder,
  multiTabSwitchPropsBuilder,
} from "../../../generic/switch/MultiTabSwitch";
import presentationEnabledUrl from "resource/image/presentation_enabled_3x.png";
import presentationDisabledUrl from "resource/image/presentation_disabled_3x.png";
import equalityEnabledUrl from "resource/image/equality_enabled_3x.png";
import equalityDisabledUrl from "resource/image/equality_disabled_3x.png";
import { GlobalContext } from "context/global-context";

const Wrapper = styled.div`
  width: 80px;
  height: 40px;
`;

function MediaRenderingStyleSwitchToMemo({
  mediaAccessibilityTypeEnum,
  updateMediaAccessibilityType,
  mediaAccessibilityType,
}) {
  const presentationStyleTab = multiTabSwitchTabBuilder({
    switchTabName: "",
    switchTabBorderRadius: 20,
    switchTabSelectedBackgroundImageUrl: presentationEnabledUrl,
    switchTabSelectedBackgroundImageSize: "30px 20px",
    switchTabUnselectedBackgroundImageUrl: presentationDisabledUrl,
    switchTabUnselectedBackgroundImageSize: "30px 20px",
    switchTabOnClick: () => {
      updateMediaAccessibilityType(
        mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
      );
    },
    switchTabSelected:
      mediaAccessibilityType === mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION,
  });
  const equalityStyleTab = multiTabSwitchTabBuilder({
    switchTabName: "",
    switchTabBorderRadius: 20,
    switchTabSelectedBackgroundImageUrl: equalityEnabledUrl,
    switchTabSelectedBackgroundImageSize: "30px 20px",
    switchTabUnselectedBackgroundImageUrl: equalityDisabledUrl,
    switchTabUnselectedBackgroundImageSize: "30px 20px",
    switchTabOnClick: () => {
      updateMediaAccessibilityType(mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_EQUALITY);
    },
    switchTabSelected:
      mediaAccessibilityType === mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_EQUALITY,
  });

  return (
    <Wrapper>
      <MultiTabSwitch
        {...multiTabSwitchPropsBuilder({
          switchTabs: [presentationStyleTab, equalityStyleTab],
          switchEnabled: true,
          switchBorderRadius: 20,
          switchOuterMostBorderWidth: 0,
        })}
      />
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isMediaAccessibilityTypeEnumEqual = Object.is(
    prevProps.mediaAccessibilityTypeEnum,
    nextProps.mediaAccessibilityTypeEnum
  );
  const isUpdateMediaAccessibilityTypeEqual = Object.is(
    prevProps.updateMediaAccessibilityType,
    nextProps.updateMediaAccessibilityType
  );
  const isMediaAccessibilityTypeEqual = Object.is(
    prevProps.mediaAccessibilityType,
    nextProps.mediaAccessibilityType
  );
  return (
    isMediaAccessibilityTypeEnumEqual &&
    isUpdateMediaAccessibilityTypeEqual &&
    isMediaAccessibilityTypeEqual
  );
};

const MemorizedMediaRenderingStyleSwitch = React.memo(
  MediaRenderingStyleSwitchToMemo,
  arePropsEqual
);

export default function MediaRenderingStyleSwitch({}) {
  const { mediaAccessibilityTypeEnum, updateMediaAccessibilityType, mediaAccessibilityType } =
    useContext(GlobalContext);
  return (
    <MemorizedMediaRenderingStyleSwitch
      mediaAccessibilityTypeEnum={mediaAccessibilityTypeEnum}
      updateMediaAccessibilityType={updateMediaAccessibilityType}
      mediaAccessibilityType={mediaAccessibilityType}
    />
  );
}
