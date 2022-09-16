import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import style from "./WebSocketClient.module.css";

/**
 * This socket message types list match the same one on server side
 */

const SignalMessageType = {
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,
  CREATE_ROOM: 3,
  JOIN_ROOM: 4,
  UPDATE_ROOMS: 5,
  JOIN_ROOM_SUCCESS: 6,
  LEAVE_ROOM: 7,
  LEAVE_ROOM_SUCCESS: 8,
  SW: 9,
};

export default function WebSocketClient({ url }) {
  //
  // State Definitions
  //
  // hook 1
  const [inputUserName, setInputUserName] = useState("");
  // hook 2
  const [inputRoomName, setInputRoomName] = useState("");
  // hook 3
  const [isLogin, setIsLogin] = useState(false);
  // hook 4
  const [authorizedUsername, setAuthorizedUsername] = useState("");
  // hook 5
  const [selectedRoomId, setSelectedRoomId] = useState("");
  // hook 6
  const [joinedRoomId, setJoinedRoomId] = useState("");
  // hook 7
  const [rooms, setRooms] = useState({});
  // hook 8
  const [websocket, setWebsocket] = useState(undefined);
  // hook 9
  const [localMediaStream, setLocalMediaStream] = useState();

  // 
  // Ref Definitions
  //
  // hook 10
  const joinedRoomIdRef = useRef(joinedRoomId);
  // hook 11
  const videoElementRef = useRef(null);

  joinedRoomIdRef.current = joinedRoomId;

  //
  // Side Effects
  //
  // hook 12
  // websocket connection management
  useEffect(() => {
    if (isLogin && !websocket) {
      const ws = new WebSocket(url);
      ws.addEventListener("open", function (event) {
        console.log("ws: websocket connected");
      });
      ws.addEventListener("message", function (event) {
        const parsedMessage = JSON.parse(event.data);
        const type = parsedMessage.type;
        const payload = parsedMessage.payload;

        switch (type) {
          case SignalMessageType.UPDATE_ROOMS: {
            const rooms = payload.rooms;
            if (Object.keys(rooms).length > 0) {
              setRooms(rooms);
            }
            break;
          }
          case SignalMessageType.JOIN_ROOM_SUCCESS: {
            console.log(
              `JOIN_ROOM_SUCCESS triggered: payload.roomId is ${payload.roomId}`
            );
            setJoinedRoomId(payload.roomId);
            break;
          }
          case SignalMessageType.LEAVE_ROOM_SUCCESS: {
            const roomId = payload.roomId;
            console.log(
              `LEAVE_ROOM_SUCCESS triggered: joinedRoomId is ${joinedRoomId} &&& payload.roomId is ${roomId}`
            );
            console.log('joinedRoomIdRef:', joinedRoomIdRef.current)
            if (joinedRoomIdRef.current === roomId) {
              setJoinedRoomId("");
            }
            break;
          }
          default:
            break;
        }
      });
      ws.addEventListener("close", function (event) {
        console.log("ws: websocket closed");
      });
      setWebsocket(ws);
    } else if (!isLogin && websocket) {
      websocket.close();
      setWebsocket(undefined);
    }
  }, [isLogin, websocket]);

  // hook 13
  // media stream management
  useEffect(() => {
    if (!localMediaStream && joinedRoomId.length > 0) {
      // open the live mediaStream
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(
        (mediaStream) => {
          if (videoElementRef) {
            setLocalMediaStream(mediaStream)
            videoElementRef.current.srcObject = mediaStream;
          }
        },
        (error) => {
          console.error(`When opening media stream: ${error}`)
        }
      );
    } else if (localMediaStream && joinedRoomId.length === 0) {
      // stop the live mediaStream
      localMediaStream.getTracks().forEach(function(track) {
        if (track.readyState == 'live') {
          track.stop();
        }
      });
      setLocalMediaStream(null)
    }
  }, [joinedRoomId, localMediaStream])

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
    const config = {
      url: !isLogin ? "/login" : "/logout",
      method: "post",
      data: {
        username: inputUserName,
      },
    };
    axios(config)
      .then((response) => {
        const type = response.data.type;
        const payload = response.data.payload;
        const rooms = payload ? payload.rooms : undefined;
        const username = payload ? payload.username : "";

        switch (type) {
          case SignalMessageType.LOG_IN_SUCCESS:
            if (Object.keys(rooms).length > 0) {
              setRooms(rooms);
            }
            if (typeof username === "string") {
              setAuthorizedUsername(username);
            }
            setIsLogin(true);
            break;
          case SignalMessageType.LOG_OUT_SUCCESS:
            setRooms({});
            setAuthorizedUsername("");
            setIsLogin(false);
            break;
          default:
            break;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  // click to create a new room
  const onCreateNewRoomClick = (e) => {
    if (inputRoomName.length > 0 && websocket) {
      const message = {
        type: SignalMessageType.CREATE_ROOM,
        payload: {
          roomName: inputRoomName,
        },
      };
      websocket.send(JSON.stringify(message));
    }
  };
  // click to select a room
  const onSelectedRoomChange = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const roomId = e.target.options[selectedIndex].value;
    setSelectedRoomId(roomId);
  };
  // click to join the selected room
  const onJoinSelectedRoomClick = (e) => {
    if (selectedRoomId.length > 0 && websocket) {
      const message = {
        type: SignalMessageType.JOIN_ROOM,
        payload: {
          roomId: selectedRoomId,
        },
      };
      websocket.send(JSON.stringify(message));
    }
  };
  // click to leave the current room
  const onLeaveFromCurRoomClick = (e) => {
    if (joinedRoomId.length > 0 && websocket) {
      const message = {
        type: SignalMessageType.LEAVE_ROOM,
        payload: {
          roomId: joinedRoomId,
        },
      };
      websocket.send(JSON.stringify(message));
    }
  };

  //
  // Stateful Rendering
  //
  const roomRenderedSize = "10";
  const roomsSelectRendered = (
    <select size={roomRenderedSize} onChange={onSelectedRoomChange}>
      {Object.keys(rooms).map((roomId) => (
        <option key={roomId} value={roomId}>
          {rooms[roomId].name}
        </option>
      ))}
    </select>
  );
  const joinLeaveButtonRendered = joinedRoomId.length > 0 ?  
  (
    <button onClick={onLeaveFromCurRoomClick} type="button">
      leave the current room
    </button>
  ) : 
  (
    <button onClick={onJoinSelectedRoomClick} type="button">
      join the selected room
    </button>
  )
  ;
  const loginoutBlockRendered = !isLogin ? 
  (
    <p>
      <label>Enter your username</label>
      <input
        placeholder="username"
        onChange={onInputNewUserNameChange}
        value={inputUserName}
      />
      <button type="button" onClick={onLoginoutClick}>
        login
      </button>
    </p>
  ) : 
  (
    <>
      <p>Hello, {authorizedUsername}</p>
      <p>{roomsSelectRendered}</p>
      <p>
        <input
          placeholder="Enter your custom room name"
          onChange={onInputNewRoomNameChange}
          value={inputRoomName}
        />
        <button type="button" onClick={onCreateNewRoomClick}>
          Create Room
        </button>
        {joinLeaveButtonRendered}
      </p>
      <p>
        <button type="button" onClick={onLoginoutClick}>
          logout
        </button>
      </p>
    </>
  );
  const videoBlockRendered = joinedRoomId.length > 0 ? 
  (
    <div>
      <video autoPlay className={style.videoContent} ref={videoElementRef} />
    </div>
  ) : 
  (
    <>
    </>
  );

  return (
    <div id="rtc" className={style.messageWrapper}>
      <p>Web Socket + WebRTC Group Chat Client</p>
      {loginoutBlockRendered}
      {videoBlockRendered}
    </div>
  );
}
