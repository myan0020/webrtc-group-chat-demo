const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const websocketMap = require("./sessionController").websocketMap;
const rooms = require("./groupChatRoomController").rooms;
const userRoomMap = require("./groupChatRoomController").userRoomMap;
const GroupChatRoom = require("../models/groupChatRoom");
const signaling = require("../signaling/signaling");
const signalTypeEnum = signaling.typeEnum;
const findSignalTypeNameByTypeValue = signaling.findTypeNameByTypeValue;
const sendSerializedSignalThroughWebsocket = signaling.sendThroughWebsocket;
const sessionParser = require("./sessionController").sessionParser;
const authenticatedUserIds = require("./sessionController").authenticatedUserIds;
const chalk = require("chalk");

const pingInterval = 30 * 1000;

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", function (ws, request, client) {
  handleWebSocketConnection(ws, request.session, websocketMap);
});

const pingIntervalID = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      // ws.terminate();
      return;
    }
    ws.isAlive = false;
    sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.PING);
  });
}, pingInterval);
wss.on("close", function close() {
  clearInterval(pingIntervalID);
});

exports.handleUpgrade = (request, socket, head) => {
  console.log(`[${chalk.green`HTTP`}] heard ${chalk.green`websocket upgrade`} event`);

  const pathname = request.url;

  if (pathname === "/") {
    sessionParser(request, {}, function next() {
      if (!authenticatedUserIds.has(request.session.userId)) {
        console.log(
          `[${chalk.yellow`HTTP`}] ${chalk.yellow`websocket upgrade`} event ${chalk.yellow`ignored`} beacause of the unauthorized id(${
            request.session.userId
          })`
        );

        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, function (ws) {
        console.log(
          `[${chalk.green`HTTP`}] ${chalk.green`websocket upgrade`} event has passed checking, will emit a websocket ${chalk.yellow`connection`} event`
        );

        wss.emit("connection", ws, request);
      });
    });
  } else {
    console.log(
      `[${chalk.yellow`HTTP`}] ${chalk.yellow`websocket upgrade`} event ${chalk.yellow`ignored`} beacause of the wrong path(${pathname})`
    );

    socket.destroy();
    return;
  }
};

const handleWebSocketConnection = (ws, session, websocketMap) => {
  if (!ws || !session || !websocketMap) {
    console.log(`${chalk.red`[WebSocket] unexpected connection event`}`);
    return;
  }

  const sessionUserName = session.username;
  const sessionUserId = session.userId;

  console.log(
    `[${chalk.green`WebSocket`}] ${chalk.green`connection`} event ${chalk.blue`from`} a user of a name(${chalk.green`${
      sessionUserName ? sessionUserName : "unknown"
    }`})`
  );

  if (!sessionUserId || !sessionUserName) {
    return;
  }

  websocketMap.set(sessionUserId, ws);

  ws.userId = sessionUserId;
  ws.username = sessionUserName;
  ws.isAlive = true;

  ws.on("message", (data) => {
    if (!authenticatedUserIds.has(sessionUserId)) {
      return;
    }
    handleWebSocketMessage(ws, sessionUserName, sessionUserId, data);
  });
  ws.on("close", (code, reason) => {
    handleWebSocketClose(code, reason, ws, sessionUserName, sessionUserId);
  });
};

