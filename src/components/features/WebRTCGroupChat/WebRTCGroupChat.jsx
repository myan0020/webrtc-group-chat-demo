import React, { useEffect, useState, useRef } from "react";

import WebRTCGroupChatService from "./WebRTCGroupChatService.js";
import style from "./WebRTCGroupChat.module.css";
// import { map } from "core-js/core/array";

function VideoContaniner({ mediaStreamsMap }) {
  // const [mediaStreamsMap, setMediaStreamsMap] = useState(mediaStreamsMap);

  // const videoArrSize = mediaStreamsMap.size;

  // let videos = [];
  // for (let i = 0; i < videoArrSize; i++) {
  //   const videoDom = docume
  //   const video = (
  //     <video
  //       autoPlay
  //       // id={"videoLocal"}
  //       className={style.videoContent}
  //       // ref={localVideoElementRef}
  //       srcObject={}
  //     />
  //   );
  //   videos.push();
  // }
  // mediaStreamsMap.forEach((mediaStream, peerId) => {});

  return (
    <div
      // autoPlay
      id={"videoContainer"}
      // className={style.videoContentLocal}
      // ref={localVideoElementRef}
    />
  );
}

export default function WebRTCGroupChat() {
  //
  // State Definitions
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
  // hook 8
  const [localMediaStream, setLocalMediaStream] = useState();
  // 9
  const [peerMediaStreamsMap, setPeerMediaStreamsMap] = useState(new Map());
  // hook 10
  const [isCalling, setIsCalling] = useState(false);

  // hook ???
  const localVideoElementRef = useRef(null);
  const remoteVideoElement01Ref = useRef(null);
  const remoteVideoElement02Ref = useRef(null);
  const remoteElements = [remoteVideoElement01Ref, remoteVideoElement02Ref];
  //
  // Ref Definitions
  //
  // hook 10
  // const joinedRoomIdRef = useRef(joinedRoomId);
  // // hook 10
  // const peerConnectionRef = useRef(newPeerConnection);

  // joinedRoomIdRef.current = joinedRoomId;

  // newPeerConnectionRef.current = newPeerConnection;

  //
  // Side Effects
  //
  // hook 12

  /**
   * Authentication
   */

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

  /**
   * Chat room information
   */

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

  /**
   * WebRTC media streams
   */

  useEffect(() => {
    WebRTCGroupChatService.onLocalMediaStreamChanged((mediaStream) => {
      // window.videoLocalSrc = mediaStream;
      setLocalMediaStream(mediaStream);
    });

    WebRTCGroupChatService.onPeerMediaStreamMapChanged((peerStreamsMap) => {
      console.log(`onPeerMediaStreamMapChanged called with peer stream map size ${peerStreamsMap.size}`)
      const map = new Map(peerStreamsMap)
      // const curPeerMediaStreams = Array.from(peerMediaStreamMap.values());
      setPeerMediaStreamsMap(map);
    });
  }, []);
  useEffect(() => {
    if (!localVideoElementRef) {
    } else if (!localMediaStream) {
      const videoElement = localVideoElementRef.current;
      if (!videoElement) return;
      const srcObject = videoElement.srcObject;
      if (!srcObject) return;
      localVideoElementRef.current.srcObject
        .getVideoTracks()
        .forEach((track) => {
          track.stop();
          localVideoElementRef.current.srcObject.removeTrack(track);
        });
      Ï;
    } else if (localMediaStream) {
      const videoElement = localVideoElementRef.current;
      if (!videoElement) return;
      videoElement.srcObject = localMediaStream;
    } else {
    }
  }, [localMediaStream]);
  useEffect(() => {
    console.log(`new peerMediaStreamsMap size is ${peerMediaStreamsMap.size}`)
    const activePeerMediaSize = peerMediaStreamsMap.size;
    const peerMediaStreams = Array.from(peerMediaStreamsMap.values())
    if (activePeerMediaSize < remoteElements.count) {
    }
    let remoteEleIndex = 0;
    // let displayingMediaStreamIdSet = new Set()

    for (let index = 0; index < remoteElements.length; index ++) {
      const remoteVideoElement = remoteElements[remoteEleIndex].current;
      if (!remoteVideoElement || !remoteVideoElement.srcObject) continue;
      
      // remoteVideoElement.srcObject.getVideoTracks().forEach((track) => {
      //   track.stop();
      //   remoteVideoElement.srcObject.removeTrack(track);
      // });
      remoteVideoElement.srcObject = null
    }

    for (remoteEleIndex = 0; remoteEleIndex < remoteElements.length; remoteEleIndex ++) {
      const remoteVideoElement = remoteElements[remoteEleIndex].current;
      if (!remoteVideoElement) continue;
      if (remoteEleIndex < peerMediaStreams.length) {


        // displayingMediaStreamIdSet.add(peerMediaStreams[remoteEleIndex].id)
        remoteVideoElement.srcObject = peerMediaStreams[remoteEleIndex];
      } else {
        // remoteElements[remoteEleIndex] = null;
        // if (remoteVideoElement.srcObject && !displayingMediaStreamIdSet.has(remoteVideoElement.srcObject.id)) {
        //   remoteVideoElement.srcObject.getVideoTracks().forEach((track) => {
        //     track.stop();
        //     remoteVideoElement.srcObject.removeTrack(track);
        //   });
        // }
      }
    }
    
      

    
        

    // peerMediaStreams.map((mediaStream, index) => {
    //   remoteElements[index].current.srcObject = mediaStream;
    // })
  }, [peerMediaStreamsMap]);

  /**
   * WebRTC connection
   */

  useEffect(() => {
    WebRTCGroupChatService.onWebRTCCallingStateChanged((isCalling) => {
      setIsCalling(isCalling);
    });
  }, []);

  //
  // Event Handlers
  //
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
  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (joinedRoomId.length > 0) return;
    if (isLogin) {
      onCreateNewRoomClick()
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
      WebRTCGroupChatService.startCalling();
    }
  };
  // click to start calling
  const onHangUpMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCGroupChatService.hangUpCalling();
    }
  };

  //
  // Stateful Rendering
  //
  const roomRenderedSize = "3";
  const roomsSelectRendered = (
    <select
      size={roomRenderedSize}
      onChange={onSelectedRoomChange}
      className={style.userSelect}
    >
      {Object.keys(rooms).map((roomId) => (
        <option key={roomId} value={roomId} className={style.userOption}>
          {rooms[roomId].name}
        </option>
      ))}
    </select>
  );
  const joinLeaveButtonRendered =
    joinedRoomId.length > 0 ? (
      <button
        onClick={onLeaveFromCurRoomClick}
        type="button"
        className={style.button}
      >
        leave the current room
      </button>
    ) : (
      <button
        onClick={onJoinSelectedRoomClick}
        type="button"
        disabled={selectedRoomId.length === 0}
        className={style.button}
      >
        join the selected room
      </button>
    );
  const mediaCallingButtonRendered = isCalling ? (
    <button onClick={onHangUpMediaCallingClick} className={style.button}>
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
  const loginoutBlockRendered = !isLogin ? (
    <p>
      <label>Enter your username</label>
      <input
        placeholder="username"
        onChange={onInputNewUserNameChange}
        value={inputUserName}
        className={style.userInput}
        onKeyDown={onKeyDown}
        autoFocus
      />
      <button
        type="button"
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
          placeholder="Enter your custom room name"
          onChange={onInputNewRoomNameChange}
          value={inputRoomName}
          className={style.userInput}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <button
          type="button"
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
          type="button"
          onClick={onLoginoutClick}
          className={style.button}
        >
          logout
        </button>
      </p>
    </>
  );
  const videoBlockRendered = isCalling ? (
    <div className={style.videoWrapper} id={"videoWrapper"}>
      <video
        autoPlay
        id={"videoLocal"}
        className={style.videoContentLocal}
        ref={localVideoElementRef}
      />
      <video
        autoPlay
        id={"videoRemoteOne"}
        className={style.videoContentRemote01}
        ref={remoteVideoElement01Ref}
      />
      <video
        autoPlay
        id={"videoRemoteTwo"}
        className={style.videoContentRemote02}
        ref={remoteVideoElement02Ref}
      />
    </div>
  ) : (
    <></>
  );

  return (
    <div id="rtc" className={style.messageWrapper}>
      <p>Web Socket + WebRTC Group Chat Client</p>
      {loginoutBlockRendered}
      {videoBlockRendered}
    </div>
  );
}
