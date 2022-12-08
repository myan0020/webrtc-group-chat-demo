import React, { useContext } from "react";
import styled from "styled-components";

import MultiTabSwitch, {
  multiTabSwitchTabBuilder,
  multiTabSwitchPropsBuilder,
} from "../../generic/switch/MultiTabSwitch.jsx";
import presentationEnabledUrl from "./images/presentation_enabled_1x.png";
import presentationDisabledUrl from "./images/presentation_disabled_1x.png";
import equalityEnabledUrl from "./images/equality_enabled_1x.png";
import equalityDisabledUrl from "./images/equality_disabled_1x.png";
import { MediaRenderingContext } from "../../context/media-rendering-context.js";

const Wrapper = styled.div`
  width: 80px;
  height: 40px;
`;

export default function MediaRenderingStyleSwitch({}) {
  const { mediaAccessibilityTypeEnum, updateMediaAccessibilityType } =
    useContext(MediaRenderingContext);

  const presentationStyleTab = multiTabSwitchTabBuilder({
    switchTabName: "",
    switchTabSelectedBackgroundImageUrl: presentationEnabledUrl,
    switchTabUnselectedBackgroundImageUrl: presentationDisabledUrl,
    switchTabOnClick: () => {
      updateMediaAccessibilityType(
        mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
      );
    },
    switchTabSelected: true,
  });
  const equalityStyleTab = multiTabSwitchTabBuilder({
    switchTabName: "",
    switchTabSelectedBackgroundImageUrl: equalityEnabledUrl,
    switchTabUnselectedBackgroundImageUrl: equalityDisabledUrl,
    switchTabOnClick: () => {
      updateMediaAccessibilityType(mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_EQUALITY);
    },
    switchTabSelected: false,
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
