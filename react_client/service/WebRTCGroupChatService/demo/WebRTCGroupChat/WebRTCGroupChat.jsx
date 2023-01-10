import React, { useEffect, useState } from "react";

import WebRTCGroupChatService from "../../WebRTCGroupChatService.js";
import VideoList from "./VideoList.jsx";
import FileTransceiverList from "./FileTransceiverList.jsx";
import style from "./WebRTCGroupChat.module.css";

export default function WebRTCGroupChat() {
  /**
   * State Definitions
   */

  // chat room
  //
  // hook 1
  const [inputUserName, setInputUserName] = useState("user");
  // hook 2
  const [inputRoomName, setInputRoomName] = useState("room");
  // hook 3
  const [selectedRoomId, setSelectedRoomId] = useState("");
  // hook 4
  const [isLogin, setIsLogin] = useState(false);
  // hook 5
  const [rooms, setRooms] = useState({});
  // hook 6
  const [authenticatedUsername, setAuthenticatedUsername] = useState("");
  // hook 7
  const [joinedRoomId, setJoinedRoomId] = useState("");

  // user media streaming
  //
  // hook 8
  const [localMediaStream, setLocalMediaStream] = useState();
  // hook 9
  const [peerUserMediaStreamMap, setPeerUserMediaStreamMap] = useState();
  // hook 10
  const [isCalling, setIsCalling] = useState(false);
  // hook 11
  const [isAudioEnableAvaliable, setIsAudioEnableAvaliable] = useState(false);
  // hook 12
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  // hook 13
  const [isVideoEnableAvaliable, setIsVideoEnableAvaliable] = useState(false);
  // hook 14
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  // hook 15
  const [isAudioMuteAvaliable, setIsAudioMuteAvaliable] = useState(false);
  // hook 16
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  // hook 17
  const [isVideoMuteAvaliable, setIsVideoMuteAvaliable] = useState(false);
  // hook 18
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // file transceiving
  //
  // hook 19
  const [files, setFiles] = useState(null);
  // hook 20
  const [isFileSendingStatusSending, setIsFileSendingStatusSending] = useState(false);
  // hook 21
  const [fileSendingRelatedData, setFileSendingRelatedData] = useState(null);
  // hook 22
  const [fileReceivingRelatedData, setFileReceivingRelatedData] = useState(null);

  /**
   * Side Effects
   */

  // hook 23: authentication
  useEffect(() => {
    WebRTCGroupChatService.onLoginInSuccess((payload) => {
      const authenticatedUsername = payload.username;
      if (authenticatedUsername.length > 0) {
        setIsLogin(true);
        setAuthenticatedUsername(authenticatedUsername);
      }
    });
    WebRTCGroupChatService.onLogoutInSuccess(() => {
      setIsLogin(false);
      setJoinedRoomId("");
      setRooms({});
      setAuthenticatedUsername("");
    });
  }, []);

  // hook 24: chat room actions
  useEffect(() => {
    WebRTCGroupChatService.onRoomsInfoUpdated((payload) => {
      const rooms = payload.rooms;
      if (rooms) {
        setRooms(rooms);
      }
    });
    WebRTCGroupChatService.onJoinRoomInSuccess((payload) => {
      const roomId = payload.roomId;
      const roomName = payload.roomName;
      if (roomId.length > 0 && roomName.length > 0) {
        setJoinedRoomId(roomId);
      }
    });
    WebRTCGroupChatService.onLeaveRoomInSuccess((payload) => {
      setJoinedRoomId("");
    });
  }, []);

  // hook 25: media calling state
  useEffect(() => {
    WebRTCGroupChatService.onWebRTCCallingStateChanged((isCalling) => {
      setIsCalling(isCalling);
    });
  }, []);

  // hook 26: WebRTC media streams
  useEffect(() => {
    WebRTCGroupChatService.onLocalMediaStreamChanged((mediaStream) => {
      setLocalMediaStream(mediaStream);
    });
    WebRTCGroupChatService.onPeerMediaStreamMapChanged((peerUserMediaStreamMap) => {
      console.debug(
        `onPeerMediaStreamMapChanged called with peer stream map size ${
          peerUserMediaStreamMap ? peerUserMediaStreamMap.size : "unknown"
        }`
      );
      setPeerUserMediaStreamMap(peerUserMediaStreamMap);
    });
    WebRTCGroupChatService.onLocalAudioEnableAvaliableChanged((avaliable) => {
      setIsAudioEnableAvaliable(avaliable);
      setIsAudioEnabled(WebRTCGroupChatService.localMicEnabled);
    });
    WebRTCGroupChatService.onLocalVideoEnableAvaliableChanged((avaliable) => {
      setIsVideoEnableAvaliable(avaliable);
      setIsVideoEnabled(WebRTCGroupChatService.localCameraEnabled);
    });
    WebRTCGroupChatService.onLocalAudioMuteAvaliableChanged((avaliable) => {
      setIsAudioMuteAvaliable(avaliable);
      setIsAudioMuted(WebRTCGroupChatService.localMicMuted);
    });
    WebRTCGroupChatService.onLocalVideoMuteAvaliableChanged((avaliable) => {
      setIsVideoMuteAvaliable(avaliable);
      setIsVideoMuted(WebRTCGroupChatService.localCameraMuted);
    });
  }, []);

  // hook 27: file transceiving
  useEffect(() => {
    WebRTCGroupChatService.onFileSendingRelatedDataChanged(
      (fileSendingRelatedData, isFileSendingStatusSending) => {
        if (isFileSendingStatusSending !== undefined) {
          setIsFileSendingStatusSending(isFileSendingStatusSending);
        }
        setFileSendingRelatedData(fileSendingRelatedData);
      }
    );
    WebRTCGroupChatService.onFileReceivingRelatedDataChanged((fileReceivingRelatedData) => {
      setFileReceivingRelatedData(fileReceivingRelatedData);
    });
  }, []);

  /**
   * Event Handlers
   */

  // input new user name
  const onInputNewUserNameChange = (e) => {
    setInputUserName(e.target.value);
  };

  // input new room name
  const onInputNewRoomNameChange = (e) => {
    setInputRoomName(e.target.value);
  };

  // click to login or logout
  const onLoginoutClick = (e) => {
    if (!isLogin && inputUserName.length > 0) {
      WebRTCGroupChatService.login(inputUserName);
      return;
    }
    WebRTCGroupChatService.logout();
  };

  // set keyboard shortcuts
  const onKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (joinedRoomId.length > 0) return;
    if (isLogin) {
      onCreateNewRoomClick();
      return;
    }
    if (inputUserName.length === 0) return;
    WebRTCGroupChatService.login(inputUserName);
  };

  // click to create a new room
  const onCreateNewRoomClick = (e) => {
    if (!inputRoomName.length > 0 || joinedRoomId.length > 0) return;
    WebRTCGroupChatService.createNewRoom(inputRoomName);
  };

  // click to select a room
  const onSelectedRoomChange = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const roomId = e.target.options[selectedIndex].value;
    setSelectedRoomId(roomId);
  };

  // click to join the selected room
  const onJoinSelectedRoomClick = (e) => {
    if (!selectedRoomId.length > 0) return;
    WebRTCGroupChatService.joinRoom(selectedRoomId);
  };

  // click to leave the current room
  const onLeaveFromCurRoomClick = (e) => {
    WebRTCGroupChatService.leaveRoom();
  };

  // click to start calling
  const onStartMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.applyCallingConstraints({ audio: "microphone", video: "camera" });
      WebRTCGroupChatService.startCalling();
    }
  };

  // click to hang up calling
  const onHangUpMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.hangUpCalling();
    }
  };

  // click to toggle microphone enabling
  const onToggleMicEnablingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling && isAudioEnableAvaliable) {
      const curEnabled = WebRTCGroupChatService.localMicEnabled;
      WebRTCGroupChatService.localMicEnabled = !curEnabled;
      setIsAudioEnabled(!curEnabled);
    }
  };

  // click to toggle camera enabling
  const onToggleCameraEnablingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling && isVideoEnableAvaliable) {
      const curEnabled = WebRTCGroupChatService.localCameraEnabled;
      WebRTCGroupChatService.localCameraEnabled = !curEnabled;
      setIsVideoEnabled(!curEnabled);
    }
  };

  // click to toggle microphone muting
  const onToggleMicMutingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling && isAudioMuteAvaliable) {
      const curMuted = WebRTCGroupChatService.localMicMuted;
      WebRTCGroupChatService.localMicMuted = !curMuted;
      setIsAudioMuted(!curMuted);
    }
  };

  // click to toggle camera muting
  const onToggleCameraMutingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling && isVideoMuteAvaliable) {
      const curMuted = WebRTCGroupChatService.localCameraMuted;
      WebRTCGroupChatService.localCameraMuted = !curMuted;
      setIsVideoMuted(!curMuted);
    }
  };

  // click to input files
  const onInputFilesChange = (e) => {
    const input = e.target;
    const files = input.files;
    setFiles(files);
  };

  // click to send file
  const onSendFileClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.sendFileToAllPeer(files);
    }
  };
  // click to cancel sending all files
  const onCancelAllFileSendingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.cancelAllFileSending();
    }
  };
  // click to reset all file buffers received
  const onResetAllFileBuffersReceivedClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.clearAllFileBuffersReceived();
    }
  };
  // click to clear all files received
  const onClearAllFilesReceivedClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.clearAllFilesReceived();
    }
  };

  const onSendChatMessageClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.sendChatMessageToAllPeer("This is a chat message");
    }
  };

  /**
   * Stateful Rendering
   */

  const roomRenderedSize = "3";

  // room options select rendering
  const roomsSelectRendered = (
    <select
      size={roomRenderedSize}
      onChange={onSelectedRoomChange}
      className={style.userSelect}
    >
      {Object.keys(rooms).map((roomId) => (
        <option
          key={roomId}
          value={roomId}
          className={style.userOption}
        >
          {rooms[roomId].name}
        </option>
      ))}
    </select>
  );

  // 'join' or 'leave' room rendering
  const joinLeaveButtonRendered =
    joinedRoomId.length > 0 ? (
      <button
        onClick={onLeaveFromCurRoomClick}
        type='button'
        className={style.button}
      >
        leave the current room
      </button>
    ) : (
      <button
        onClick={onJoinSelectedRoomClick}
        type='button'
        disabled={selectedRoomId.length === 0}
        className={style.button}
      >
        join the selected room
      </button>
    );

  // media calling button rendering
  const mediaCallingButtonRendered = isCalling ? (
    <button
      onClick={onHangUpMediaCallingClick}
      className={style.button}
    >
      Hang Up
    </button>
  ) : (
    <button
      onClick={onStartMediaCallingClick}
      disabled={joinedRoomId.length === 0}
      className={style.button}
    >
      Start Calling
    </button>
  );

  // login or logout rendering
  const loginoutBlockRendered = !isLogin ? (
    <p>
      <label>Enter your username</label>
      <input
        placeholder='username'
        onChange={onInputNewUserNameChange}
        value={inputUserName}
        className={style.userInput}
        onKeyDown={onKeyDown}
        autoFocus
      />
      <button
        type='button'
        onClick={onLoginoutClick}
        className={style.button}
      >
        login
      </button>
    </p>
  ) : (
    <>
      <p>Hello, {authenticatedUsername}</p>
      <p>{roomsSelectRendered}</p>
      <p>
        <input
          placeholder='Enter your custom room name'
          onChange={onInputNewRoomNameChange}
          value={inputRoomName}
          className={style.userInput}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <button
          type='button'
          onClick={onCreateNewRoomClick}
          disabled={inputRoomName.length === 0 || joinedRoomId.length > 0}
          className={style.button}
        >
          Create Room
        </button>
        {joinLeaveButtonRendered}
        {mediaCallingButtonRendered}
      </p>
      <p>
        <button
          type='button'
          onClick={onLoginoutClick}
          className={style.button}
        >
          logout
        </button>
      </p>
    </>
  );

  // video rendering
  const localVideo = localMediaStream ? (
    <>
      <div className={style.videoTitle}>Local</div>
      <VideoList mediaStreamMap={new Map([["local", localMediaStream]])} />
    </>
  ) : (
    <></>
  );
  const peerVideoList =
    peerUserMediaStreamMap && peerUserMediaStreamMap.size() > 0 ? (
      <>
        <div className={style.videoTitle}>Peers</div>
        <VideoList mediaStreamMap={peerUserMediaStreamMap.peerMap} />
      </>
    ) : (
      <></>
    );

  // enabling
  const toggleMicEnablingButtonRendering = (
    <div>
      <button
        onClick={onToggleMicEnablingClick}
        className={style.button}
        disabled={!isAudioEnableAvaliable}
      >
        {isAudioEnabled ? "Disable Mic" : "Enable Mic"}
      </button>
    </div>
  );
  const toggleCameraEnablingButtonRendering = (
    <div>
      <button
        onClick={onToggleCameraEnablingClick}
        className={style.button}
        disabled={!isVideoEnableAvaliable}
      >
        {isVideoEnabled ? "Disable Camera" : "Enable Camera"}
      </button>
    </div>
  );

  // muting
  const toggleMicMutingButtonRendering = (
    <div>
      <button
        onClick={onToggleMicMutingClick}
        className={style.button}
        disabled={!isAudioMuteAvaliable}
      >
        {isAudioMuted ? "Unmute Mic" : "Mute Mic"}
      </button>
    </div>
  );
  const toggleCameraMutingButtonRendering = (
    <div>
      <button
        onClick={onToggleCameraMutingClick}
        className={style.button}
        disabled={!isVideoMuteAvaliable}
      >
        {isVideoMuted ? "Unmute Camera" : "Mute Camera"}
      </button>
    </div>
  );

  // file transceiving
  const fileInputBlockRendering = (
    <div>
      <label
        htmlFor='fileTransfer'
        className={style.fileTransferLabel}
      >
        Choose a file to transfer:
      </label>
      <input
        type='file'
        id='fileTransfer'
        onInput={onInputFilesChange}
        className={style.fileTransferInput}
        multiple
      />
    </div>
  );
  const sendFileButtonRendering = (
    <button
      className={style.button}
      onClick={onSendFileClick}
      disabled={isFileSendingStatusSending}
    >
      Send File To All Peers
    </button>
  );
  const cancelSendingAllFileButtonRendering = (
    <button
      className={style.button}
      onClick={onCancelAllFileSendingClick}
      disabled={!isFileSendingStatusSending}
    >
      Cancel Sending All Files To All Peers
    </button>
  );
  const clearAllFileBuffersReceivedButtonRendering = (
    <button
      className={style.button}
      onClick={onResetAllFileBuffersReceivedClick}
      disabled={isFileSendingStatusSending}
    >
      Reset All File Buffers(Chunks) Received From All Peers
    </button>
  );
  const clearAllFilesReceivedButtonRendering = (
    <button
      className={style.button}
      onClick={onClearAllFilesReceivedClick}
      disabled={isFileSendingStatusSending}
    >
      Clear All Files Received From All Peers
    </button>
  );

  let fileSendingRendering;
  if (fileSendingRelatedData) {
    fileSendingRendering = <FileTransceiverList sendingRelatedData={fileSendingRelatedData} />;
  }
  let fileReceivingRendering;
  if (fileReceivingRelatedData) {
    fileReceivingRendering = (
      <FileTransceiverList receivingRelatedData={fileReceivingRelatedData} />
    );
  }

  return (
    <div
      id='rtc'
      className={style.messageWrapper}
    >
      <p>Web Socket + WebRTC Group Chat Client</p>
      {loginoutBlockRendered}

      {/* User Media Streaming */}
      {joinedRoomId.length > 0 && localVideo}
      {joinedRoomId.length > 0 && peerVideoList}
      {isCalling && toggleMicEnablingButtonRendering}
      {isCalling && toggleCameraEnablingButtonRendering}
      {isCalling && toggleMicMutingButtonRendering}
      {isCalling && toggleCameraMutingButtonRendering}

      {/* File Transceiving */}
      {joinedRoomId.length > 0 && fileInputBlockRendering}
      {joinedRoomId.length > 0 && sendFileButtonRendering}
      {joinedRoomId.length > 0 && cancelSendingAllFileButtonRendering}
      {joinedRoomId.length > 0 && clearAllFileBuffersReceivedButtonRendering}
      {joinedRoomId.length > 0 && clearAllFilesReceivedButtonRendering}
      {joinedRoomId.length > 0 && fileSendingRendering}
      {joinedRoomId.length > 0 && fileReceivingRendering}

      <button
        onClick={onSendChatMessageClick}
        className={style.button}
      >
        Send Message
      </button>
    </div>
  );
}
