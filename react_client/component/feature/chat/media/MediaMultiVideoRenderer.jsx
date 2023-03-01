import * as React from "react";
import styled from "styled-components";

import MediaVideo from "./MediaVideo";
import { GlobalContext } from "context/global-context";
import * as mediaChatEnum from "constant/enum/media-chat";

export default function MediaMultiVideoRenderer({}) {
  const {
    numberOfInitialVisibleMediaMembers,
    mediaRenderingDataSourceList,
    mediaRenderingDataSourceForPresenter,
    mediaAccessibilityType,
  } = React.useContext(GlobalContext);

  return (
    <MemorizedMediaMultiVideoRenderer
      numberOfInitialVisibleMediaMembers={numberOfInitialVisibleMediaMembers}
      mediaRenderingDataSourceList={mediaRenderingDataSourceList}
      mediaRenderingDataSourceForPresenter={mediaRenderingDataSourceForPresenter}
      mediaAccessibilityType={mediaAccessibilityType}
    />
  );
}

const MemorizedMediaMultiVideoRenderer = React.memo(MediaMultiVideoRendererToMemo, arePropsEqual);

function MediaMultiVideoRendererToMemo({
  numberOfInitialVisibleMediaMembers,
  mediaRenderingDataSourceList,
  mediaRenderingDataSourceForPresenter,
  mediaAccessibilityType,
}) {
  let shouldDisplayForEquality;
  let shouldDisplayForPresentation;

  if (
    mediaAccessibilityType ===
    mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_EQUALITY
  ) {
    shouldDisplayForEquality = true;
    shouldDisplayForPresentation = false;
  } else if (
    mediaAccessibilityType ===
    mediaChatEnum.mediaAccessibilityType.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
  ) {
    shouldDisplayForEquality = false;
    shouldDisplayForPresentation = true;
  }

  return (
    <Wrapper>
      {shouldDisplayForPresentation && (
        <PresenterVideoContainer>
          <MediaVideo
            userId={mediaRenderingDataSourceForPresenter.userId}
            userName={mediaRenderingDataSourceForPresenter.userName}
            forceAudioOutputUnavaliable={true}
            forceVideoUnpresentable={true}
            isAudioSourceAvaliable={mediaRenderingDataSourceForPresenter.isAudioSourceAvaliable}
            audioProcessor={mediaRenderingDataSourceForPresenter.audioProcessor}
            videoStream={mediaRenderingDataSourceForPresenter.videoStream}
            isVideoCancellable={mediaRenderingDataSourceForPresenter.videoStream !== undefined}
          />
        </PresenterVideoContainer>
      )}

      {shouldDisplayForEquality && (
        <EqualityTypeMembersContainer>
          {mediaRenderingDataSourceList.map((mediaRenderingDataSource, index) => {
            const forceAudioOutputUnavaliable = index === 0;

            return (
              <EqualityTypeMemberContainer
                key={index}
                numberOfInitialVisibleMembers={numberOfInitialVisibleMediaMembers}
              >
                <MediaVideo
                  key={index}
                  userId={mediaRenderingDataSource.userId}
                  userName={mediaRenderingDataSource.userName}
                  forceAudioOutputUnavaliable={forceAudioOutputUnavaliable}
                  audioProcessor={mediaRenderingDataSource.audioProcessor}
                  forceVideoUnpresentable={true}
                  isAudioSourceAvaliable={mediaRenderingDataSource.isAudioSourceAvaliable}
                  videoStream={mediaRenderingDataSource.videoStream}
                  isVideoCancellable={false}
                />
              </EqualityTypeMemberContainer>
            );
          })}
        </EqualityTypeMembersContainer>
      )}
      {shouldDisplayForPresentation && (
        <PresentationTypeMembersContainer
          numberOfInitialVisibleMembers={numberOfInitialVisibleMediaMembers}
        >
          {mediaRenderingDataSourceList.map((mediaRenderingDataSource, index) => {
            const forceAudioOutputUnavaliable = index === 0;

            return (
              <PresentationTypeMemberContainer
                key={index}
                numberOfInitialVisibleMembers={numberOfInitialVisibleMediaMembers}
              >
                <MediaVideo
                  key={index}
                  userId={mediaRenderingDataSource.userId}
                  userName={mediaRenderingDataSource.userName}
                  forceAudioOutputUnavaliable={forceAudioOutputUnavaliable}
                  audioProcessor={mediaRenderingDataSource.audioProcessor}
                  forceVideoUnpresentable={false}
                  videoStream={mediaRenderingDataSource.videoStream}
                  isVideoCancellable={false}
                  isAudioSourceAvaliable={mediaRenderingDataSource.isAudioSourceAvaliable}
                />
              </PresentationTypeMemberContainer>
            );
          })}
        </PresentationTypeMembersContainer>
      )}
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isNumberOfInitialVisibleMediaMembersEqual = Object.is(
    prevProps.numberOfInitialVisibleMediaMembers,
    nextProps.numberOfInitialVisibleMediaMembers
  );
  const isMediaRenderingDataSourceListEqual = Object.is(
    prevProps.mediaRenderingDataSourceList,
    nextProps.mediaRenderingDataSourceList
  );
  const isMediaRenderingDataSourceForPresenterEqual = Object.is(
    prevProps.mediaRenderingDataSourceForPresenter,
    nextProps.mediaRenderingDataSourceForPresenter
  );
  const isMediaAccessibilityTypeEqual = Object.is(
    prevProps.mediaAccessibilityType,
    nextProps.mediaAccessibilityType
  );
  return (
    isNumberOfInitialVisibleMediaMembersEqual &&
    isMediaRenderingDataSourceListEqual &&
    isMediaRenderingDataSourceForPresenterEqual &&
    isMediaAccessibilityTypeEqual
  );
};

const sharedStyleValues = {
  bottomSpaceHeight: 14,
  numberOfRowsForEqualityType: 2,
};

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - ${sharedStyleValues.bottomSpaceHeight}px);
  display: flex;
  flex-direction: row;
`;

const PresenterVideoContainer = styled.div`
  display: block;
  flex: 1 0 0%;
  height: 100%;
`;

const PresentationTypeMembersContainer = styled.div`
  display: block;
  flex: 0 0 content;
  aspect-ratio: 1 / ${(props) => props.numberOfInitialVisibleMembers};
  height: 100%;
  overflow-y: auto;
`;

const PresentationTypeMemberContainer = styled.div`
  width: 100%;
  height: calc(100% / ${(props) => props.numberOfInitialVisibleMembers});
`;

const EqualityTypeMembersContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex: 0 0 100%;
  height: 100%;
  overflow-y: auto;
`;

const EqualityTypeMemberContainer = styled.div`
  height: calc(100% / ${sharedStyleValues.numberOfRowsForEqualityType});
  flex: 0 0
    calc(
      100% /
        ${(props) =>
          Math.floor(
            props.numberOfInitialVisibleMembers / sharedStyleValues.numberOfRowsForEqualityType
          )}
    );
`;
