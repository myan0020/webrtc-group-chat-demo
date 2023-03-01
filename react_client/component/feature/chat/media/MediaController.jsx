import * as React from "react";
import styled from "styled-components";

import MediaConstraintCheckableSwitch from "./MediaConstraintCheckableSwitch";
import CallingSwitch from "./CallingSwitch";
import MediaAudioEnablingSwitch from "./MediaAudioEnablingSwitch";
import MediaVideoEnablingSwitch from "./MediaVideoEnablingSwitch";

export const MediaControllerPropsBuilder = ({}) => {
  return {};
};

export default function MediaController({}) {
  return (
    <Wrapper>
      <MediaConstraintCheckableSwitch />
      <CallingSwitch />

      <MediaEnablingSwitchWrapper>
        <MediaVideoEnablingSwitch />
        <MediaAudioEnablingSwitch />
      </MediaEnablingSwitchWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-bottom: 15px;
  width: 100%;
  height: 75px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const MediaEnablingSwitchWrapper = styled.div`
  margin-left: 5px;
  margin-right: 5px;
  display: flex;
  flex-direction: row;
`;
