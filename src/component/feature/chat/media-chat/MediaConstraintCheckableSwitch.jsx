import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { selectMediaChat } from "../../../../store/mediaChatSlice.js";
import MediaConstraintCheckBox from "./MediaConstraintCheckBox.jsx";
import MediaConstraintSwitch from "./MediaConstraintSwitch.jsx";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 202px;
  height: 55px;
  border: 1px solid ${(props) => props.borderColor};
  border-radius: 10px;
  box-sizing: border-box;
  margin-left: 5px;
  margin-right: 5px;
`;

const MediaConstraintCheckBoxContainer = styled.div`
  margin-left: 18px;
`;

const MediaConstraintSwitchContainer = styled.div`
  margin-left: 9px;
  margin-right: 9px;
`;

export const MediaConstraintCheckableSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaConstraintCheckableSwitch({}) {
  const { isCalling } = useSelector(selectMediaChat);
  const borderColor = isCalling ? "#C4C4C4" : "rgb(33, 150, 243)";
  return (
    <Wrapper borderColor={borderColor}>
      <MediaConstraintCheckBoxContainer>
        <MediaConstraintCheckBox />
      </MediaConstraintCheckBoxContainer>
      <MediaConstraintSwitchContainer>
        <MediaConstraintSwitch />
      </MediaConstraintSwitchContainer>
    </Wrapper>
  );
}
