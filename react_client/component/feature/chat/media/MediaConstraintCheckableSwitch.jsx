import * as React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { selectIsCalling } from "store/mediaChatSlice";
import MediaConstraintCheckBox from "./MediaConstraintCheckBox";
import MediaConstraintSwitch from "./MediaConstraintSwitch";

export const MediaConstraintCheckableSwitchPropsBuilder = ({}) => {
  return {};
};

export default function MediaConstraintCheckableSwitch({}) {
  const isCalling = useSelector(selectIsCalling);
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
