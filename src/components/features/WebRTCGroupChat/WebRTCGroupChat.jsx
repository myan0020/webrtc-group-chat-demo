import React, { useEffect, useState } from "react";

import WebRTCGroupChatHelper from "./WebRTCGroupChatHelper.js";
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

  /**
   * Side Effects
   */

  // hook 13: authentication
  useEffect(() => {
    WebRTCGroupChatHelper.onLoginInSuccess((payload) => {
      const authenticatedUsername = payload.username;
      if (authenticatedUsername.length > 0) {
        setIsLogin(true);
        setAuthenticatedUsername(authenticatedUsername);
      }
    });
    WebRTCGroupChatHelper.onLogoutInSuccess(() => {
      setIsLogin(false);
      setJoinedRoomId("");
      setRooms({});
      setAuthenticatedUsername("");
    });
  }, []);

  // hook 14: chat room actions
  useEffect(() => {
    WebRTCGroupChatHelper.onRoomsInfoUpdated((payload) => {
      const rooms = payload.rooms;
      if (rooms) {
        setRooms(rooms);
      }
    });
    WebRTCGroupChatHelper.onJoinRoomInSuccess((payload) => {
      const roomId = payload.roomId;
      const roomName = payload.roomName;
      if (roomId.length > 0 && roomName.length > 0) {
        setJoinedRoomId(roomId);
      }
    });
    WebRTCGroupChatHelper.onLeaveRoomInSuccess((payload) => {
      setJoinedRoomId("");
    });
  }, []);

  // hook 15: media calling state
  useEffect(() => {
    WebRTCGroupChatHelper.onWebRTCCallingStateChanged((isCalling) => {
      setIsCalling(isCalling);
    });
  }, []);

  // hook 16: WebRTC media streams
  useEffect(() => {
    WebRTCGroupChatHelper.onLocalMediaStreamChanged((mediaStream) => {
      setLocalMediaStream(mediaStream);

      setIsMicEnabled(WebRTCGroupChatHelper.localMicEnabled);
      setIsCameraEnabled(WebRTCGroupChatHelper.localCameraEnabled);
    });
    WebRTCGroupChatHelper.onPeerMediaStreamMapChanged(
      (peerStreamsMap) => {
        console.log(
          `onPeerMediaStreamMapChanged called with peer stream map size ${peerStreamsMap.size}`
        );
        const map = new Map(peerStreamsMap);
        setPeerMediaStreamsMap(map);
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
      WebRTCGroupChatHelper.login(inputUserName);
      return;
    }
    WebRTCGroupChatHelper.logout();
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
    WebRTCGroupChatHelper.login(inputUserName);
  };

  // click to create a new room
  const onCreateNewRoomClick = (e) => {
    if (!inputRoomName.length > 0 || joinedRoomId.length > 0) return;
    WebRTCGroupChatHelper.createNewRoom(inputRoomName);
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
    WebRTCGroupChatHelper.joinRoom(selectedRoomId);
  };

  // click to leave the current room
  const onLeaveFromCurRoomClick = (e) => {
    WebRTCGroupChatHelper.leaveRoom();
  };

  // click to start calling
  const onStartMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatHelper.startCalling();
    }
  };

  // click to start calling
  const onHangUpMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatHelper.hangUpCalling();
    }
  };

  // click to mute
  const onToggleMicClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling) {
      const curEnabled = WebRTCGroupChatHelper.localMicEnabled;
      WebRTCGroupChatHelper.localMicEnabled = !curEnabled;
      setIsMicEnabled(!curEnabled);
    }
  };

  // click to mute
  const onToggleCameraClick = (e) => {
    if (joinedRoomId.length > 0 && isCalling) {
      const curEnabled = WebRTCGroupChatHelper.localCameraEnabled;
      WebRTCGroupChatHelper.localCameraEnabled = !curEnabled;
      setIsCameraEnabled(!curEnabled);
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
  const localVideo = isCalling ? (
    <>
      <div>Check Local Video</div>
      <div>
        <VideoList
          mediaStreamsMap={new Map([["local", localMediaStream]])}
        />
      </div>
    </>
  ) : (
    <></>
  );
  const peerVideoList = isCalling ? (
    <div>
      <div>Check Peer Video List</div>
      <div>
        <VideoList mediaStreamsMap={peerMediaStreamsMap} />
      </div>
    </div>
  ) : (
    <></>
  );

  // muting
  const toggleMicButtonRendering = (
    <div>
      <button
        onClick={onToggleMicClick}
        className={style.button}
      >
        {isMicEnabled ? "Disable Mic" : "Enable Mic"}
      </button>
    </div>
  );
  const toggleCameraButtonRendering = (
    <div>
      <button
        onClick={onToggleCameraClick}
        className={style.button}
      >
        {isCameraEnabled ? "Disable Camera" : "Enable Camera"}
      </button>
    </div>
  );

  return (
    <div
      id='rtc'
      className={style.messageWrapper}
    >
      <p>Web Socket + WebRTC Group Chat Client</p>
      {loginoutBlockRendered}

      {localVideo}
      {peerVideoList}

      {isCalling && toggleMicButtonRendering}
      {isCalling && toggleCameraButtonRendering}
    </div>
  );
}
