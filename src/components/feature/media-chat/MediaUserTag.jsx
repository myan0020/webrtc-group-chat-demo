import React from "react";
import styled from "styled-components";

import personSpeakImageUrl from "./images/person_speak_1x.png";

const Wrapper = styled.div`
  max-width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  min-width: 30px;
`;

const AvatarWrapper = styled.div`
  flex: 0 0 15px;
  height: 15px;
  width: 15px;
  margin-left: 8px;
  margin-right: 5px;
  background-image: url(${personSpeakImageUrl});
  background-position: center;
  background-repeat: no-repeat;
`;

const NameWrapper = styled.div`
  min-width: 20px;
  color: rgb(255, 255, 255);
  font-size: 12px;
  text-align: center;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function MediaUserTag({ userName }) {
  const name = typeof userName === "string" && userName.length > 0 ? userName : "Unknown";
  return (
    <Wrapper>
      <AvatarWrapper />
      <NameWrapper>{name}</NameWrapper>
    </Wrapper>
  );
}
