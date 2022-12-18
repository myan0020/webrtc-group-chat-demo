import React, { useContext } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { LocalizationContext } from "context/localization-context";
import { selectAuth } from "store/authSlice";
import GoBackNavigator from "./GoBackNavigator";
import NewRoomNavigator from "./NewRoomNavigator";
import SignoutNavigator from "./SignoutNavigator";
import { localizableStringKeyEnum } from "resource/string/localizable-strings";
import LocalizationSwitch from "./LocalizationSwitch";

const sharedStyleValues = {
  rightContainerInnerHorizontalMargin: 8,
  welcomeUserWrapperMarginRight: 20,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgb(36, 41, 47);
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LeftContainer = styled.div`
  flex: 0 0 49px;
  height: 100%;
  margin-right: 15px;
`;

const MiddleContainer = styled.div`
  flex: 1 0 400px;
  height: 100%;
  margin-left: 15px;
`;

const RightContainer = styled.div`
  flex: 1 0 200px;
  height: 100%;

  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
`;

const WelcomeUserWrapper = styled.div`
  flex: 1 0 200px;
  text-align: end;
  color: rgb(255, 255, 255);
  margin-right: ${sharedStyleValues.welcomeUserWrapperMarginRight}px;
`;

const LocalizationSwitchContainer = styled.div`
  flex: 0 0 80px;
  height: 35px;
  margin-left: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  margin-right: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
`;

const SignoutNavigatorContainer = styled.div`
  flex: 0 0 100px;
  box-sizing: border-box;
  height: 38px;

  margin-left: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  margin-right: ${sharedStyleValues.rightContainerInnerHorizontalMargin * 2}px;
`;

export default function NavigationBar() {
  const { localizedStrings } = useContext(LocalizationContext);
  const { authenticatedUserName } = useSelector(selectAuth);

  const welcomeUserMessage = `${
    localizedStrings[localizableStringKeyEnum.NAVIGATION_WELCOME]
  }, ${authenticatedUserName}`;

  return (
    <Wrapper>
      <LeftContainer>
        <GoBackNavigator />
      </LeftContainer>
      <MiddleContainer>
        <NewRoomNavigator />
      </MiddleContainer>
      <RightContainer>
        <WelcomeUserWrapper>{welcomeUserMessage}</WelcomeUserWrapper>
        <LocalizationSwitchContainer>
          <LocalizationSwitch />
        </LocalizationSwitchContainer>
        <SignoutNavigatorContainer>
          <SignoutNavigator />
        </SignoutNavigatorContainer>
      </RightContainer>
    </Wrapper>
  );
}
