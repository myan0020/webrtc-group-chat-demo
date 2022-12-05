import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import CheckBox, { checkBoxPropsBuilder } from "../../generic/checkbox/CheckBox.jsx";
import { selectMediaChat, updateVideoCallingInputEnabling } from "../mediaChatSlice.js";

const MediaConstraintCheckBoxWrapper = styled.div`
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
    <MediaConstraintCheckBoxWrapper>
      <CheckBox
        {...checkBoxPropsBuilder({
          initialEnabled: !isCalling,
          initalChecked: enableVideoCallingInput,
          onBoxClick: () => {
            dispatch(updateVideoCallingInputEnabling(!enableVideoCallingInput));
          },
        })}
      />
    </MediaConstraintCheckBoxWrapper>
  );
}
