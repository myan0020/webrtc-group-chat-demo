import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import roomReducer, { updateJoinedRoomId, updateRoomList } from "./roomSlice";
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
} from "./mediaChatSlice";
import textChatReducer, { receiveTextMessage } from "./textChatSlice";
import fileChatReducer from "./fileChatSlice";
import WebRTCGroupChatService from "../service/WebRTCGroupChatService/WebRTCGroupChatService";

const combinedReducer = combineReducers({
  auth: authReducer,
  room: roomReducer,
  mediaChat: mediaChatReducer,
  textChat: textChatReducer,
  fileChat: fileChatReducer,
},);

const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    state = undefined;
  }
  return combinedReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
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

WebRTCGroupChatService.onChatMessageReceived((message) => {
  store.dispatch(receiveTextMessage(message));
});

export default store;
