import React, { useEffect, useState, useRef } from "react";

import style from "./WebSocketClient.module.css";
import WebRTCDelegate from "./WebRTCDelegate.js";

export default function WebSocketClient({ url }) {
  //
  // State Definitions
  //
  // hook 1
  const [inputUserName, setInputUserName] = useState("");
  // hook 2
  const [inputRoomName, setInputRoomName] = useState("");
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
  // hook 9
  const [isCalling, setIsCalling] = useState(false);

  // hook ???
  const videoElementRef = useRef(null);
  // // hook 8
  // const [websocket, setWebsocket] = useState(undefined);

  // // hook 10
  // const [newPeerConnection, setNewPeerConnection] = useState();
  // // hook 10
  // const [peerConnections, setPeerConnections] = useState();
  // // hook 11
  // const [offerAskerId, setOfferAskerId] = useState("");
  // // hook 11
  // const [answerAskerId, setAnswerAskerId] = useState("");

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
    WebRTCDelegate.onLoginInSuccess((payload) => {
      const authenticatedUsername = payload.username;
      if (authenticatedUsername.length > 0) {
        setIsLogin(true);
        setAuthenticatedUsername(authenticatedUsername);
      }
    });
    WebRTCDelegate.onLogoutInSuccess(() => {
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
    WebRTCDelegate.onRoomsInfoUpdated((payload) => {
      const rooms = payload.rooms;
      if (rooms) {
        setRooms(rooms);
      }
    });
    WebRTCDelegate.onJoinRoomInSuccess((payload) => {
      const roomId = payload.roomId;
      const roomName = payload.roomName;
      if (roomId.length > 0 && roomName.length > 0) {
        setJoinedRoomId(roomId);
      }
    });
    WebRTCDelegate.onLeaveRoomInSuccess((payload) => {
      setJoinedRoomId("");
    });
  }, []);

  /**
   * WebRTC media streams
   */

  useEffect(() => {
    WebRTCDelegate.onLocalMediaStreamChanged((mediaStream) => {
      setLocalMediaStream(mediaStream);
      if (videoElementRef) {
        videoElementRef.current.srcObject = mediaStream;
      }
    });
  }, []);

  /**
   * WebRTC connection
   */

  useEffect(() => {
    WebRTCDelegate.onWebRTCCallingStateChanged((isCalling) => {
      setIsCalling(isCalling);
    });
  }, []);

  // websocket connection management
  // useEffect(() => {
  //   if (isLogin && !websocket) {
  //     const ws = new WebSocket(url);
  //     ws.addEventListener("open", function (event) {
  //       console.log("ws: websocket connected");
  //     });
  //     ws.addEventListener("message", function (event) {
  //       const parsedMessage = JSON.parse(event.data);
  //       const type = parsedMessage.type;
  //       const payload = parsedMessage.payload;

  //       switch (type) {
  //         case SignalMessageType.UPDATE_ROOMS: {
  //           const rooms = payload.rooms;
  //           if (Object.keys(rooms).length > 0) {
  //             setRooms(rooms);
  //           }
  //           break;
  //         }

  //         case SignalMessageType.JOIN_ROOM_SUCCESS: {
  //           console.log(
  //             `JOIN_ROOM_SUCCESS triggered: payload.roomId is ${payload.roomId}`
  //           );
  //           setJoinedRoomId(payload.roomId);
  //           break;
  //         }

  //         case SignalMessageType.WEBRTC_NEW_PEER: {
  //           const offerAskerId = payload.offerAskerId;
  //           if (offerAskerId) {
  //             setOfferAskerId(offerAskerId);
  //             break;
  //           }
  //           break;
  //         }

  //         case SignalMessageType.LEAVE_ROOM_SUCCESS: {
  //           const roomId = payload.roomId;
  //           console.log(
  //             `LEAVE_ROOM_SUCCESS triggered: joinedRoomId is ${joinedRoomId} &&& payload.roomId is ${roomId}`
  //           );
  //           console.log("joinedRoomIdRef:", joinedRoomIdRef.current);
  //           if (joinedRoomIdRef.current === roomId) {
  //             setJoinedRoomId("");
  //           }
  //           break;
  //         }

  //         default:
  //           break;
  //       }
  //     });
  //     ws.addEventListener("close", function (event) {
  //       console.log("ws: websocket closed");
  //     });
  //     setWebsocket(ws);
  //   } else if (!isLogin && websocket) {
  //     websocket.close();
  //     setWebsocket(undefined);
  //   }
  // }, [isLogin, websocket]);

  // hook 13
  // media stream management
  // useEffect(() => {
  //   //
  //   // the user has joined the room in success,
  //   // but his/her mediaStream hasn't been opened,
  //   // plus, he/she hasn't been asked for the connection offer
  //   if (
  //     joinedRoomId.length > 0 &&
  //     !localMediaStream &&
  //     offerAskerId.length === 0
  //   ) {
  //     // open the live mediaStream
  //     getUserLocalMedia((mediaStream) => {
  //       if (videoElementRef) {
  //         setLocalMediaStream(mediaStream);
  //         videoElementRef.current.srcObject = mediaStream;
  //       }
  //     }).catch((error) => {
  //       console.error(`When opening media stream: ${error}`);
  //     });
  //   }

  //   //
  //   // the user has joined the room in success,
  //   // and has been asked for the connection offer
  //   else if (joinedRoomId.length > 0 && offerAskerId.length > 0) {
  //     const curOfferAskerId = offerAskerId;
  //     // the local media stream is not open
  //     if (!localMediaStream) {
  //       getUserLocalMedia((mediaStream) => {
  //         if (videoElementRef) {
  //           setLocalMediaStream(mediaStream);
  //           videoElementRef.current.srcObject = mediaStream;

  //           const peerConnection = createPeerConnection(
  //             mediaStream,
  //             handleICECandidateEventCreator('toUserId', websocket),
  //             handleConnectionStateChangeEventCreator
  //           );

  //           setNewPeerConnection(peerConnection);
  //           setPeerConnections({
  //             ...peerConnections,
  //             [curOfferAskerId]: peerConnection,
  //           });
  //           setOfferAskerId("");

  //           return peerConnection.createOffer();
  //         }
  //       })
  //         .then((offer) => {
  //           handlePeerConnectionOffer(
  //             offer,
  //             newPeerConnectionRef.current,
  //             curOfferAskerId,
  //             websocket
  //           );
  //         })
  //         .catch((error) => {
  //           console.error(`When opening media stream: ${error}`);
  //         });
  //     }
  //     // the local media stream has been opened
  //     else {
  //       const peerConnection = createPeerConnection(
  //         localMediaStream,
  //         handleICECandidateEventCreator('toUserId', websocket),
  //         handleConnectionStateChangeEventCreator
  //       );

  //       peerConnection.createOffer().then((offer) => {
  //         handlePeerConnectionOffer(
  //           offer,
  //           peerConnection,
  //           curOfferAskerId,
  //           websocket
  //         );
  //       });

  //       setPeerConnections({
  //         ...peerConnections,
  //         [curOfferAskerId]: peerConnection,
  //       });
  //       setNewPeerConnection(peerConnection);
  //       setOfferAskerId("");
  //     }
  //   }
  //   //
  //   // the user has left the room in success
  //   else if (joinedRoomId.length === 0) {
  //     // but his/her media stream has is still open
  //     if (localMediaStream) {
  //       // so, stop the live mediaStream
  //       localMediaStream.getTracks().forEach(function (track) {
  //         if (track.readyState == "live") {
  //           track.stop();
  //         }
  //       });
  //       setLocalMediaStream(null);
  //     }
  //   }
  // }, [joinedRoomId, localMediaStream, offerAskerId]);

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
    if (!isLogin) {
      WebRTCDelegate.login(inputUserName);
      return;
    }
    WebRTCDelegate.logout();
  };
  // click to create a new room
  const onCreateNewRoomClick = (e) => {
    if (!inputRoomName.length > 0 || joinedRoomId.length > 0) return;
    WebRTCDelegate.createNewRoom(inputRoomName);
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
    WebRTCDelegate.joinRoom(selectedRoomId);
  };
  // click to leave the current room
  const onLeaveFromCurRoomClick = (e) => {
    WebRTCDelegate.leaveRoom(joinedRoomId);
  };
  // click to start calling
  const onStartMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCDelegate.startCalling();
    }
  };
  // click to start calling
  const onHangUpMediaCallingClick = (e) => {
    if (joinedRoomId.length > 0) {
      WebRTCDelegate.hangUpCalling();
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
  const joinLeaveButtonRendered =
    joinedRoomId.length > 0 ? (
      <button onClick={onLeaveFromCurRoomClick} type="button">
        leave the current room
      </button>
    ) : (
      <button onClick={onJoinSelectedRoomClick} type="button">
        join the selected room
      </button>
    );
  const mediaCallingButtonRendered = isCalling ? (
    <button onClick={onHangUpMediaCallingClick}>Hang Up</button>
  ) : (
    <button onClick={onStartMediaCallingClick}>Start Calling</button>
  );
  const loginoutBlockRendered = !isLogin ? (
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
  ) : (
    <>
      <p>Hello, {authenticatedUsername}</p>
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
        {mediaCallingButtonRendered}
      </p>
      <p>
        <button type="button" onClick={onLoginoutClick}>
          logout
        </button>
      </p>
    </>
  );
  const videoBlockRendered = isCalling ? (
    <div>
      <video autoPlay className={style.videoContent} ref={videoElementRef} />
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

/**
 * Util Functions
 */

// async function getUserLocalMedia(handleSuccess) {
//   const mediaStreamConstraints = {
//     video: true,
//     audio: true,
//   };
//   return navigator.mediaDevices
//     .getUserMedia(mediaStreamConstraints)
//     .then(handleSuccess);
// }

// function handleICECandidateEventCreator(toUserId, websocket) {
//   return (event) => {
//     if (event.candidate) {
//       const data = {
//         type: SignalMessageType.WEBRTC_NEW_ICE_CANDIDATE,
//         payload: {
//           iceCandidate: event.candidate,
//           userId: toUserId,
//         },
//       };
//       websocket.send(JSON.stringify(data));
//     }
//   };
// }

// function handleConnectionStateChangeEventCreator(peerConnection) {
//   return (event) => {
//     if (peerConnection.connectionState === "connected") {
//       console.log(`Peer connected !!!`);
//     }
//   };
// }

// function handlePeerConnectionOffer(
//   offer,
//   peerConnection,
//   offerAskerId,
//   websocket
// ) {
//   if (offer && peerConnection) {
//     peerConnection.setLocalDescription(offer);
//     const data = {
//       type: SignalMessageType.WEBRTC_NEW_OFFER,
//       payload: {
//         offer: offer,
//         userId: offerAskerId,
//       },
//     };
//     websocket.send(data);
//   }
// }

// function createPeerConnection(
//   mediaStream,
//   handleICECandidateEvent,
//   handleConnectionStateChangeEventCreator
// ) {
//   const peerConnection = new RTCPeerConnection();
//   mediaStream.getTracks().forEach((track) => {
//     peerConnection.addTrack(track, mediaStream);
//   });
//   peerConnection.addEventListener("icecandidate", handleICECandidateEvent);
//   peerConnection.addEventListener(
//     "connectionstatechange",
//     handleConnectionStateChangeEventCreator(peerConnection)
//   );
//   return peerConnection;
// }
