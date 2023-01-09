import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";

export const fileChatSlice = createSlice({
  name: "fileChat",
  initialState: {
    // requestStatus: requestStatus.idle,
  },
  // reducers: {
  //   updateRoomList: {
  //     reducer(sliceState, action) {
  //       sliceState.roomList = action.payload;
  //     },
  //   },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchInitialRoomList.pending, (sliceState, action) => {
  //       sliceState.requestStatus = requestStatus.loading;
  //     })
  //     .addCase(fetchInitialRoomList.fulfilled, (sliceState, action) => {
  //       sliceState.requestStatus = requestStatus.idle;
  //       if (action.payload.responseStatus !== 200) {
  //         return;
  //       }
  //       sliceState.roomList = action.payload.roomList;
  //     });
  // },
});

/* Thunk action creator */

// export const clearFileMessage = createAsyncThunk(
//   "fileChat/clearFileMessage",
//   async (_, thunkAPI) => {
//     WebRTCGroupChatService.clear(text);

//     const { authenticatedUserId, authenticatedUserName } = selectAuth(thunkAPI.getState());
  

//     thunkAPI.dispatch(addTextMessage(textMessage));
//   }
// );

/* Reducer */

export default fileChatSlice.reducer;

/* Action Creator */

export const {} = fileChatSlice.actions;

/* Selector */

export const selectFileChat = (state) => state.fileChat;
