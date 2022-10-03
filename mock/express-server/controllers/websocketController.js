const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const sessionMap = require("./sessionController").sessionMap;
const rooms = require("./groupChatRoomController").rooms;
const userRoomMap = require("./groupChatRoomController").userRoomMap;
const GroupChatRoom = require("../models/groupChatRoom");
const signalType = require("../signaling/signaling").typeNumber;
const sendSerializedSignalThroughWebsocket =
  require("../signaling/signaling").sendThroughWebsocket;
const sessionParser = require("./sessionController").sessionParser;
const authenticatedUserIds =
  require("./sessionController").authenticatedUserIds;
const chalk = require("chalk");

exports.handleUpgrade = (request, socket, head) => {
  sessionParser(request, {}, function next() {
    if (!authenticatedUserIds.has(request.session.userId)) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const wss = createWebSocket(request.session);

    wss.handleUpgrade(request, socket, head, function (ws) {
      console.log(
        `[WebSocket] will emit a ${chalk.yellow`connection`} event `
      );
      wss.emit("connection", ws, request);
    });
  });
};

const createWebSocket = (session) => {
  console.log(
    `[WebSocket] will be created to the user named ${chalk.green`${session.username}`}`
  );

  const wss = new WebSocket.Server({ noServer: true });
  wss.on("connection", function (ws, request) {
    handleWebSocketConnection(ws, request, sessionMap);
  });

  return wss;
};

const handleWebSocketConnection = (ws, request, sessionMap) => {
  if (!request || !request.session || !sessionMap) {
    return;
  }

  const sessionUserName = request.session.username;
  const sessionUserId = request.session.userId;

  console.log(
    `[WebSocket] ${chalk.green`connection`} event ${chalk.blue`from`} the user named ${chalk.green`${
      sessionUserName ? sessionUserName : "unknown"
    }`}`
  );

  if (!sessionUserId || !sessionUserName) {
    return;
  }

  sessionMap.set(sessionUserId, ws);
  ws.userId = sessionUserId;
  ws.username = sessionUserName;

  ws.on("message", (data) => {
    handleWebSocketMessage(ws, sessionUserName, sessionUserId, data);
  });
  ws.on("close", () => {
    handleWebSocketClose(ws, sessionUserName, sessionUserId);
  });
};

