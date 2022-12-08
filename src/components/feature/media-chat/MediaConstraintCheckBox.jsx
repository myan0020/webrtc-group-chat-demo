import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import CheckBox, { checkBoxPropsBuilder } from "../../generic/checkbox/CheckBox.jsx";
import { selectMediaChat, updateVideoCallingInputEnabling } from "../../../redux/mediaChatSlice.js";

const Wrapper = styled.div`
  width: 20px;
  height: 20px;
`;

export const MediaConstraintCheckBoxPropsBuilder = ({}) => {
  return {};
};

export default function MediaConstraintCheckBox() {
  const dispatch = useDispatch();
  const { enableVideoCallingInput, isCalling } = useSelector(selectMediaChat);

  return (
    <Wrapper>
      <CheckBox
        {...checkBoxPropsBuilder({
          initialEnabled: !isCalling,
          initalChecked: enableVideoCallingInput,
          onBoxClick: () => {
            dispatch(updateVideoCallingInputEnabling(!enableVideoCallingInput));
          },
        })}
      />
    </Wrapper>
  );
}
