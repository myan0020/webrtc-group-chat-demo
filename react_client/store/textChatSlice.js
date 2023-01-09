import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";

import WebRTCGroupChatService from "../service/WebRTCGroupChatService/WebRTCGroupChatService";
import { selectAuth } from "./authSlice";

export const requestStatus = {
  idle: "idle",
  loading: "loading",
  succeeded: "succeeded",
  failed: "failed",
};

const initialState = {
  requestStatus: requestStatus.idle,
  textMessages: {},
};

export const textChatSlice = createSlice({
  name: "textChat",
  initialState,
  reducers: {
    addTextMessage: {
      reducer(sliceState, action) {
        Object.values(sliceState.textMessages).forEach((textMessage) => {
          textMessage.isNew = !textMessage.isRead;
        });

        sliceState.textMessages[action.payload.id] = action.payload;
      },
    },
    readAllTextMessages: {
      reducer(sliceState, action) {
        Object.values(sliceState.textMessages).forEach((textMessage) => {
          textMessage.isRead = true;
        });
      },
    },
    reset: {
      reducer(sliceState, action) {
        return initialState;
      },
    },

    // extraReducers: (builder) => {
    //   builder
    //     .addCase(sendTextMessage.fulfilled, (sliceState, action) => {
    //       sliceState.entites[action.payload.id] = action.payload;
    //     })
    //     .addCase(receiveTextMessage.fulfilled, (sliceState, action) => {
    //       sliceState.entites[action.payload.id] = action.payload;
    //     });
    // },
  },
});

/* Thunk action creator */

export const sendTextMessage = createAsyncThunk(
  "textChat/sendTextMessage",
  async (text, thunkAPI) => {
    WebRTCGroupChatService.sendChatMessageToAllPeer(text);

    const { authenticatedUserId, authenticatedUserName } = selectAuth(thunkAPI.getState());
    const timestamp = (new Date()).getTime();
    const id = `${authenticatedUserId}-${timestamp}`;
    const textMessage = {
      id,
      timestamp,
      userId: authenticatedUserId,
      userName: authenticatedUserName,
      isLocalSender: true,
      text: text,
      isRead: true,
      isNew: false,
    };

    thunkAPI.dispatch(addTextMessage(textMessage));
  }
);

export const receiveTextMessage = createAsyncThunk(
  "textChat/receiveTextMessage",
  async (message, thunkAPI) => {
    const defaultMessage = {
      userId: "unknown user id",
      userName: "unknown user name",
      text: "unknown message",
    };
    if (message && typeof message.peerId === "string") {
      defaultMessage.userId = message.peerId;
    }
    if (message && typeof message.peerName === "string") {
      defaultMessage.userName = message.peerName;
    }
    if (message && typeof message.text === "string") {
      defaultMessage.text = message.text;
    }

    const timestamp = (new Date()).getTime();
    const id = `${defaultMessage.userId}-${timestamp}`;
    const textMessage = {
      id,
      timestamp,
      userId: defaultMessage.userId,
      userName: defaultMessage.userName,
      isLocalSender: false,
      text: defaultMessage.text,
      isRead: false,
      isNew: true,
    };

    thunkAPI.dispatch(addTextMessage(textMessage));
  }
);

/* Reducer */

export default textChatSlice.reducer;

/* Action Creator */

export const { addTextMessage, readAllTextMessages, reset } = textChatSlice.actions;

/* Selector */

export const selectAllTextMessages = (state) => state.textChat.textMessages;

export const selectUnreadTextMessageCount = createSelector(
  selectAllTextMessages,
  (textMessages) => {
    return Object.values(textMessages).filter(textMessage => !textMessage.isRead).length;
  }
);
