import React from "react";
import styled from "styled-components";

import MediaRenderingStyleSwitch from "./MediaRenderingStyleSwitch";
import MediaMultiVideoRenderer from "./MediaMultiVideoRenderer";

const sharedStyleValues = {
  mediaRenderingStyleSwitchContainerHeight: 54,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const MediaRenderingStyleSwitchContainer = styled.div`
  width: 100%;
  height: ${sharedStyleValues.mediaRenderingStyleSwitchContainerHeight}px;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  box-sizing: border-box;
  padding-left: 20px;
  padding-right: 20px;
`;

const MediaRenderingContainer = styled.div`
  width: 100%;
  height: calc(100% - ${sharedStyleValues.mediaRenderingStyleSwitchContainerHeight}px);
`;

export const MediaRendererPropsBuilder = ({}) => {
  return {};
};

export default function MediaRenderer({}) {
  return (
    <Wrapper>
      <MediaRenderingStyleSwitchContainer>
        <MediaRenderingStyleSwitch />
      </MediaRenderingStyleSwitchContainer>
      <MediaRenderingContainer>
        <MediaMultiVideoRenderer />
      </MediaRenderingContainer>
    </Wrapper>
  );
}
