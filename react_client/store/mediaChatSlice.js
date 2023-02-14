import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";

import WebRTCGroupChatService from "service/WebRTCGroupChatService/WebRTCGroupChatService";
import * as mediaChatEnum from "constant/enum/media-chat";

const initialState = {
  enableVideoCallingInput: true,
  videoCallingInputType: mediaChatEnum.videoCallingInputType.VIDEO_CALLING_INPUT_TYPE_NONE,

  isCalling: false,

  audioRelated: {
    isAudioEnablingAvaliable: false,
    isAudioEnabled: false,
    isAudioMutingAvaliable: false,
    isAudioMuted: true,
  },

  videoRelated: {
    isVideoEnablingAvaliable: false,
    isVideoEnabled: false,
    isVideoMutingAvaliable: false,
    isVideoMuted: true,
  },
};

export const mediaChatSlice = createSlice({
  name: "mediaChat",
  initialState,
  reducers: {
    updateVideoCallingInputEnabling: {
      reducer(sliceState, action) {
        sliceState.enableVideoCallingInput = action.payload;
      },
    },

    updateVideoCallingInputType: {
      reducer(sliceState, action) {
        sliceState.videoCallingInputType = action.payload;
      },
    },

    updateIsCalling: {
      reducer(sliceState, action) {
        sliceState.isCalling = action.payload;
      },
    },

    // audio related
    updateAudioEnablingAvaliable: {
      reducer(sliceState, action) {
        sliceState.audioRelated.isAudioEnablingAvaliable = action.payload;
      },
    },
    updateAudioEnabling: {
      reducer(sliceState, action) {
        sliceState.audioRelated.isAudioEnabled = action.payload;
      },
    },
    updateAudioMutingAvaliable: {
      reducer(sliceState, action) {
        sliceState.audioRelated.isAudioMutingAvaliable = action.payload;
      },
    },
    updateAudioMuting: {
      reducer(sliceState, action) {
        sliceState.audioRelated.isAudioMuted = action.payload;
      },
    },

    // video related
    updateVideoEnablingAvaliable: {
      reducer(sliceState, action) {
        sliceState.videoRelated.isVideoEnablingAvaliable = action.payload;
      },
    },
    updateVideoEnabling: {
      reducer(sliceState, action) {
        sliceState.videoRelated.isVideoEnabled = action.payload;
      },
    },
    updateVideoMutingAvaliable: {
      reducer(sliceState, action) {
        sliceState.videoRelated.isVideoMutingAvaliable = action.payload;
      },
    },
    updateVideoMuting: {
      reducer(sliceState, action) {
        sliceState.videoRelated.isVideoMuted = action.payload;
      },
    },

    //reset
    reset: {
      reducer(sliceState, action) {
        return initialState;
      },
    },
  },
});

/* Thunk action creator */

export const startCalling = createAsyncThunk("mediaChat/startCalling", async (_, thunkAPI) => {
  const sliceState = selectMediaChat(thunkAPI.getState());

  const enableVideoCallingInput = sliceState.enableVideoCallingInput;
  const videoCallingInputType = sliceState.videoCallingInputType;

  const callingInputTypes = [
    WebRTCGroupChatService.callingInputTypeEnum.CALLING_INPUT_TYPE_AUDIO_MICROPHONE,
  ];

  if (enableVideoCallingInput) {
    switch (videoCallingInputType) {
      case mediaChatEnum.videoCallingInputType.VIDEO_CALLING_INPUT_TYPE_CAMERA:
        {
          callingInputTypes.push(
            WebRTCGroupChatService.callingInputTypeEnum.CALLING_INPUT_TYPE_VIDEO_CAMERA
          );
        }
        break;
      case mediaChatEnum.videoCallingInputType.VIDEO_CALLING_INPUT_TYPE_SCREEN:
        {
          callingInputTypes.push(
            WebRTCGroupChatService.callingInputTypeEnum.CALLING_INPUT_TYPE_VIDEO_SCREEN
          );
          callingInputTypes.push(
            WebRTCGroupChatService.callingInputTypeEnum.CALLING_INPUT_TYPE_AUDIO_SCREEN
          );
        }
        break;
      case mediaChatEnum.videoCallingInputType.VIDEO_CALLING_INPUT_TYPE_NONE:
        break;
      default:
        break;
    }
  }

  WebRTCGroupChatService.applyCallingInputTypes(callingInputTypes);
  WebRTCGroupChatService.startCalling();
});

