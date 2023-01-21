import React, { useContext } from "react";
import styled from "styled-components";

import { timeSince } from "util/time-since";

export const textMessagePropsBuilder = (isParentVisible, messageItem, localizedStrings) => {
  const defaultMessage = {
    id: "unknown id",
    userId: "unknown user id",
    userName: "unknown user name",
    time: "Mar 18th, 1993",
    isLocalSender: false,
    content: "unknown content",

    titleFlexJustifyContent: "start",
    userNameVisibility: isParentVisible ? "visible" : "hidden",
    contentTopLeftBorderRadius: 10,
    contentTopRightBorderRadius: 10,
    alignTextToRight: true,
  };
  if (!messageItem) {
    return defaultMessage;
  }
  if (typeof messageItem.id === "string" && messageItem.id.length > 0) {
    defaultMessage.id = messageItem.id;
  }
  if (typeof messageItem.userId === "string" && messageItem.userId.length > 0) {
    defaultMessage.userId = messageItem.userId;
  }
  if (typeof messageItem.userName === "string" && messageItem.userName.length > 0) {
    defaultMessage.userName = messageItem.userName;
  }
  if (typeof messageItem.timestamp === "number") {
    defaultMessage.time = timeSince(messageItem.timestamp, localizedStrings);
  }
  if (typeof messageItem.isLocalSender === "boolean") {
    defaultMessage.userNameVisibility = messageItem.isLocalSender
      ? "hidden"
      : isParentVisible
      ? "visible"
      : "hidden";
    defaultMessage.contentTopLeftBorderRadius = messageItem.isLocalSender
      ? sharedStyleValues.noneSenderSideContentBorderRadius
      : sharedStyleValues.senderSideContentBorderRadius;
    defaultMessage.contentTopRightBorderRadius = messageItem.isLocalSender
      ? sharedStyleValues.senderSideContentBorderRadius
      : sharedStyleValues.noneSenderSideContentBorderRadius;
    defaultMessage.alignTextToRight = messageItem.isLocalSender;
  }
  if (typeof messageItem.text === "string") {
    defaultMessage.content = messageItem.text;
  }
  return defaultMessage;
};

function TextMessage({
  id,
  userId,
  userName,
  time,
  userNameVisibility,
  contentTopLeftBorderRadius,
  contentTopRightBorderRadius,
  alignTextToRight,
  content,
}, ref) {
  return (
    <Wrapper ref={ref}>
      <TitleWrapper>
        <UserNameWrapper visibility={userNameVisibility}>{userName}</UserNameWrapper>
        <TimestampWrapper>{time}</TimestampWrapper>
      </TitleWrapper>
      <ContentWrapper>
        <TextContentWrapper
          alignTextToRight={alignTextToRight}
          topLeftBorderRadius={contentTopLeftBorderRadius}
          topRightBorderRadius={contentTopRightBorderRadius}
        >
          {content}
        </TextContentWrapper>
      </ContentWrapper>
    </Wrapper>
  );
}

const sharedStyleValues = {
  contentHorizontalMargin: 10,
  senderSideContentBorderRadius: 0,
  noneSenderSideContentBorderRadius: 10,
};

const Wrapper = styled.div`
  box-sizing: border-box;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const TitleWrapper = styled.div`
  height: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
`;

const UserNameWrapper = styled.div`
  visibility: ${(props) => props.visibility};
  font-size: 14px;
  color: rgb(0, 150, 136);
  margin-left: 5px;
  margin-right: 15px;
  line-height: 1;
`;

const TimestampWrapper = styled.div`
  font-size: 12px;
  color: rgba(128, 128, 128, 0.5);
  line-height: 1;
  margin-right: 15px;
`;

const ContentWrapper = styled.div`
  box-sizing: border-box;
  max-width: calc(100% - ${2 * sharedStyleValues.contentHorizontalMargin}px);
  margin-top: 10px;
  margin-left: ${sharedStyleValues.contentHorizontalMargin}px;
  margin-right: ${sharedStyleValues.contentHorizontalMargin}px;
  word-break: break-word;
`;

const TextContentWrapper = styled.div`
  display: inline-block;
  ${(props) =>
    props.alignTextToRight && "position: relative; left: 100%; transform: translateX(-100%);"}
  padding: 8px;
  border-color: transparent;
  background-color: rgb(255, 255, 255);
  color: rgb(128, 128, 128);
  border-radius: ${(props) => props.topLeftBorderRadius}px
    ${(props) => props.topRightBorderRadius}px
    ${sharedStyleValues.noneSenderSideContentBorderRadius}px
    ${sharedStyleValues.noneSenderSideContentBorderRadius}px;
  font-size: 10px;
  line-height: 1.5;
  box-sizing: border-box;
`;

export default React.forwardRef(TextMessage);
