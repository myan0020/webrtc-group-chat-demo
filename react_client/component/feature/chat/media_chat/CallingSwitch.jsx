import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import SingleTabSwitch, {
  singleTabSwitchOptionBuilder,
  singleTabSwitchPropsBuilder,
} from "../../../generic/switch/SingleTabSwitch";
import { startCalling, hangUpCalling, selectIsCalling } from "store/mediaChatSlice";
import startCallingUrl from "resource/image/start_calling_3x.png";
import hangUpCallingUrl from "resource/image/hang_up_calling_3x.png";

const Wrapper = styled.div`
  width: 590px;
  height: 55px;
  margin-left: 5px;
  margin-right: 5px;
`;

export const CallingSwitchPropsBuilder = ({}) => {
  return {};
};

export default function CallingSwitch({}) {
  const dispatch = useDispatch();
  const isCalling = useSelector(selectIsCalling);

  const startCallingOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(0, 150, 136)",
    switchOptionBackgroundColor: "rgba(255, 255, 255, 0)",
    switchOptionBackgroundImageUrl: startCallingUrl,
    switchOptionBackgroundImageSize: "contain",
    switchOptionOnClick: () => {
      dispatch(startCalling());
    },
    switchOptionSelected: !isCalling,
  });
  const hangUpCallingOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(244, 67, 54)",
    switchOptionBackgroundColor: "rgba(255, 255, 255, 0)",
    switchOptionBackgroundImageUrl: hangUpCallingUrl,
    switchOptionBackgroundImageSize: "contain",
    switchOptionOnClick: () => {
      dispatch(hangUpCalling());
    },
    switchOptionSelected: isCalling,
  });

  return (
    <Wrapper>
      <SingleTabSwitch
        {...singleTabSwitchPropsBuilder({
          switchEnabled: true,
          switchOneOption: startCallingOption,
          switchAnotherOption: hangUpCallingOption,
        })}
      />
    </Wrapper>
  );
}
