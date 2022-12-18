import React, { useContext } from "react";
import styled from "styled-components";

import { MediaRenderingContext } from "context/media-rendering-context";
import MediaVideoRenderer from "./MediaVideoRenderer";

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

export default function MediaMultiVideoRenderer({}) {
  const {
    numberOfInitialVisibleMediaMembers,
    mediaRenderingDataSourceList,
    mediaRenderingDataSourceForPresenter,
    mediaAccessibilityTypeEnum,
    mediaAccessibilityType,
  } = useContext(MediaRenderingContext);

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
                isVideoClickable={true}
              />
            </PresentationTypeMemberRendererContainer>
          );
        })}
      </PresentationTypeMembersRendererContainer>
    </Wrapper>
  );
}
