import React from "react";
import styled from "styled-components";

import MediaConstraintCheckableSwitch from "./MediaConstraintCheckableSwitch.jsx";
import CallingSwitch from "./CallingSwitch.jsx";
import MediaAudioEnablingSwitch from "./MediaAudioEnablingSwitch.jsx";
import MediaVideoEnablingSwitch from "./MediaVideoEnablingSwitch.jsx";

const Wrapper = styled.div`
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
