import * as React from "react";
import styled from "styled-components";

import MultiTabSwitch, {
  multiTabSwitchTabBuilder,
  multiTabSwitchPropsBuilder,
} from "../../../generic/switch/MultiTabSwitch";
import * as presentationEnabledUrl from "resource/image/presentation_enabled_3x.png";
import * as presentationDisabledUrl from "resource/image/presentation_disabled_3x.png";
import * as equalityEnabledUrl from "resource/image/equality_enabled_3x.png";
import * as equalityDisabledUrl from "resource/image/equality_disabled_3x.png";
import { GlobalContext } from "context/global-context";
import * as mediaChatEnum from "constant/enum/media-chat";

export default function MediaRenderingStyleSwitch({}) {
  const { updateMediaAccessibilityType, mediaAccessibilityType } = React.useContext(GlobalContext);
  return (
    <MemorizedMediaRenderingStyleSwitch
      updateMediaAccessibilityType={updateMediaAccessibilityType}
      mediaAccessibilityType={mediaAccessibilityType}
    />
  );
}

const MemorizedMediaRenderingStyleSwitch = React.memo(
  MediaRenderingStyleSwitchToMemo,
  arePropsEqual
);

function MediaRenderingStyleSwitchToMemo({ updateMediaAccessibilityType, mediaAccessibilityType }) {
  const presentationStyleTab = multiTabSwitchTabBuilder({
    switchTabName: "",
    switchTabBorderRadius: 20,
    switchTabSelectedBackgroundImageUrl: presentationEnabledUrl,
    switchTabSelectedBackgroundImageSize: "30px 20px",
    switchTabUnselectedBackgroundImageUrl: presentationDisabledUrl,
    switchTabUnselectedBackgroundImageSize: "30px 20px",
    switchTabOnClick: () => {
      updateMediaAccessibilityType(
        mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
      );
    },
    switchTabSelected:
      mediaAccessibilityType ===
      mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION,
  });
  const equalityStyleTab = multiTabSwitchTabBuilder({
    switchTabName: "",
    switchTabBorderRadius: 20,
    switchTabSelectedBackgroundImageUrl: equalityEnabledUrl,
    switchTabSelectedBackgroundImageSize: "30px 20px",
    switchTabUnselectedBackgroundImageUrl: equalityDisabledUrl,
    switchTabUnselectedBackgroundImageSize: "30px 20px",
    switchTabOnClick: () => {
      updateMediaAccessibilityType(
        mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_EQUALITY
      );
    },
    switchTabSelected:
      mediaAccessibilityType ===
      mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_EQUALITY,
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
  const isUpdateMediaAccessibilityTypeEqual = Object.is(
    prevProps.updateMediaAccessibilityType,
    nextProps.updateMediaAccessibilityType
  );
  const isMediaAccessibilityTypeEqual = Object.is(
    prevProps.mediaAccessibilityType,
    nextProps.mediaAccessibilityType
  );
  return isUpdateMediaAccessibilityTypeEqual && isMediaAccessibilityTypeEqual;
};

const Wrapper = styled.div`
  width: 80px;
  height: 40px;
`;
