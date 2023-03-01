import * as React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { selectAllMembers } from "store/membershipSlice";

export default function MemberDetail({ display }) {
  const allMembers = useSelector(selectAllMembers);
  return (
    <Wrapper display={display}>
      <DetailListWrapper>
        {Object.entries(allMembers).map(([id, { name }]) => {
          return <DetailListItemWrapper key={id}>{name}</DetailListItemWrapper>;
        })}
      </DetailListWrapper>
    </Wrapper>
  );
}

const sharedStyleValues = {
  dropdownOptionHorizontalMargin: 5,
  dropdownOptionVerticalMargin: 0,
};

const DetailListWrapper = styled.ul`
  display: ${(props) => props.display};
  box-sizing: border-box;
  width: 100px;
  padding: 0;
  padding-top: 3px;
  padding-bottom: 3px;
  margin: 0;
  border: 1.5px solid rgb(120, 144, 156);
  border-radius: 10px;
  position: absolute;
  top: -1px;
  left: -5px;
  background-color: rgb(255, 255, 255);
`;

const DetailListItemWrapper = styled.li`
  box-sizing: border-box;
  height: 30px;
  list-style-type: none;
  color: rgb(120, 144, 156);
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - ${sharedStyleValues.dropdownOptionHorizontalMargin * 2}px);
  border-radius: 10px;
  margin-left: ${sharedStyleValues.dropdownOptionHorizontalMargin}px;
  margin-right: ${sharedStyleValues.dropdownOptionHorizontalMargin}px;
  margin-top: ${sharedStyleValues.dropdownOptionVerticalMargin}px;
  margin-bottom: ${sharedStyleValues.dropdownOptionVerticalMargin}px;
`;

const Wrapper = styled.div`
  position: relative;
  display: ${(props) => props.display};
  z-index: 2;
`;
