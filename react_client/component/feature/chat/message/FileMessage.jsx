import * as React from "react";
import styled from "styled-components";

import { formatBytes } from "util/format-bytes";
import { timeSince } from "util/time-since";
import * as fileIconUrl from "resource/image/dowload_new_file_3x.png";
import * as cancellingAvaliableImageUrl from "resource/image/cancel_single_download_3x.png";
import * as exportingAvaliableImageUrl from "resource/image/download_completed_3x.png";

export const fileMessagePropsBuilder = (isParentVisible, messageItem, localizedStrings) => {
  const defaultMessage = {
    id: "unknown id",
    userId: "unknown user id",
    userName: "unknown user name",
    userNameVisibility: isParentVisible ? "visible" : "hidden",
    time: "unknown time",

    fileName: "unknown file name",

    fileProgress: 0,
    fileSize: 1,
    transceivingProgressText: "0/0",

    contentTopLeftBorderRadius: 10,
    contentTopRightBorderRadius: 10,
    isContentClickable: false,
    handleContentClick: () => {},

    avaliableOperationVisibility: "hidden",
    isAvaliableOperationClickable: false,
    avaliableOperationImageUrl: "",
    handleAvaliableOperationClick: () => {},
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

  if (typeof messageItem.fileName === "string" && messageItem.fileName.length > 0) {
    defaultMessage.fileName = messageItem.fileName;
  }

  const isFileProgressValid =
    typeof messageItem.fileProgress === "number" &&
    messageItem.fileProgress >= 0 &&
    typeof messageItem.fileSize === "number" &&
    messageItem.fileSize >= 0;
  const isFileProgressCompleted =
    isFileProgressValid && messageItem.fileProgress >= messageItem.fileSize;
  const isFileExporterCallable =
    isFileProgressCompleted && typeof messageItem.fileExporter === "function";

  if (isFileProgressValid) {
    defaultMessage.fileProgress = messageItem.fileProgress;
    defaultMessage.fileSize = messageItem.fileSize;
    defaultMessage.transceivingProgressText = `${formatBytes(
      messageItem.fileProgress
    )}/${formatBytes(messageItem.fileSize)}`;
  }

  defaultMessage.isContentClickable = isFileExporterCallable;
  if (defaultMessage.isContentClickable) {
    defaultMessage.handleContentClick = () => {
      const handleFileExportSuccess = (file) => {
        if (file === undefined) {
          alert("This cached file has been deleted, please let your peer send it again");
          return;
        }
        if (file instanceof File === false) {
          console.debug(
            `FileTransceiver: unexpected type of params received from file Export handler`,
            file
          );
          return;
        }
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        a.remove();
      };
      messageItem.fileExporter().then(handleFileExportSuccess).catch(console.error);
    };
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

    const isFileSendingSideCancellable =
      messageItem.isLocalSender && isFileProgressValid && !isFileProgressCompleted;
    const isFileReceivingSideDownloadable =
      !messageItem.isLocalSender && isFileProgressValid && isFileProgressCompleted;

    if (isFileSendingSideCancellable) {
      defaultMessage.avaliableOperationVisibility = isParentVisible ? "visible" : "hidden";
      defaultMessage.avaliableOperationImageUrl = cancellingAvaliableImageUrl;
      defaultMessage.isAvaliableOperationClickable = true;
    }
    if (isFileReceivingSideDownloadable) {
      defaultMessage.avaliableOperationVisibility = isParentVisible ? "visible" : "hidden";
      defaultMessage.avaliableOperationImageUrl = exportingAvaliableImageUrl;
    }
  }

  if (defaultMessage.isAvaliableOperationClickable) {
    defaultMessage.handleAvaliableOperationClick = messageItem.fileSendingCanceller;
  }

  return {
    ...defaultMessage,
  };
};

function FileMessage(
  {
    id,
    userId,
    userName,
    userNameVisibility,
    time,
    fileName,

    fileProgress,
    fileSize,
    transceivingProgressText,

    contentTopLeftBorderRadius,
    contentTopRightBorderRadius,
    isContentClickable,
    handleContentClick,

    avaliableOperationVisibility,
    isAvaliableOperationClickable,
    avaliableOperationImageUrl,
    handleAvaliableOperationClick,
  },
  ref
) {
  return (
    <Wrapper>
      <TitleWrapper>
        <UserNameWrapper visibility={userNameVisibility}>{userName}</UserNameWrapper>
        <TimestampWrapper>{time}</TimestampWrapper>
      </TitleWrapper>
      <ContentWrapper
        topLeftBorderRadius={contentTopLeftBorderRadius}
        topRightBorderRadius={contentTopRightBorderRadius}
        clickable={isContentClickable}
        onClick={handleContentClick}
      >
        <FileIcon />
        <TransceivingInfoWrapper>
          <TransceivingTextInfoWrapper>
            <TransceivingFileName>{fileName}</TransceivingFileName>
            <TransceivingProgressText>{transceivingProgressText}</TransceivingProgressText>
          </TransceivingTextInfoWrapper>
          <TransceivingProgressBar
            value={fileProgress}
            max={fileSize}
          />
        </TransceivingInfoWrapper>
        <FileAvaliableOperation
          visibility={avaliableOperationVisibility}
          avaliableOperationImageUrl={avaliableOperationImageUrl}
          clickable={isAvaliableOperationClickable}
          onClick={handleAvaliableOperationClick}
        />
      </ContentWrapper>
    </Wrapper>
  );
}

const sharedStyleValues = {
  contentHorizontalMargin: 10,
  senderSideContentBorderRadius: 0,
  noneSenderSideContentBorderRadius: 10,

  fileIconWidth: 30,

  transceivingInfoHorizontalMargin: 5,

  fileAvaliableOperationWidth: 20,
  fileAvaliableOperationHeight: 20,
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
  width: calc(100% - ${2 * sharedStyleValues.contentHorizontalMargin}px);
  height: 50px;
  margin-top: 10px;

  margin-left: ${sharedStyleValues.contentHorizontalMargin}px;
  margin-right: ${sharedStyleValues.contentHorizontalMargin}px;

  padding: 5px;
  border-radius: ${(props) => props.topLeftBorderRadius}px
    ${(props) => props.topRightBorderRadius}px
    ${sharedStyleValues.noneSenderSideContentBorderRadius}px
    ${sharedStyleValues.noneSenderSideContentBorderRadius}px;
  border: 0.5px solid #c4c4c4;
  background-color: rgb(255, 255, 255);
  color: rgb(128, 128, 128);

  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;

  &:hover,
  &:active {
    opacity: ${(props) => (props.clickable ? 0.6 : 1)};
  }
`;

const FileIcon = styled.div`
  flex: 0 0 ${sharedStyleValues.fileIconWidth}px;
  width: ${sharedStyleValues.fileIconWidth}px;
  height: 30px;
  box-sizing: border-box;
  background-image: url(${fileIconUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

const TransceivingInfoWrapper = styled.div`
  flex: 0 0
    calc(
      100% -
        ${sharedStyleValues.fileIconWidth +
        sharedStyleValues.transceivingInfoHorizontalMargin * 2 +
        sharedStyleValues.fileAvaliableOperationWidth}px
    );
  width: calc(
    100% -
      ${sharedStyleValues.fileIconWidth +
      sharedStyleValues.transceivingInfoHorizontalMargin * 2 +
      sharedStyleValues.fileAvaliableOperationWidth}px
  );
  height: 100%;
  margin-left: ${sharedStyleValues.transceivingInfoHorizontalMargin}px;
  margin-right: ${sharedStyleValues.transceivingInfoHorizontalMargin}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const TransceivingTextInfoWrapper = styled.div`
  height: 15px;
  display: flex;
  flex-direction: row;
  align-items: end;
  margin-left: 3px;
`;

const TransceivingFileName = styled.div`
  flex: 1;
  height: 15px;
  font-size: 12px;
  line-height: 1;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TransceivingProgressText = styled.div`
  flex: 0 0 content;
  height: 15px;
  margin-left: 3px;
  font-size: 12px;
  font-weight: 300;
  text-align: right;
  line-height: 1;
`;

const TransceivingProgressBar = styled.progress`
  display: block;
  width: 100%;
  height: 15px;
  margin-top: 2px;
`;

const FileAvaliableOperation = styled.div`
  visibility: ${(props) => props.visibility};
  flex: 0 0 ${sharedStyleValues.fileAvaliableOperationWidth}px;
  width: ${sharedStyleValues.fileAvaliableOperationWidth}px;
  height: 20px;
  background-image: url(${(props) => props.avaliableOperationImageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  &:hover,
  &:active {
    opacity: ${(props) => (props.clickable ? 0.6 : 1)};
  }
`;

export default React.forwardRef(FileMessage);
