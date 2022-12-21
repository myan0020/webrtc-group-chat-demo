import React, { useContext } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { messageTypeEnum } from "context/message-context";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import MultiTabSwitch, {
  multiTabSwitchPropsBuilder,
  multiTabSwitchTabBuilder,
} from "../../../generic/switch/MultiTabSwitch";
import badgeBackgroundImageUrl from "resource/image/badge_3x.png";
import { GlobalContext } from "context/global-context";
import { selectUnreadTextMessageCount } from "store/textChatSlice";

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

function MessageTypeSwitchToMemo({
  localizedStrings,
  updateVisibleMessageType,
  textMessageTabSelected,
  textMessageTabBadgeText,
  fileMessageTabSelected,
  fileMessageTabBadgeText,
}) {
  const textMessageTab = multiTabSwitchTabBuilder({
    switchTabName: localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TYPE_TEXT],
    switchTabBorderRadius: 5,
    switchTabBadgeText: textMessageTabBadgeText,
    switchTabBadgeBackgroundImageUrl: badgeBackgroundImageUrl,
    switchTabOnClick: () => {
      updateVisibleMessageType(messageTypeEnum.MESSAGE_TYPE_TEXT);
    },
    switchTabSelected: textMessageTabSelected,
  });
  const fileMessageTab = multiTabSwitchTabBuilder({
    switchTabName: localizedStrings[localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TYPE_FILE],
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

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isUpdateVisibleMessageTypeEqual = Object.is(
    prevProps.updateVisibleMessageType,
    nextProps.updateVisibleMessageType
  );
  const isTextMessageTabSelectedEqual = Object.is(
    prevProps.textMessageTabSelected,
    nextProps.textMessageTabSelected
  );
  const isTextMessageTabBadgeTextEqual = Object.is(
    prevProps.textMessageTabBadgeText,
    nextProps.textMessageTabBadgeText
  );
  const isFileMessageTabSelectedEqual = Object.is(
    prevProps.fileMessageTabSelected,
    nextProps.fileMessageTabSelected
  );
  const isFileMessageTabBadgeTextEqual = Object.is(
    prevProps.fileMessageTabBadgeText,
    nextProps.fileMessageTabBadgeText
  );
  return (
    isLocalizedStringEqual &&
    isUpdateVisibleMessageTypeEqual &&
    isTextMessageTabSelectedEqual &&
    isTextMessageTabBadgeTextEqual &&
    isFileMessageTabSelectedEqual &&
    isFileMessageTabBadgeTextEqual
  );
};

const MemorizedMessageTypeSwitch = React.memo(MessageTypeSwitchToMemo, arePropsEqual);

export const MessageTypeSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MessageTypeSwitch({}) {
  const {
    localizedStrings,
    visibleMessageType,
    updateVisibleMessageType,
    unreadFileMessageCount,
  } = useContext(GlobalContext);
  const unreadTextMessageCount = useSelector(selectUnreadTextMessageCount);

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

  return (
    <MemorizedMessageTypeSwitch
      localizedStrings={localizedStrings}
      updateVisibleMessageType={updateVisibleMessageType}
      textMessageTabSelected={textMessageTabSelected}
      textMessageTabBadgeText={textMessageTabBadgeText}
      fileMessageTabSelected={fileMessageTabSelected}
      fileMessageTabBadgeText={fileMessageTabBadgeText}
    />
  );
}
