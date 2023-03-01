import * as React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { selectAllMembersCount, selectAllMembersOverview } from "store/membershipSlice";

const visualAvatarsCount = 4;

export default function MemberOverview({ visualAvatarMarginLeft }) {
  const allMembersOverview = useSelector(selectAllMembersOverview);
  const allMembersCount = useSelector(selectAllMembersCount);

  return (
    <Wrapper>
      {Object.entries(allMembersOverview).map(([id, initialLetterOfName], index) => {
        if (index > visualAvatarsCount - 1 && index === allMembersCount - 1) {
          const hiddenAvatarsCount = allMembersCount - visualAvatarsCount;
          return <HiddenAvatarWrapper key={id}>{`+${hiddenAvatarsCount}`}</HiddenAvatarWrapper>;
        } else if (index <= visualAvatarsCount - 1) {
          const marginLeft = index !== 0 ? visualAvatarMarginLeft : 0;
          return (
            <VistualAvatarWrapper
              key={id}
              zIndex={allMembersCount - index}
              marginLeft={marginLeft}
            >
              {initialLetterOfName}
            </VistualAvatarWrapper>
          );
        } else {
          return;
        }
      })}
    </Wrapper>
  );
}

const AvatarWrapper = styled.div`
  box-sizing: border-box;
  height: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid rgb(36, 41, 47);
  border-radius: 50%;
  background-color: rgb(255, 255, 255);
  font-size: 18px;
  font-weight: 500;
  color: rgb(120, 144, 156);
  text-align: center;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const VistualAvatarWrapper = styled(AvatarWrapper)`
  margin-left: ${(props) => props.marginLeft}px;
  z-index: ${(props) => props.zIndex};
`;

const HiddenAvatarWrapper = styled(AvatarWrapper)`
  margin-left: 3px;
`;

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 10px);
  display: flex;
  flex-direction: row;
  justify-content: start;

  padding-top: 5px;
  padding-bottom: 5px;
`;
