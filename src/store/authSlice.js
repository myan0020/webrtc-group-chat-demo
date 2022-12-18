import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { fetchInitialRoomList, leaveRoom, selectRoom } from "./roomSlice";
import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";
import { clearTextMessage } from "./textChatSlice";

export const requestStatus = {
  idle: "idle",
  loading: "loading",
  succeeded: "succeeded",
  failed: "failed",
};

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    authenticated: false,
    authenticatedUserName: "",
    authenticatedUserId: "",
    requestStatus: requestStatus.idle,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestToSignin.pending, (sliceState, action) => {
        sliceState.requestStatus = requestStatus.loading;
      })
      .addCase(requestToSignin.fulfilled, (sliceState, action) => {
        sliceState.requestStatus = requestStatus.idle;
        if (!action.payload) {
          return;
        }
        sliceState.authenticated = true;
        sliceState.authenticatedUserName = action.payload.userName;
        sliceState.authenticatedUserId = action.payload.userId;
      })
      .addCase(requestToSignout.pending, (sliceState, action) => {
        sliceState.requestStatus = requestStatus.loading;
      })
      .addCase(requestToSignout.fulfilled, (sliceState, action) => {
        sliceState.requestStatus = requestStatus.idle;
        if (!action.payload) {
          return;
        }
        sliceState.authenticated = false;
        sliceState.authenticatedUserName = "";
        sliceState.authenticatedUserId = "";
      });
  },
});

/* Thunk action creator */

export const requestToSignin = createAsyncThunk(
  "auth/requestToSignin",
  async (userName, thunkAPI) => {
    const config = {
      url: "/login",
      method: "POST",
      data: {
        userName: userName ? userName : "unknownUserName",
      },
    };
    const response = await axios(config);
    if (response.status !== 200) {
      return;
    }

    // side effects
    thunkAPI.dispatch(fetchInitialRoomList());
    WebRTCGroupChatService.start();

    return {
      responseStatus: response.status,
      userName: response.data.payload.userName,
      userId: response.data.payload.userId,
    };
  }
);

export const requestToSignout = createAsyncThunk("auth/requestToSignout", async (_, thunkAPI) => {
  const joinedRoomId = selectRoom(thunkAPI.getState()).joinedRoomId;
  const hasJoinedRoom = joinedRoomId && joinedRoomId.length > 0;
  if (hasJoinedRoom) {
    thunkAPI.dispatch(clearTextMessage());
    thunkAPI.dispatch(leaveRoom());
  }

  const config = {
    url: "/logout",
    method: "POST",
  };
  const response = await axios(config);
  if (response.status !== 200) {
    return;
  }

  return {
    responseStatus: response.status,
  };
});

/* Reducer */

export default authSlice.reducer;

/* Selector */

export const selectAuth = (state) => state.auth;
