import * as React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { selectAuthenticatedUserName } from "store/authSlice";
import GoBackNavigator from "./GoBackNavigator";
import NewRoomNavigator from "./NewRoomNavigator";
import SignoutNavigator from "./SignoutNavigator";
import * as localizableEnum from "constant/enum/localizable";
import LocalizationSwitch from "../localization/LocalizationSwitch";
import * as globalWhiteImageUrl from "resource/image/gobal_white_3x.png";
import { GlobalContext } from "context/global-context";
import MembershipRenderer from "../membership/MembershipRenderer";
import { selectHasJoinedRoom } from "store/roomSlice";

export default function NavigationBar() {
  const { localizedStrings } = React.useContext(GlobalContext);
  const authenticatedUserName = useSelector(selectAuthenticatedUserName);
  return (
    <MemorizedNavigationBar
      localizedStrings={localizedStrings}
      authenticatedUserName={authenticatedUserName}
    />
  );
}

const MemorizedNavigationBar = React.memo(NavigationBarToMemo, arePropsEqual);

function NavigationBarToMemo({ localizedStrings, authenticatedUserName }) {
  const hasJoinedRoom = useSelector(selectHasJoinedRoom);
  const leftContainerVisibility = !hasJoinedRoom ? "hidden" : "visible";

  const welcomeUserMessage = `${
    localizedStrings[localizableEnum.key.NAVIGATION_WELCOME]
  }, ${authenticatedUserName}`;

  return (
    <Wrapper>
      <LeftContainer visibility={leftContainerVisibility}>
        <GoBackNavigator />
      </LeftContainer>
      <MiddleContainer>
        <NewRoomNavigator />
      </MiddleContainer>
      <RightContainer>
        {hasJoinedRoom && (
          <MembershipRendererContainer>
            <MembershipRenderer />
          </MembershipRendererContainer>
        )}

        <WelcomeUserWrapper>{welcomeUserMessage}</WelcomeUserWrapper>

        <LocalizationSwitchContainer>
          <LocalizationSwitch
            iconImageUrl={globalWhiteImageUrl}
            isSelectedTextKeyVisible={false}
          />
        </LocalizationSwitchContainer>
        <SignoutNavigatorContainer>
          <SignoutNavigator />
        </SignoutNavigatorContainer>
      </RightContainer>
    </Wrapper>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  const isLocalizedStringEqual = Object.is(prevProps.localizedStrings, nextProps.localizedStrings);
  const isAuthenticatedUserNameEqual = Object.is(
    prevProps.authenticatedUserName,
    nextProps.authenticatedUserName
  );
  return isLocalizedStringEqual && isAuthenticatedUserNameEqual;
};

const sharedStyleValues = {
  rightContainerInnerHorizontalMargin: 8,
  welcomeUserWrapperMarginRight: 25,
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
  visibility: ${(props) => props.visibility};
`;

const MiddleContainer = styled.div`
  flex: 1 0 400px;
  height: 100%;
  margin-left: 15px;
`;

const RightContainer = styled.div`
  flex: 1 0 250px;
  height: 100%;

  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
`;

const MembershipRendererContainer = styled.div`
  flex: 0 0 134px;
  height: 40px;
  margin-left: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  margin-right: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  box-sizing: border-box;
`;

const WelcomeUserWrapper = styled.div`
  flex: 0 0 content;
  text-align: end;
  color: rgb(255, 255, 255);
  margin-left: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  margin-right: ${sharedStyleValues.welcomeUserWrapperMarginRight}px;
`;

const LocalizationSwitchContainer = styled.div`
  flex: 0 0 80px;
  height: 35px;
  margin-left: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  margin-right: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  box-sizing: border-box;
`;

const SignoutNavigatorContainer = styled.div`
  flex: 0 0 80px;
  box-sizing: border-box;
  height: 34px;

  margin-left: ${sharedStyleValues.rightContainerInnerHorizontalMargin}px;
  margin-right: ${sharedStyleValues.rightContainerInnerHorizontalMargin * 2}px;
`;
