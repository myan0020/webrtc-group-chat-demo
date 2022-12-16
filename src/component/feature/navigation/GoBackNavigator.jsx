import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { selectRoom, leaveRoom } from "../../../store/roomSlice.js";
import goBackImageUrl from "./images/go_back_3x.png";

const Wrapper = styled.button`
  width: 100%;
  height: 100%;
  visibility: ${(props) => props.visiblility};
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(${goBackImageUrl});
  background-color: transparent;
  border-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: calc(100% / 3);
`;

export default function GoBackNavigator() {
  const dispatch = useDispatch();
  const { joinedRoomId } = useSelector(selectRoom);

  const handleRoomLeaved = () => {
    dispatch(leaveRoom());
  };

  const hasJoinedRoom = joinedRoomId && joinedRoomId.length > 0;
  const visiblility = !hasJoinedRoom ? "hidden" : "visible";

  return (
    <Wrapper
      visiblility={visiblility}
      onClick={handleRoomLeaved}
    />
  );
}
