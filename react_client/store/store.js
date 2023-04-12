import { combineReducers, configureStore } from "@reduxjs/toolkit";
import GroupChatService from "webrtc-group-chat-client";

import authReducer from "./authSlice";
import roomReducer, {
  updateJoinedRoomId,
  updateRoomList,
  updateRoomLoadingStatus,
} from "./roomSlice";
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
import membershipReducer, { updatePeersInfo as updateMembershipPeersInfo } from "./membershipSlice";
import * as loadingStatusEnum from "constant/enum/loading-status";

const combinedReducer = combineReducers({
  auth: authReducer,
  room: roomReducer,
  mediaChat: mediaChatReducer,
  textChat: textChatReducer,
  membership: membershipReducer,
});

const store = configureStore({
  reducer: (state, action) => {
    if (action.type === "RESET") {
      state = undefined;
    }
    return combinedReducer(state, action);
  },
});

/**
 * GroupChatService preparation
 */

const iceServerUserName = env.TURN_SERVER_USER_NAME;
const iceServerCredential = env.TURN_SERVER_CREDENTIAL;
const iceServerUrls = JSON.parse(env.TURN_SERVER_URLS);

GroupChatService.peerConnectionConfig = {
  iceServers: [
    {
      username: iceServerUserName,
      credential: iceServerCredential,
      urls: iceServerUrls,
    },
  ],
};

GroupChatService.onRoomsInfoUpdated((payload) => {
  const rooms = payload.rooms;
  if (rooms) {
    store.dispatch(updateRoomList(rooms));
  }
});

GroupChatService.onJoinRoomInSuccess((payload) => {
  const roomId = payload.roomId;
  const roomName = payload.roomName;
  if (roomId.length > 0 && roomName.length > 0) {
    store.dispatch(updateJoinedRoomId({ roomId, roomName }));
    store.dispatch(updateRoomLoadingStatus(loadingStatusEnum.status.IDLE));
  }
});

GroupChatService.onLeaveRoomInSuccess((payload) => {
  store.dispatch(updateJoinedRoomId({ roomId: "", roomName: "" }));
  store.dispatch(updateRoomLoadingStatus(loadingStatusEnum.status.IDLE));
});
 
GroupChatService.onWebRTCCallingStateChanged((isCalling) => {
  store.dispatch(updateIsCalling(isCalling));
});

GroupChatService.onLocalAudioEnableAvaliableChanged((avaliable) => {
  store.dispatch(updateAudioEnablingAvaliable(avaliable));
  store.dispatch(updateAudioEnabling(GroupChatService.localMicEnabled));
});

GroupChatService.onLocalAudioMuteAvaliableChanged((avaliable) => {
  store.dispatch(updateAudioMutingAvaliable(avaliable));
  store.dispatch(updateAudioMuting(GroupChatService.localMicMuted));
});

GroupChatService.onLocalVideoEnableAvaliableChanged((avaliable) => {
  store.dispatch(updateVideoEnablingAvaliable(avaliable));
  store.dispatch(updateVideoEnabling(GroupChatService.localCameraEnabled));
});

GroupChatService.onLocalVideoMuteAvaliableChanged((avaliable) => {
  store.dispatch(updateVideoMutingAvaliable(avaliable));
  store.dispatch(updateVideoMuting(GroupChatService.localCameraMuted));
});

GroupChatService.onChatMessageReceived((message) => {
  store.dispatch(receiveTextMessage(message));
});

GroupChatService.onPeersInfoChanged((peersInfo) => {
  store.dispatch(updateMembershipPeersInfo(peersInfo));
});

export default store;
