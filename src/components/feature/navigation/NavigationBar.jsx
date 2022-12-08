import React from "react";
import styled from "styled-components";

import GoBackNavigator from "./GoBackNavigator.jsx";
import NewRoomNavigator from "./NewRoomNavigator.jsx";
import SignoutNavigator from "./SignoutNavigator.jsx";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgb(36, 41, 47);
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const GoBackContainer = styled.div`
  flex: 0 0 49px;
  height: 100%;
  margin-right: 15px;
`;

const NewRoomContainer = styled.div`
  flex: 1 0 400px;
  height: 100%;
  margin-left: 15px;
`;

const SignoutContainer = styled.div`
  flex: 1 0 200px;
  height: 100%;
`;

export default function NavigationBar() {
  return (
    <Wrapper>
      <GoBackContainer>
        <GoBackNavigator />
      </GoBackContainer>
      <NewRoomContainer>
        <NewRoomNavigator />
      </NewRoomContainer>
      <SignoutContainer>
        <SignoutNavigator />
      </SignoutContainer>
    </Wrapper>
  );
}
