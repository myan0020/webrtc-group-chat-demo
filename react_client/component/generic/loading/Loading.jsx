import * as React from "react";
import styled from "styled-components";
import { RotatingLines } from "react-loader-spinner";

const sharedStyleValues = {
  loadingContentWidth: 100,
  loadingContentHeight: 100,
};

export default function Loading() {
  return (
    <Wrapper>
      <ContentWrapper>
        <RotatingLines
          strokeColor='white'
          strokeWidth='5'
          animationDuration='0.75'
          width={`${sharedStyleValues.loadingContentWidth}`}
          height={`${sharedStyleValues.loadingContentHeight}`}
          visible={true}
        />
      </ContentWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
`;

const ContentWrapper = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  width: ${sharedStyleValues.loadingContentWidth}px;
  height: ${sharedStyleValues.loadingContentHeight}px;
`;
