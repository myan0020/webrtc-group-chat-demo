import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { fetchInitialRoomList, leaveRoom, selectRoom } from "./roomSlice";
import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";

export const requestStatus = {
  idle: "idle",
  loading: "loading",
  succeeded: "succeeded",
  failed: "failed",
};

const initialState = {
  isVerifyingAuth: false,
  authenticated: false,
  authenticatedUserName: "",
  authenticatedUserId: "",
  requestStatus: requestStatus.idle,
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
      .addCase(verifyAuthentication.pending, (sliceState, action) => {
        sliceState.isVerifyingAuth = true;
      })
      .addCase(verifyAuthentication.fulfilled, (sliceState, action) => {
        sliceState.isVerifyingAuth = false;
        const result = action.payload.result;
        if (result) {
          sliceState.authenticated = true;
          sliceState.authenticatedUserName = "verified user name";
          sliceState.authenticatedUserId = "verified user id";
        }
      })
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

export const verifyAuthentication = createAsyncThunk(
  "auth/verifyAuthentication",
  async (_, thunkAPI) => {
    const result = await new Promise((resolve) =>
      setTimeout(() => {
        resolve(true);
      }, 3000)
    );

    return {
      result: false,
    };
  }
);

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
    WebRTCGroupChatService.start();

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
