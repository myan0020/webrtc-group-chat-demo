import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import SingleTabSwitch, {
  singleTabSwitchOptionBuilder,
  singleTabSwitchPropsBuilder,
} from "../../generic/switch/SingleTabSwitch.jsx";
import { startCalling, selectMediaChat, hangUpCalling } from "../mediaChatSlice.js";
import startCallingUrl from "./images/start_calling_1x.png";
import hangUpCallingUrl from "./images/hang_up_calling_1x.png";

const CallingSwitchWrapper = styled.div`
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
  const { isCalling } = useSelector(selectMediaChat);

  const startCallingOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(0, 150, 136)",
    switchOptionBackgroundColor: "rgba(255, 255, 255, 0)",
    switchOptionBackgroundImageUrl: startCallingUrl,
    switchOptionOnClick: () => {
      dispatch(startCalling());
    },
    switchOptionSelected: !isCalling,
  });
  const hangUpCallingOption = singleTabSwitchOptionBuilder({
    switchOptionBorderColor: "rgb(244, 67, 54)",
    switchOptionBackgroundColor: "rgba(255, 255, 255, 0)",
    switchOptionBackgroundImageUrl: hangUpCallingUrl,
    switchOptionOnClick: () => {
      dispatch(hangUpCalling());
    },
    switchOptionSelected: isCalling,
  });

  return (
    <CallingSwitchWrapper>
      <SingleTabSwitch
        {...singleTabSwitchPropsBuilder({
          switchEnabled: true,
          switchOneOption: startCallingOption,
          switchAnotherOption: hangUpCallingOption,
        })}
      />
    </CallingSwitchWrapper>
  );
}
