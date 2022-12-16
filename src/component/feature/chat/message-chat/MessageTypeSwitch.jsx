import React, { useContext, useEffect } from "react";
import styled from "styled-components";

import { messageTypeEnum, MessageContext } from "../../../../context/message-context";
import MultiTabSwitch, {
  multiTabSwitchPropsBuilder,
  multiTabSwitchTabBuilder,
} from "../../../generic/switch/MultiTabSwitch.jsx";
import badgeBackgroundImageUrl from "./images/badge_3x.png";

const sharedStyleValues = {
  switchPaddingTop: 10,
  switchPaddingBottom: 10,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const SwitchContainer = styled.div`
  width: 100%;
  height: calc(
    100% - ${sharedStyleValues.switchPaddingTop}px - ${sharedStyleValues.switchPaddingBottom}px
  );
  padding-top: ${sharedStyleValues.switchPaddingTop}px;
  padding-bottom: ${sharedStyleValues.switchPaddingBottom}px;
`;

export const MessageTypeSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MessageTypeSwitch({}) {
  const {
    visibleMessageType,
    updateVisibleMessageType,
    unreadTextMessageCount,
    unreadFileMessageCount,
  } = useContext(MessageContext);

  let textMessageTabSelected = true;
  let fileMessageTabSelected = false;
  if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_TEXT) {
    textMessageTabSelected = true;
    fileMessageTabSelected = false;
  } else if (visibleMessageType === messageTypeEnum.MESSAGE_TYPE_FILE) {
    textMessageTabSelected = false;
    fileMessageTabSelected = true;
  }

  const textMessageTabBadgeText = unreadTextMessageCount > 0 ? `${unreadTextMessageCount}` : "";
  const fileMessageTabBadgeText = unreadFileMessageCount > 0 ? `${unreadFileMessageCount}` : "";

  const textMessageTab = multiTabSwitchTabBuilder({
    switchTabName: "Text Message",
    switchTabBorderRadius: 5,
    switchTabBadgeText: textMessageTabBadgeText,
    switchTabBadgeBackgroundImageUrl: badgeBackgroundImageUrl,
    switchTabOnClick: () => {
      updateVisibleMessageType(messageTypeEnum.MESSAGE_TYPE_TEXT);
    },
    switchTabSelected: textMessageTabSelected,
  });
  const fileMessageTab = multiTabSwitchTabBuilder({
    switchTabName: "File Message",
    switchTabBorderRadius: 5,
    switchTabBadgeText: fileMessageTabBadgeText,
    switchTabBadgeBackgroundImageUrl: badgeBackgroundImageUrl,
    switchTabOnClick: () => {
      updateVisibleMessageType(messageTypeEnum.MESSAGE_TYPE_FILE);
    },
    switchTabSelected: fileMessageTabSelected,
  });

  return (
    <Wrapper>
      <SwitchContainer>
        <MultiTabSwitch
          {...multiTabSwitchPropsBuilder({
            switchTabs: [textMessageTab, fileMessageTab],
            switchEnabled: true,
            switchOuterMostBorderWidth: 5,
            switchBorderRadius: 10,
            switchEnabledBackgroundColor: "rgb(255, 255, 255)",
            switchEnabledSelectedBackgroundColor: "rgba(178, 223, 219, 0.2)",
            switchEnabledSelectedColor: "rgb(0, 150, 136)",
            switchEnabledUnselectedBackgroundColor: "rgba(178, 223, 219, 0)",
            switchEnabledUnsectedColor: "rgb(196, 196, 196)",
          })}
        />
      </SwitchContainer>
    </Wrapper>
  );
}