const handleWebSocketMessage = (ws, sessionUserName, sessionUserId, data) => {
  const parsedMessage = JSON.parse(data);
  const type = parsedMessage.type;
  const payload = parsedMessage.payload;

  const signalTypeName = findSignalTypeNameByTypeValue(type);
  console.log(
    `[${chalk.green`WebSocket`}] ${chalk.green`${signalTypeName}`} signal msg ${chalk.blue`from`} a user(${chalk.green`${sessionUserId}`}) of a name(${chalk.green`${
      sessionUserName ? sessionUserName : "unknown"
    }`})`
  );

  switch (type) {
    case signalTypeEnum.PONG: {
      handlePong(ws, sessionUserId, sessionUserName);
      break;
    }
    case signalTypeEnum.CREATE_ROOM: {
      handleCreateRoom(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalTypeEnum.JOIN_ROOM: {
      handleJoinRoom(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalTypeEnum.LEAVE_ROOM: {
      handleLeaveRoom(ws, sessionUserId, sessionUserName);
      break;
    }
    case signalTypeEnum.WEBRTC_NEW_PASSTHROUGH: {
      handleWebRTCNewPassthrough(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    default:
      break;
  }
};

const handleWebSocketClose = (code, reason, ws, sessionUserName, sessionUserId) => {
  console.log(
    `[${chalk.green`WebSocket`}] heard ${chalk.green`close`} event (code: ${chalk.green`${
      code ? code : "unknown close code"
    }`}, reason: ${chalk.green`${
      reason ? reason : "unknown close reason"
    }`}) ${chalk.blue`from`} the user of a name(${chalk.green`${sessionUserName}`})`
  );

  websocketMap.delete(sessionUserId);
};

const handlePong = (ws, sessionUserId, sessionUserName) => {
  if (ws.isAlive) {
    // ignore it when received a 'PONG' without ever sending a 'PING'
    return;
  }
  ws.isAlive = true;
};

const handleCreateRoom = (ws, sessionUserName, sessionUserId, payload) => {
  const roomId = uuidv4();
  const room = new GroupChatRoom(roomId, payload.roomName);
  room.addParticipant(sessionUserId, sessionUserName);
  rooms[roomId] = room;
  //
  // When a new GroupChatRoom is created,
  // broadcast the latest rooms info to each client
  //
  websocketMap.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.UPDATE_ROOMS, {
        rooms: rooms,
      });
    }
  });
  //
  // after broadcasting, make the client
  // who creates the new GroupChatRoom to join it first right now
  //
  userRoomMap.set(sessionUserId, roomId);
  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.JOIN_ROOM_SUCCESS, {
    roomId: room.id,
    roomName: room.name,
  });
};

const handleJoinRoom = (ws, sessionUserName, sessionUserId, payload) => {
  const joinedRoomId = payload.roomId;
  const joinedRoom = rooms[joinedRoomId];
  if (!joinedRoom) return;

  joinedRoom.addParticipant(sessionUserId, sessionUserName);
  userRoomMap.set(sessionUserId, joinedRoomId);

  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.JOIN_ROOM_SUCCESS, {
    roomId: joinedRoom.id,
    roomName: joinedRoom.name,
  });

  if (joinedRoom.participants.size <= 1) {
    return;
  }

  const otherParticipantUserContainer = {};

  // notify others who are already in the joined room
  joinedRoom.participants.forEach(({ name: participantUserName }, participantUserId) => {
    if (participantUserId !== sessionUserId) {
      const othersWebsocket = websocketMap.get(participantUserId);
      sendSerializedSignalThroughWebsocket(othersWebsocket, signalTypeEnum.WEBRTC_NEW_PEER_ARIVAL, {
        userId: sessionUserId,
        userName: sessionUserName,
        isPolite: false,
      });
      otherParticipantUserContainer[participantUserId] = participantUserName;
    }
  });

  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.WEBRTC_NEW_PEER_ARIVAL, {
    userContainer: otherParticipantUserContainer,
    isPolite: true,
  });
};

const handleLeaveRoom = (ws, sessionUserId, sessionUserName) => {
  const leftRoomId = userRoomMap.get(sessionUserId);
  const leftRoom = rooms[leftRoomId];

  if (!leftRoom) {
    console.log(
      `[${chalk.yellow`WebSocket`}] handleLeaveRoom failed for the user of a name(${chalk.yellow`${
        sessionUserName ? sessionUserName : "unknown"
      }`}), because left room not existed`
    );
    return;
  }

  userRoomMap.delete(sessionUserId);
  leftRoom.deleteParticipant(sessionUserId);
  sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.LEAVE_ROOM_SUCCESS, {
    roomId: leftRoomId,
    roomName: leftRoom.name,
    userId: sessionUserId,
  });

  leftRoom.participants.forEach((_, participantUserId) => {
    if (participantUserId !== sessionUserId) {
      const otherWebsocket = websocketMap.get(participantUserId);
      sendSerializedSignalThroughWebsocket(otherWebsocket, signalTypeEnum.WEBRTC_NEW_PEER_LEAVE, {
        userId: sessionUserId,
      });
    }
  });

  //
  // If this 'leftRoom' become an empty room, automatically delete it
  // and notify all authenticated clients
  //
  if (leftRoom.participants.size === 0) {
    delete rooms[leftRoomId];
    console.log(
      `[${chalk.green`WebSocket`}] ${chalk.green`deleted`} a room(id:${chalk.green`${leftRoom.id}`}, name:${chalk.green`${leftRoom.name}`}), because of its participants size(${chalk.green`${leftRoom.participantsSize}`})`
    );
    websocketMap.forEach((ws, _) => {
      if (ws.readyState === WebSocket.OPEN) {
        sendSerializedSignalThroughWebsocket(ws, signalTypeEnum.UPDATE_ROOMS, {
          rooms: rooms,
        });
      }
    });
  }
};

const handleWebRTCNewPassthrough = (ws, sessionUserName, sessionUserId, payload) => {
  if (!userRoomMap.has(sessionUserId) || !payload.to) return;
  const websocketToPassThrough = websocketMap.get(payload.to);
  const { sdp, iceCandidate } = payload;

  if ((sdp || iceCandidate) && websocketToPassThrough) {
    console.log(
      `[${chalk.green`WebSocket`}] ${chalk.green`WEBRTC_NEW_PASSTHROUGH`} signal msg of type ${chalk.green`${
        sdp && iceCandidate
          ? "unexpected payload"
          : sdp
          ? sdp.type
          : iceCandidate
          ? "ICE"
          : "unknown"
      }`} ${chalk.blue`from`} the user of a name(${chalk.green`${sessionUserName}`}) ${chalk.blue`to`} the user of a name(${chalk.green`${
        websocketToPassThrough.username ? websocketToPassThrough.username : "unknown"
      }`})`
    );
    sendSerializedSignalThroughWebsocket(
      websocketToPassThrough,
      signalTypeEnum.WEBRTC_NEW_PASSTHROUGH,
      {
        ...payload,
        from: sessionUserId,
      }
    );
  }
};

exports.handleLeaveRoom = handleLeaveRoom;
