import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { selectAllMembersCount, selectAllMembersOverview } from "store/membershipSlice";

const visualAvatarsCount = 4;

export default function MemberAvatarStack({}) {
  const allMembersOverview = useSelector(selectAllMembersOverview);
  const allMembersCount = useSelector(selectAllMembersCount);

  return (
    <Wrapper>
      {Object.entries(allMembersOverview).map(([_, initialLetterOfName], index) => {
        if (index > visualAvatarsCount - 1 && index === allMembersCount - 1) {
          const hiddenAvatarsCount = allMembersCount - visualAvatarsCount;
          return <HiddenAvatarWrapper>{`+${hiddenAvatarsCount}`}</HiddenAvatarWrapper>;
        } else if (index <= visualAvatarsCount - 1) {
          return (
            <VistualAvatarWrapper zIndex={allMembersCount - index}>
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

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const VistualAvatarWrapper = styled.div`
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
  margin-left: -5%;
  z-index: ${(props) => props.zIndex};
`;

const HiddenAvatarWrapper = styled.div`
  box-sizing: border-box;
  height: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid rgb(36, 41, 47);
  border-radius: 50%;
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  margin-left: 3px;
`;
