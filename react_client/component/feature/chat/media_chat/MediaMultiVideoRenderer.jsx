import React, { useContext } from "react";
import styled from "styled-components";

import MediaVideoRenderer from "./MediaVideoRenderer";
import { GlobalContext } from "context/global-context";

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

const PresenterRendererContainer = styled.div`
  display: ${(props) => (props.shouldDisplay ? "block" : "none")};
  flex: 1 0 0%;
  height: 100%;
`;

const PresentationTypeMembersRendererContainer = styled.div`
  display: ${(props) => (props.shouldDisplay ? "block" : "none")};
  flex: 0 0 content;
  aspect-ratio: 1 / ${(props) => props.numberOfInitialVisibleMembers};
  height: 100%;
  overflow-y: scroll;
`;

const PresentationTypeMemberRendererContainer = styled.div`
  width: 100%;
  height: calc(100% / ${(props) => props.numberOfInitialVisibleMembers});
`;

const EqualityTypeMembersRendererContainer = styled.div`
  display: ${(props) => (props.shouldDisplay ? "flex" : "none")};
  flex-direction: row;
  flex-wrap: wrap;
  flex: 0 0 100%;
  height: 100%;
  overflow-y: scroll;
`;

const EqualityTypeMemberRendererContainer = styled.div`
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

function MediaMultiVideoRendererToMemo({
  numberOfInitialVisibleMediaMembers,
  mediaRenderingDataSourceList,
  mediaRenderingDataSourceForPresenter,
  mediaAccessibilityTypeEnum,
  mediaAccessibilityType,
}) {
  let shouldDisplayForEquality;
  let shouldDisplayForPresentation;

  if (mediaAccessibilityType === mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_EQUALITY) {
    shouldDisplayForEquality = true;
    shouldDisplayForPresentation = false;
  } else if (
    mediaAccessibilityType === mediaAccessibilityTypeEnum.MEDIA_ACCESSIBILITY_TYPE_PRESENTATION
  ) {
    shouldDisplayForEquality = false;
    shouldDisplayForPresentation = true;
  }

  return (
    <Wrapper>
      <PresenterRendererContainer shouldDisplay={shouldDisplayForPresentation}>
        <MediaVideoRenderer
          userId={mediaRenderingDataSourceForPresenter.userId}
          userName={mediaRenderingDataSourceForPresenter.userName}
          mediaStream={mediaRenderingDataSourceForPresenter.mediaStream}
          isCancellable={mediaRenderingDataSourceForPresenter.mediaStream !== undefined}
        />
      </PresenterRendererContainer>
      <EqualityTypeMembersRendererContainer shouldDisplay={shouldDisplayForEquality}>
        {mediaRenderingDataSourceList.map((mediaRenderingDataSource, index) => {
          return (
            <EqualityTypeMemberRendererContainer
              key={index}
              numberOfInitialVisibleMembers={numberOfInitialVisibleMediaMembers}
            >
              <MediaVideoRenderer
                key={index}
                userId={mediaRenderingDataSource.userId}
                userName={mediaRenderingDataSource.userName}
                mediaStream={mediaRenderingDataSource.mediaStream}
                volume={mediaRenderingDataSource.volume}
              />
            </EqualityTypeMemberRendererContainer>
          );
        })}
      </EqualityTypeMembersRendererContainer>
      <PresentationTypeMembersRendererContainer
        shouldDisplay={shouldDisplayForPresentation}
        numberOfInitialVisibleMembers={numberOfInitialVisibleMediaMembers}
      >
        {mediaRenderingDataSourceList.map((mediaRenderingDataSource, index) => {
          return (
            <PresentationTypeMemberRendererContainer
              key={index}
              numberOfInitialVisibleMembers={numberOfInitialVisibleMediaMembers}
            >
              <MediaVideoRenderer
                key={index}
                userId={mediaRenderingDataSource.userId}
                userName={mediaRenderingDataSource.userName}
                mediaStream={mediaRenderingDataSource.mediaStream}
                volume={mediaRenderingDataSource.volume}
                isVideoClickable={true}
              />
            </PresentationTypeMemberRendererContainer>
          );
        })}
      </PresentationTypeMembersRendererContainer>
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
  const isMediaAccessibilityTypeEnumEqual = Object.is(
    prevProps.mediaAccessibilityTypeEnum,
    nextProps.mediaAccessibilityTypeEnum
  );
  const isMediaAccessibilityTypeEqual = Object.is(
    prevProps.mediaAccessibilityType,
    nextProps.mediaAccessibilityType
  );
  return (
    isNumberOfInitialVisibleMediaMembersEqual &&
    isMediaRenderingDataSourceListEqual &&
    isMediaRenderingDataSourceForPresenterEqual &&
    isMediaAccessibilityTypeEnumEqual &&
    isMediaAccessibilityTypeEqual
  );
};

const MemorizedMediaMultiVideoRenderer = React.memo(MediaMultiVideoRendererToMemo, arePropsEqual);

export default function MediaMultiVideoRenderer({}) {
  const {
    numberOfInitialVisibleMediaMembers,
    mediaRenderingDataSourceList,
    mediaRenderingDataSourceForPresenter,
    mediaAccessibilityTypeEnum,
    mediaAccessibilityType,
  } = useContext(GlobalContext);

  return (
    <MemorizedMediaMultiVideoRenderer
      numberOfInitialVisibleMediaMembers={numberOfInitialVisibleMediaMembers}
      mediaRenderingDataSourceList={mediaRenderingDataSourceList}
      mediaRenderingDataSourceForPresenter={mediaRenderingDataSourceForPresenter}
      mediaAccessibilityTypeEnum={mediaAccessibilityTypeEnum}
      mediaAccessibilityType={mediaAccessibilityType}
    />
  );
}
