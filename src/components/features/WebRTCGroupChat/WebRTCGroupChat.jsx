import React, { useEffect, useState } from "react";

import WebRTCGroupChatController from "./WebRTCGroupChatController.js";
import VideoList from "./VideoList.jsx";
import style from "./WebRTCGroupChat.module.css";

export default function WebRTCGroupChat() {
  /**
   * State Definitions
   */

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
  const [authenticatedUsername, setAuthenticatedUsername] =
    useState("");
  // hook 7
  const [joinedRoomId, setJoinedRoomId] = useState("");
  // hook 8
  const [localMediaStream, setLocalMediaStream] = useState();
  // hook 9
  const [peerMediaStreamsMap, setPeerMediaStreamsMap] = useState(
    new Map()
  );
  // hook 10
  const [isCalling, setIsCalling] = useState(false);
  // hook 11
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  // hook 12
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  // hook 13
  const [isMicMuted, setIsMicMuted] = useState(true);
  // hook 14
  const [isCameraMuted, setIsCameraMuted] = useState(true);

  // hook 14
  const [files, setFiles] = useState(null);

  /**
   * Side Effects
   */

  // hook 13: authentication
  useEffect(() => {
    WebRTCGroupChatController.onLoginInSuccess((payload) => {
      const authenticatedUsername = payload.username;
      if (authenticatedUsername.length > 0) {
        setIsLogin(true);
        setAuthenticatedUsername(authenticatedUsername);
      }
    });
    WebRTCGroupChatController.onLogoutInSuccess(() => {
      setIsLogin(false);
      setJoinedRoomId("");
      setRooms({});
      setAuthenticatedUsername("");
    });
  }, []);

  // hook 14: chat room actions
  useEffect(() => {
    WebRTCGroupChatController.onRoomsInfoUpdated((payload) => {
      const rooms = payload.rooms;
      if (rooms) {
        setRooms(rooms);
      }
    });
    WebRTCGroupChatController.onJoinRoomInSuccess((payload) => {
      const roomId = payload.roomId;
      const roomName = payload.roomName;
      if (roomId.length > 0 && roomName.length > 0) {
        setJoinedRoomId(roomId);
      }
    });
    WebRTCGroupChatController.onLeaveRoomInSuccess((payload) => {
      setJoinedRoomId("");
    });
  }, []);

  // hook 15: media calling state
  useEffect(() => {
    WebRTCGroupChatController.onWebRTCCallingStateChanged(
      (isCalling) => {
        setIsCalling(isCalling);
      }
    );
  }, []);

  // hook 16: WebRTC media streams
  useEffect(() => {
    WebRTCGroupChatController.onLocalMediaStreamChanged(
      (mediaStream) => {
        setLocalMediaStream(mediaStream);

        setIsMicEnabled(WebRTCGroupChatController.localMicEnabled);
        setIsCameraEnabled(
          WebRTCGroupChatController.localCameraEnabled
        );
      }
    );
    WebRTCGroupChatController.onPeerMediaStreamMapChanged(
      (peerStreamsMap) => {
        console.log(
          `onPeerMediaStreamMapChanged called with peer stream map size ${peerStreamsMap.size}`
        );
        const map = new Map(peerStreamsMap);
        setPeerMediaStreamsMap(map);

        // TODO: it is the temperary location where the code below is called
        setIsMicMuted(WebRTCGroupChatController.localMicMuted);
        setIsCameraMuted(WebRTCGroupChatController.localCameraMuted);
      }
    );
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
      WebRTCGroupChatController.login(inputUserName);
      return;
    }
    WebRTCGroupChatController.logout();
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
    WebRTCGroupChatController.login(inputUserName);
  };

  // click to create a new room
  const onCreateNewRoomClick = (e) => {
    if (!inputRoomName.length > 0 || joinedRoomId.length > 0) return;
    WebRTCGroupChatController.createNewRoom(inputRoomName);
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
    WebRTCGroupChatController.joinRoom(selectedRoomId);
  };

  // click to leave the current room
  const onLeaveFromCurRoomClick = (e) => {
    WebRTCGroupChatController.leaveRoom();
  };

  // click to start calling
  const onStartMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatController.startCalling();
    }
  };

  // click to start calling
  const onHangUpMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatController.hangUpCalling();
    }
  };

  // click to toggle enabling
  const onToggleMicEnablingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling) {
      const curEnabled = WebRTCGroupChatController.localMicEnabled;
      WebRTCGroupChatController.localMicEnabled = !curEnabled;
      setIsMicEnabled(!curEnabled);
    }
  };

  // click to toggle enabling
  const onToggleCameraEnablingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling) {
      const curEnabled = WebRTCGroupChatController.localCameraEnabled;
      WebRTCGroupChatController.localCameraEnabled = !curEnabled;
      setIsCameraEnabled(!curEnabled);
    }
  };

  // click to toggle muting
  const onToggleMicMutingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling) {
      const curMuted = WebRTCGroupChatController.localMicMuted;
      WebRTCGroupChatController.localMicMuted = !curMuted;
      setIsMicMuted(!curMuted);
    }
  };

  // click to toggle muting
  const onToggleCameraMutingClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling) {
      const curMuted = WebRTCGroupChatController.localCameraMuted;
      WebRTCGroupChatController.localCameraMuted = !curMuted;
      setIsCameraMuted(!curMuted);
    }
  };

  // input files
  const onInputFilesChange = (e) => {
    const input = e.target;
    const files = input.files;
    setFiles(files);
  };

  const onSendFileMetaDataClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatController.sendFileMetaDataToAllPeer(files);
    }
  };

  const onSendFileDataClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatController.sendFileDataToAllPeer(files);
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
          disabled={
            inputRoomName.length === 0 || joinedRoomId.length > 0
          }
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
  const localVideo = (
    <>
      <div>Check Local Video</div>
      <div>
        <VideoList
          mediaStreamsMap={
            localMediaStream
              ? new Map([["local", localMediaStream]])
              : new Map()
          }
        />
      </div>
    </>
  );
  const peerVideoList = (
    <div>
      <div>Check Peer Video List</div>
      <div>
        <VideoList mediaStreamsMap={peerMediaStreamsMap} />
      </div>
    </div>
  );

  // enabling
  const toggleMicEnablingButtonRendering = (
    <div>
      <button
        onClick={onToggleMicEnablingClick}
        className={style.button}
      >
        {isMicEnabled ? "Disable Mic" : "Enable Mic"}
      </button>
    </div>
  );
  const toggleCameraEnablingButtonRendering = (
    <div>
      <button
        onClick={onToggleCameraEnablingClick}
        className={style.button}
      >
        {isCameraEnabled ? "Disable Camera" : "Enable Camera"}
      </button>
    </div>
  );

  // muting
  const toggleMicMutingButtonRendering = (
    <div>
      <button
        onClick={onToggleMicMutingClick}
        className={style.button}
      >
        {isMicMuted ? "Unmute Mic" : "Mute Mic"}
      </button>
    </div>
  );
  const toggleCameraMutingButtonRendering = (
    <div>
      <button
        onClick={onToggleCameraMutingClick}
        className={style.button}
      >
        {isCameraMuted ? "Unmute Camera" : "Mute Camera"}
      </button>
    </div>
  );

  // file transfer rendering
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
        multiple
        className={style.fileTransferInput}
        onChange={onInputFilesChange}
      />
    </div>
  );
  const sendFileMetaDataButtonRendering = (
    <button
      className={style.button}
      onClick={onSendFileMetaDataClick}
    >
      Send File Meta Data To All Peers
    </button>
  );
  const sendFileDataButtonRendering = (
    <button
      className={style.button}
      onClick={onSendFileDataClick}
    >
      Send File Data To All Peers
    </button>
  );

  return (
    <div
      id='rtc'
      className={style.messageWrapper}
    >
      <p>Web Socket + WebRTC Group Chat Client</p>
      {loginoutBlockRendered}

      {joinedRoomId.length > 0 && fileInputBlockRendering}
      {joinedRoomId.length > 0 && sendFileMetaDataButtonRendering}
      {joinedRoomId.length > 0 && sendFileDataButtonRendering}

      {isCalling && localVideo}
      {isCalling && peerVideoList}

      {isCalling && toggleMicEnablingButtonRendering}
      {isCalling && toggleCameraEnablingButtonRendering}

      {isCalling && toggleMicMutingButtonRendering}
      {isCalling && toggleCameraMutingButtonRendering}
    </div>
  );
}