const handleWebSocketMessage = (
  ws,
  sessionUserName,
  sessionUserId,
  data
) => {
  const parsedMessage = JSON.parse(data);
  const type = parsedMessage.type;
  const payload = parsedMessage.payload;

  switch (type) {
    case signalType.CREATE_ROOM: {
      console.log(
        `[WebSocket] ${chalk.green`CREATE_ROOM`} signal msg ${chalk.blue`from`} the user named ${chalk.green`${
          sessionUserName ? sessionUserName : "unknown"
        }`}`
      );
      handleCreateRoom(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalType.JOIN_ROOM: {
      console.log(
        `[WebSocket] ${chalk.green`JOIN_ROOM`} signal msg ${chalk.blue`from`} the user named ${chalk.green`${
          sessionUserName ? sessionUserName : "unknown"
        }`}`
      );
      handleJoinRoom(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalType.LEAVE_ROOM: {
      console.log(
        `[WebSocket] ${chalk.green`LEAVE_ROOM`} signal msg ${chalk.blue`from`} the user named ${chalk.green`${
          sessionUserName ? sessionUserName : "unknown"
        }`}`
      );
      handleLeaveRoom(ws, sessionUserName, sessionUserId, payload);
      break;
    }
    case signalType.WEBRTC_NEW_PASSTHROUGH: {
      console.log(
        `[WebSocket] ${chalk.green`WEBRTC_NEW_PASSTHROUGH`} signal msg ${chalk.blue`from`} the user named ${chalk.green`${
          sessionUserName ? sessionUserName : "unknown"
        }`}`
      );
      handleWebRTCNewPassthrough(
        ws,
        sessionUserName,
        sessionUserId,
        payload
      );
      break;
    }
    default:
      break;
  }
};

const handleWebSocketClose = (ws, sessionUserName, sessionUserId) => {
  console.log(
    `[WebSocket] heard ${chalk.green`close`} event ${chalk.blue`from`} the user named ${chalk.green`${sessionUserName}`}`
  );
  sessionMap.delete(sessionUserId);
};

const handleCreateRoom = (
  ws,
  sessionUserName,
  sessionUserId,
  payload
) => {
  const roomId = uuidv4();
  const room = new GroupChatRoom(roomId, payload.roomName);
  room.addParticipant(sessionUserId, sessionUserName);
  rooms[roomId] = room;
  //
  // When a new GroupChatRoom is created,
  // broadcast the latest rooms info to each client
  //
  sessionMap.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      sendSerializedSignalThroughWebsocket(
        ws,
        signalType.UPDATE_ROOMS,
        {
          rooms: rooms,
        }
      );
    }
  });
  //
  // after broadcasting, make the client
  // who creates the new GroupChatRoom to join it first right now
  //
  userRoomMap.set(sessionUserId, roomId);
  sendSerializedSignalThroughWebsocket(
    ws,
    signalType.JOIN_ROOM_SUCCESS,
    {
      roomId: room.id,
      roomName: room.name,
    }
  );
};

const handleJoinRoom = (
  ws,
  sessionUserName,
  sessionUserId,
  payload
) => {
  const joinedRoomId = payload.roomId;
  const joinedRoom = rooms[joinedRoomId];
  if (!joinedRoom) return;

  joinedRoom.addParticipant(sessionUserId, sessionUserName);
  userRoomMap.set(sessionUserId, joinedRoomId);

  sendSerializedSignalThroughWebsocket(
    ws,
    signalType.JOIN_ROOM_SUCCESS,
    {
      roomId: joinedRoom.id,
      roomName: joinedRoom.name,
    }
  );

  if (joinedRoom.participants.size <= 1) {
    return;
  }

  const otherParticipantUserIdList = [];

  // notify others who are already in the joined room
  joinedRoom.participants.forEach((_, participantUserId) => {
    if (participantUserId !== sessionUserId) {
      const othersWebsocket = sessionMap.get(participantUserId);
      sendSerializedSignalThroughWebsocket(
        othersWebsocket,
        signalType.WEBRTC_NEW_PEER_ARIVAL,
        {
          userId: sessionUserId,
          isPolite: false,
        }
      );
      otherParticipantUserIdList.push(participantUserId);
    }
  });

  sendSerializedSignalThroughWebsocket(
    ws,
    signalType.WEBRTC_NEW_PEER_ARIVAL,
    {
      userIdList: otherParticipantUserIdList,
      isPolite: true,
    }
  );
};

const handleLeaveRoom = (
  ws,
  sessionUserName,
  sessionUserId,
  payload
) => {
  const leftRoomId = userRoomMap.get(sessionUserId);
  const leftRoom = rooms[leftRoomId];

  if (!leftRoom) {
    return;
  }

  userRoomMap.delete(sessionUserId);
  leftRoom.deleteParticipant(sessionUserId);
  sendSerializedSignalThroughWebsocket(
    ws,
    signalType.LEAVE_ROOM_SUCCESS,
    {
      roomId: leftRoomId,
      roomName: leftRoom.name,
      userId: sessionUserId,
    }
  );

  leftRoom.participants.forEach((_, participantUserId) => {
    if (participantUserId !== sessionUserId) {
      const otherWebsocket = sessionMap.get(participantUserId);
      sendSerializedSignalThroughWebsocket(
        otherWebsocket,
        signalType.WEBRTC_NEW_PEER_LEAVE,
        {
          userId: sessionUserId,
        }
      );
    }
  });

  //
  // If this 'leftRoom' become an empty room, automatically delete it
  // and notify all authenticated clients
  //
  if (leftRoom.participants.size === 0) {
    delete rooms[leftRoomId];
    sessionMap.forEach((ws, _) => {
      if (ws.readyState === WebSocket.OPEN) {
        sendSerializedSignalThroughWebsocket(
          ws,
          signalType.UPDATE_ROOMS,
          {
            rooms: rooms,
          }
        );
      }
    });
  }
};

const handleWebRTCNewPassthrough = (
  ws,
  sessionUserName,
  sessionUserId,
  payload
) => {
  if (!userRoomMap.has(sessionUserId)) return;
  const websocketToPassThrough = sessionMap.get(payload.userId);
  const { sdp, iceCandidate } = payload;

  if ((sdp || iceCandidate) && websocketToPassThrough) {
    console.log(
      `[WebSocket] ${chalk.green`WEBRTC_NEW_PASSTHROUGH`} signal msg of type ${chalk.green`${
        sdp && iceCandidate
          ? "unexpected payload"
          : sdp
          ? sdp.type
          : iceCandidate
          ? "ICE"
          : "unknown"
      }`} ${chalk.blue`from`} the user named ${chalk.green`${sessionUserName}`} ${chalk.blue`to`} the user named ${chalk.green`${
        websocketToPassThrough.username
          ? websocketToPassThrough.username
          : "unknown"
      }`}`
    );
    sendSerializedSignalThroughWebsocket(
      websocketToPassThrough,
      signalType.WEBRTC_NEW_PASSTHROUGH,
      {
        sdp,
        iceCandidate,
        from: sessionUserId,
        to: payload.userId,
      }
    );
  }
};
