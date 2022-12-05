import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./components/features/authSlice";
import roomReducer, { updateJoinedRoomId, updateRoomList } from "./components/features/roomSlice";
import mediaChatReducer, {
  updateIsCalling,
  updateAudioEnablingAvaliable,
  updateAudioEnabling,
  updateAudioMutingAvaliable,
  updateAudioMuting,
  updateVideoEnablingAvaliable,
  updateVideoEnabling,
  updateVideoMutingAvaliable,
  updateVideoMuting,
} from "./components/features/mediaChatSlice";
import textChatReducer from "./components/features/textChatSlice";
import fileChatReducer from "./components/features/fileChatSlice";
import WebRTCGroupChatService from "./components/features/WebRTCGroupChat/WebRTCGroupChatService/WebRTCGroupChatService.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
    mediaChat: mediaChatReducer,
    textChat: textChatReducer,
    fileChat: fileChatReducer,
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

WebRTCGroupChatService.onWebRTCCallingStateChanged((isCalling) => {
  store.dispatch(updateIsCalling(isCalling));
});

WebRTCGroupChatService.onLocalAudioEnableAvaliableChanged((avaliable) => {
  store.dispatch(updateAudioEnablingAvaliable(avaliable));
  store.dispatch(updateAudioEnabling(WebRTCGroupChatService.localMicEnabled));
});

WebRTCGroupChatService.onLocalAudioMuteAvaliableChanged((avaliable) => {
  store.dispatch(updateAudioMutingAvaliable(avaliable));
  store.dispatch(updateAudioMuting(WebRTCGroupChatService.localMicMuted));
});

WebRTCGroupChatService.onLocalVideoEnableAvaliableChanged((avaliable) => {
  store.dispatch(updateVideoEnablingAvaliable(avaliable));
  store.dispatch(updateVideoEnabling(WebRTCGroupChatService.localCameraEnabled));
});

WebRTCGroupChatService.onLocalVideoMuteAvaliableChanged((avaliable) => {
  store.dispatch(updateVideoMutingAvaliable(avaliable));
  store.dispatch(updateVideoMuting(WebRTCGroupChatService.localCameraMuted));
});

export default store;
