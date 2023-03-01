import * as React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import TextMessage, { textMessagePropsBuilder } from "./TextMessage";
import FileMessage, { fileMessagePropsBuilder } from "./FileMessage";
import * as messageChatEnum from "constant/enum/message-chat";
import { GlobalContext } from "context/global-context";
import { readAllTextMessages, selectUnreadTextMessageCount } from "store/textChatSlice";

const autoScrollingThredhold = 400;
const autoScrollToBottomIfNecessary = (scrollableContainer, autoScrollingThreshold) => {
  if (
    !(scrollableContainer instanceof HTMLElement) ||
    typeof autoScrollingThreshold !== "number" ||
    autoScrollingThreshold < 0
  ) {
    return;
  }
  const scrollDiff =
    scrollableContainer.scrollHeight -
    scrollableContainer.scrollTop -
    scrollableContainer.clientHeight;
  const isNecessary = scrollDiff < autoScrollingThreshold;
  if (isNecessary) {
    scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
  }
};

export default function MessageBox({}) {
  const {
    localizedStrings,
    visibleMessageType,
    orderedTextMessageList,
    orderedFileMessageList,
    readAllFileMessage,
  } = React.useContext(GlobalContext);
  return (
    <MemorizedMessageBox
      localizedStrings={localizedStrings}
      visibleMessageType={visibleMessageType}
      orderedTextMessageList={orderedTextMessageList}
      orderedFileMessageList={orderedFileMessageList}
      readAllFileMessage={readAllFileMessage}
    />
  );
}

const MemorizedMessageBox = React.memo(MessageBoxToMemo, arePropsEqual);

function MessageBoxToMemo({
  localizedStrings,
  visibleMessageType,
  orderedTextMessageList,
  orderedFileMessageList,
  readAllFileMessage,
}) {
  const dispatch = useDispatch();
  const unreadTextMessageCount = useSelector(selectUnreadTextMessageCount);
  const textBoxWrapperRef = React.useRef(null);
  const fileBoxWrapperRef = React.useRef(null);

  React.useEffect(() => {
    if (visibleMessageType === messageChatEnum.type.MESSAGE_TYPE_TEXT) {
      if (unreadTextMessageCount === 0) {
        return;
      }
      dispatch(readAllTextMessages());
    } else if (visibleMessageType === messageChatEnum.type.MESSAGE_TYPE_FILE) {
      readAllFileMessage();
    }
  });

  React.useEffect(() => {
    if (textBoxWrapperRef.current) {
      autoScrollToBottomIfNecessary(textBoxWrapperRef.current, autoScrollingThredhold);
    }
    if (fileBoxWrapperRef.current) {
      autoScrollToBottomIfNecessary(fileBoxWrapperRef.current, autoScrollingThredhold);
    }
  });

  let isTextMessageVisible = true;
  let isFileMessageVisible = false;
  let textMessageVisibility = "visible";
  let fileMessageVisibility = "hidden";
  if (visibleMessageType === messageChatEnum.type.MESSAGE_TYPE_TEXT) {
    isTextMessageVisible = true;
    isFileMessageVisible = false;
    textMessageVisibility = "visible";
    fileMessageVisibility = "hidden";
  } else if (visibleMessageType === messageChatEnum.type.MESSAGE_TYPE_FILE) {
    isTextMessageVisible = false;
    isFileMessageVisible = true;
    textMessageVisibility = "hidden";
    fileMessageVisibility = "visible";
  }

  return (
    <Wrapper>
      <TextMessageWrapper
        visibility={textMessageVisibility}
        ref={textBoxWrapperRef}
      >
        {orderedTextMessageList.map((messageItem, index) => {
          if (messageItem.type === messageChatEnum.type.MESSAGE_TYPE_TEXT) {
            return (
              <TextMessage
                key={index}
                {...textMessagePropsBuilder(isTextMessageVisible, messageItem, localizedStrings)}
              />
            );
          }

          return `Unexpected component to render: ${messageItem.id}`;
        })}
      </TextMessageWrapper>
      <FileMessageWrapper
        visibility={fileMessageVisibility}
        ref={fileBoxWrapperRef}
      >
        {orderedFileMessageList.map((messageItem, index) => {
          if (messageItem.type === messageChatEnum.type.MESSAGE_TYPE_FILE) {
            return (
              <FileMessage
                key={index}
                {...fileMessagePropsBuilder(isFileMessageVisible, messageItem, localizedStrings)}
              />
            );
          }

          return `Unexpected component to render: ${messageItem.id}`;
        })}
      </FileMessageWrapper>
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isVisibleMessageTypeEqual = Object.is(
    prevProps.visibleMessageType,
    nextProps.visibleMessageType
  );
  const isOrderedTextMessageListEqual = Object.is(
    prevProps.orderedTextMessageList,
    nextProps.orderedTextMessageList
  );
  const isOrderedFileMessageListEqual = Object.is(
    prevProps.orderedFileMessageList,
    nextProps.orderedFileMessageList
  );
  const isReadAllFileMessageEqual = Object.is(
    prevProps.readAllFileMessage,
    nextProps.readAllFileMessage
  );
  return (
    isLocalizedStringEqual &&
    isVisibleMessageTypeEqual &&
    isOrderedTextMessageListEqual &&
    isOrderedFileMessageListEqual &&
    isReadAllFileMessageEqual
  );
};

const sharedStyleValues = {
  // autoScrollingThredhold: 300,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
`;

const TextMessageWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  visibility: ${(props) => props.visibility};
  position: absolute;
`;

const FileMessageWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  visibility: ${(props) => props.visibility};
  position: absolute;
`;