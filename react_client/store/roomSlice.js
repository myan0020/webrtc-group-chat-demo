import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";
import * as loadingStatusEnum from "constant/enum/loading-status";

const initialState = {
  roomList: {},
  joinedRoomId: "",
  joinedRoomName: "",
  isNewRoomPopupVisible: false,
  loadingStatus: loadingStatusEnum.status.IDLE,
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    updateRoomList: {
      reducer(sliceState, action) {
        sliceState.roomList = action.payload;
      },
    },
    toggleNewRoomPopupVisibility: {
      reducer(sliceState, action) {
        sliceState.isNewRoomPopupVisible = !sliceState.isNewRoomPopupVisible;
      },
    },
    updateJoinedRoomId: {
      reducer(sliceState, action) {
        sliceState.joinedRoomId = action.payload.roomId;
        sliceState.joinedRoomName = action.payload.roomName;
      },
    },
    reset: {
      reducer(sliceState, action) {
        return initialState;
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialRoomList.pending, (sliceState, action) => {
        sliceState.loadingStatus = loadingStatusEnum.status.LOADING;
      })
      .addCase(fetchInitialRoomList.fulfilled, (sliceState, action) => {
        sliceState.loadingStatus = loadingStatusEnum.status.IDLE;
        if (action.payload.responseStatus !== 200) {
          return;
        }
        sliceState.roomList = action.payload.roomList;
      });
  },
});

/* Thunk action creator */

export const fetchInitialRoomList = createAsyncThunk("room/fetchInitialRoomList", async () => {
  const config = {
    url: "/api/rooms",
    method: "GET",
  };
  const response = await axios(config);
  if (!response || !response.data || !response.data.payload) {
    return;
  }
  return {
    responseStatus: response.status,
    roomList: response.data.payload.rooms,
  };
});

export const createRoom = createAsyncThunk("room/createRoom", async (roomName) => {
  if (!roomName || roomName.length === 0) return;
  WebRTCGroupChatService.createNewRoom(roomName);
});

export const joinRoom = createAsyncThunk("room/joinRoom", async (roomId) => {
  if (!roomId || roomId.length === 0) return;
  WebRTCGroupChatService.joinRoom(roomId);
});

export const leaveRoom = createAsyncThunk("room/leaveRoom", async (_, thunkAPI) => {
  WebRTCGroupChatService.leaveRoom();
});

/* Reducer */

export default roomSlice.reducer;

/* Action Creator */

export const { updateRoomList, toggleNewRoomPopupVisibility, updateJoinedRoomId, reset } =
  roomSlice.actions;

/* Selector */

export const selectRoom = (state) => {
  return state.room;
};

export const selectHasJoinedRoom = createSelector(selectRoom, (room) => {
  return room.joinedRoomId.length > 0;
});

export const selectJoinedRoomName = createSelector(selectRoom, (room) => {
  return room.joinedRoomName;
});

export const selectRoomList = createSelector(selectRoom, (room) => {
  return room.roomList;
});

export const selectNewRoomPopupVisible = createSelector(selectRoom, (room) => {
  return room.isNewRoomPopupVisible;
});

export const selectLoadingStatus = createSelector(selectRoom, (room) => {
  return room.loadingStatus;
});
