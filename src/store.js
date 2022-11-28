import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./components/features/authSlice";
import roomReducer, { updateJoinedRoomId, updateRoomList } from "./components/features/roomSlice";
import WebRTCGroupChatService from "./components/features/WebRTCGroupChat/WebRTCGroupChatService/WebRTCGroupChatService.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
  },
});

WebRTCGroupChatService.onRoomsInfoUpdated((payload) => {
  const rooms = payload.rooms;
  if (rooms) {
    store.dispatch(updateRoomList(rooms));
  }
});
WebRTCGroupChatService.onJoinRoomInSuccess((payload) => {
  const roomId = payload.roomId;
  const roomName = payload.roomName;
  if (roomId.length > 0 && roomName.length > 0) {
    store.dispatch(updateJoinedRoomId({ roomId, roomName }));
  }
});
WebRTCGroupChatService.onLeaveRoomInSuccess((payload) => {
  store.dispatch(updateJoinedRoomId({ roomId: "", roomName: "" }));
});

export default store;
