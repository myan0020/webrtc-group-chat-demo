import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import GroupChatService from "webrtc-group-chat-client";

import { fetchInitialRoomList } from "./roomSlice";
import * as loadingStatusEnum from "constant/enum/loading-status";

const initialState = {
  authenticated: false,
  authenticatedUserName: "",
  authenticatedUserId: "",
  loadingStatus: loadingStatusEnum.status.IDLE,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: {
      reducer(sliceState, action) {
        return initialState;
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestToSignin.pending, (sliceState, action) => {
        sliceState.loadingStatus = loadingStatusEnum.status.LOADING;
      })
      .addCase(requestToSignin.fulfilled, (sliceState, action) => {
        sliceState.loadingStatus = loadingStatusEnum.status.IDLE;
        if (!action.payload) {
          return;
        }
        sliceState.authenticated = true;
        sliceState.authenticatedUserName = action.payload.userName;
        sliceState.authenticatedUserId = action.payload.userId;
      })
      .addCase(requestToSignout.pending, (sliceState, action) => {
        sliceState.loadingStatus = loadingStatusEnum.status.LOADING;
      })
      .addCase(requestToSignout.fulfilled, (sliceState, action) => {
        sliceState.loadingStatus = loadingStatusEnum.status.IDLE;
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
    if (typeof userName !== "string" || userName.length === 0) {
      return;
    }
    const config = {
      url: "/api/login",
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

    let url;
    if (process.env.NODE_ENV === "production") {
      url = `wss://${location.hostname}`;
    } else {
      url = `ws://${location.hostname}:${env.EXPRESS_SERVER_PORT}`;
    }
    GroupChatService.connect(url);

    return {
      responseStatus: response.status,
      userName: response.data.payload.userName,
      userId: response.data.payload.userId,
    };
  }
);

export const requestToSignout = createAsyncThunk("auth/requestToSignout", async (_, thunkAPI) => {
  const config = {
    url: "/api/logout",
    method: "POST",
  };
  const response = await axios(config);
  if (response.status !== 200) {
    return;
  }

  // side effects
  GroupChatService.disconnect();

  return {
    responseStatus: response.status,
  };
});

/* Reducer */

export default authSlice.reducer;

/* Action Creator */

export const { reset } = authSlice.actions;

/* Selector */

export const selectAuth = (state) => state.auth;

export const selectAuthenticated = createSelector(selectAuth, (auth) => {
  return auth.authenticated;
});

export const selectAuthenticatedUserId = createSelector(selectAuth, (auth) => {
  return auth.authenticatedUserId;
});

export const selectAuthenticatedUserName = createSelector(selectAuth, (auth) => {
  return auth.authenticatedUserName;
});

export const selectAuthLoadingStatus = createSelector(selectAuth, (auth) => {
  return auth.loadingStatus;
});
