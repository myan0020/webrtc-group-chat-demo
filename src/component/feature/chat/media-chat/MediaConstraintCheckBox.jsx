import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import CheckBox, { checkBoxPropsBuilder } from "component/generic/checkbox/CheckBox";
import { selectMediaChat, updateVideoCallingInputEnabling } from "store/mediaChatSlice";

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
          boxCheckMarkImageSize: "15px 11px",
          onBoxClick: () => {
            dispatch(updateVideoCallingInputEnabling(!enableVideoCallingInput));
          },
        })}
      />
    </Wrapper>
  );
}
