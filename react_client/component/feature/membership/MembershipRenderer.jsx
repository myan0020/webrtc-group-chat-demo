import React, { useState } from "react";
import styled from "styled-components";

import MemberOverview from "./MemberOverview";
import MemberDetail from "./MemberDetail";

const visualMemberAvatarMarginLeftWhenMouseMovedInside = 0;
const visualMemberAvatarMarginLeftWhenMouseMovedOutside = -5;
const memberDetailDisplayWhenMouseMovedInside = "block";
const memberDetailDisplayWhenMouseMovedOutside = "none";

export default function MembershipRenderer({}) {
  const [detailDisplay, setDetailDisplay] = useState(memberDetailDisplayWhenMouseMovedOutside);
  const [visualMemberAvatarMarginLeft, setVisualMemberAvatarMarginLeft] = useState(
    visualMemberAvatarMarginLeftWhenMouseMovedOutside
  );

  const showDetail = () => {
    setDetailDisplay(memberDetailDisplayWhenMouseMovedInside);
    setVisualMemberAvatarMarginLeft(visualMemberAvatarMarginLeftWhenMouseMovedInside);
  };

  const hideDetail = () => {
    setDetailDisplay(memberDetailDisplayWhenMouseMovedOutside);
    setVisualMemberAvatarMarginLeft(visualMemberAvatarMarginLeftWhenMouseMovedOutside);
  };

  return (
    <Wrapper
      onMouseEnter={showDetail}
      onMouseLeave={hideDetail}
    >
      <OverviewContainer>
        <MemberOverview visualAvatarMarginLeft={visualMemberAvatarMarginLeft} />
      </OverviewContainer>
      <MemberDetail display={detailDisplay} />
    </Wrapper>
  );
}

const OverviewContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;