export const hangUpCalling = createAsyncThunk("mediaChat/hangUpCalling", async () => {
  WebRTCGroupChatService.hangUpCalling();
});

export const toggleAudioEnabling = createAsyncThunk(
  "mediaChat/toggleAudioEnabling",
  async (_, thunkAPI) => {
    const sliceState = selectMediaChat(thunkAPI.getState());
    const isCalling = sliceState.isCalling;
    const isAudioEnablingAvaliable = sliceState.audioRelated.isAudioEnablingAvaliable;
    if (isCalling && isAudioEnablingAvaliable) {
      const curEnabled = WebRTCGroupChatService.localMicEnabled;
      WebRTCGroupChatService.localMicEnabled = !curEnabled;
      thunkAPI.dispatch(updateAudioEnabling(WebRTCGroupChatService.localMicEnabled));
    }
  }
);

export const toggleAudioMuting = createAsyncThunk(
  "mediaChat/toggleAudioMuting",
  async (_, thunkAPI) => {
    const sliceState = selectMediaChat(thunkAPI.getState());
    const isCalling = sliceState.isCalling;
    const isAudioMutingAvaliable = sliceState.audioRelated.isAudioMutingAvaliable;
    if (isCalling && isAudioMutingAvaliable) {
      const curMuted = WebRTCGroupChatService.localMicMuted;
      WebRTCGroupChatService.localMicMuted = !curMuted;
      thunkAPI.dispatch(updateAudioMuting(WebRTCGroupChatService.localMicMuted));
    }
  }
);

export const toggleVideoEnabling = createAsyncThunk(
  "mediaChat/toggleVideoEnabling",
  async (_, thunkAPI) => {
    const sliceState = selectMediaChat(thunkAPI.getState());
    const isCalling = sliceState.isCalling;
    const isVideoEnablingAvaliable = sliceState.videoRelated.isVideoEnablingAvaliable;
    if (isCalling && isVideoEnablingAvaliable) {
      const curEnabled = WebRTCGroupChatService.localCameraEnabled;
      WebRTCGroupChatService.localCameraEnabled = !curEnabled;
      thunkAPI.dispatch(updateVideoEnabling(WebRTCGroupChatService.localCameraEnabled));
    }
  }
);

export const toggleVideoMuting = createAsyncThunk(
  "mediaChat/toggleVideoMuting",
  async (_, thunkAPI) => {
    const sliceState = selectMediaChat(thunkAPI.getState());
    const isCalling = sliceState.isCalling;
    const isVideoMutingAvaliable = sliceState.videoRelated.isVideoMutingAvaliable;
    if (isCalling && isVideoMutingAvaliable) {
      const curMuted = WebRTCGroupChatService.localCameraMuted;
      WebRTCGroupChatService.localCameraMuted = !curMuted;
      thunkAPI.dispatch(updateVideoMuting(WebRTCGroupChatService.localCameraMuted));
    }
  }
);

/* Reducer */

export default mediaChatSlice.reducer;

/* Action Creator */

export const {
  updateVideoCallingInputEnabling,
  updateVideoCallingInputType,
  updateIsCalling,
  updateAudioEnablingAvaliable,
  updateAudioEnabling,
  updateAudioMutingAvaliable,
  updateAudioMuting,

  updateVideoEnablingAvaliable,
  updateVideoEnabling,
  updateVideoMutingAvaliable,
  updateVideoMuting,
  reset,
} = mediaChatSlice.actions;

/* Selector */

export const selectMediaChat = (state) => state.mediaChat;

export const selectEnableVideoCallingInput = createSelector(selectMediaChat, (mediaChat) => {
  return mediaChat.enableVideoCallingInput;
});

export const selectVideoCallingInputType = createSelector(selectMediaChat, (mediaChat) => {
  return mediaChat.videoCallingInputType;
});

export const selectIsCalling = createSelector(selectMediaChat, (mediaChat) => {
  return mediaChat.isCalling;
});

export const selectAudioRelated = createSelector(selectMediaChat, (mediaChat) => {
  return mediaChat.audioRelated;
});

export const selectVideoRelated = createSelector(selectMediaChat, (mediaChat) => {
  return mediaChat.videoRelated;
});
