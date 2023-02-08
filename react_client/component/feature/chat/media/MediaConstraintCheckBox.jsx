import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import CheckBox, { checkBoxPropsBuilder } from "../../../generic/checkbox/CheckBox";
import {
  selectEnableVideoCallingInput,
  selectIsCalling,
  updateVideoCallingInputEnabling,
} from "store/mediaChatSlice";

export const MediaConstraintCheckBoxPropsBuilder = ({}) => {
  return {};
};

export default function MediaConstraintCheckBox() {
  const dispatch = useDispatch();
  const isCalling = useSelector(selectIsCalling);
  const enableVideoCallingInput = useSelector(selectEnableVideoCallingInput);

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

const Wrapper = styled.div`
  width: 20px;
  height: 20px;
`;