import React from "react";
import styled from "styled-components";

import style from "./MediaController.module.css";
import MediaConstrainCheckableSwitch from "./MediaConstrainCheckableSwitch.jsx";
import CallingSwitch from "./CallingSwitch.jsx";
import MediaAudioEnablingSwitch from "./MediaAudioEnablingSwitch.jsx";
import MediaVideoEnablingSwitch from "./MediaVideoEnablingSwitch.jsx";

// const MediaControllerWrapper = styled.div``;

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
    <div className={style.background}>
      <MediaConstrainCheckableSwitch />
      <CallingSwitch />

      <MediaEnablingSwitchWrapper>
        <MediaVideoEnablingSwitch />
        <MediaAudioEnablingSwitch />
      </MediaEnablingSwitchWrapper>
    </div>
  );
}
