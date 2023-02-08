import React from "react";
import styled from "styled-components";

import MemberAvatarStack from "./MemberAvatarStack";

export default function MembershipRenderer({}) {
  return (
    <Wrapper>
      <MemberAvatarStackContainer>
        <MemberAvatarStack />
      </MemberAvatarStackContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  
`;

const MemberAvatarStackContainer = styled.div`
  width: 100%;
  height: 100%;
`;
