// const createError = require('http-errors');
const http = require("http");
const express = require("express");
// const path = require('path');
const { expressServerPort, webSocketServerPort } = require("../../config/url");
// const cookieParser = require('cookie-parser');
const logger = require("morgan");
const mongoose = require("mongoose");
const chalk = require("chalk");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const bodyParser = require("body-parser");
const author_controller = require("./controllers/authorController");
const video_controller = require("./controllers/videoController");

const app = express();
const httpServer = http.createServer(app);

const authenticatedUserIds = new Set();

/**
 * This signal message type list match the same one on each client side
 */

const SignalMessageType = {
  // Session singals
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,

  // Chat room singals
  CREATE_ROOM: 3,
  UPDATE_ROOMS: 4,
  JOIN_ROOM: 5,
  JOIN_ROOM_SUCCESS: 6,
  LEAVE_ROOM: 7,
  LEAVE_ROOM_SUCCESS: 8,

  // WebRTC connection singals
  WEBRTC_NEW_CALLING: 9,
  WEBRTC_NEW_PEER: 10,
  WEBRTC_NEW_OFFER: 11,
  WEBRTC_NEW_ANSWER: 12,
  WEBRTC_NEW_ICE_CANDIDATE: 13,
  WEBRTC_HANG_UP: 14,
};

const sessionMap = new Map(); // websocket session map
const rooms = {}; // chat rooms, look like { [roomId]: instanceof Room }
const userRoomMap = new Map(); 

function Room(roomId, roomName) {
  // room  related
  //
  this.id = roomId;
  this.name = roomName;

  // (normal) participant related
  //
  this.participants = new Map();
  this.addParticipant = (userId, username) => {
    const participant = {
      id: userId,
      name: username,
    };
    this.participants.set(userId, participant);
  };

  this.deleteParticipant = (userId) => {
    this.participants.delete(userId);
  };

  // stream participant related
  //
  this.streamParticipants = new Map();
  this.addStreamParticipant = (userId, username) => {
    const participant = {
      id: userId,
      name: username,
    };
    this.streamParticipants.set(userId, participant);
  };
  this.deleteStreamParticipant = (userId) => {
    delete this.streamParticipants.delete(userId);
  };
}

/**
 * ??? middleware setup
 */

app.use(logger("dev"));

/**
 * sessionParser middleware setup
 */

const sessionParser = session({
  saveUninitialized: false,
  secret: "$eCuRiTy",
  resave: false,
});

app.use(sessionParser);

/**
 * bodyParser middleware setup
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * router setup
 */

// testing paths: setup the allowed url paths for webpack-dev-server proxy
const paths = ["/hello", "/world", "/author", "/video", "/login", "/logout"];

app.post("/login", function (req, res) {
  const username = req.body.username;
  const userId = uuidv4();
  req.session.userId = userId;
  req.session.username = username;
  authenticatedUserIds.add(userId);
  res.send({
    type: SignalMessageType.LOG_IN_SUCCESS,
    payload: {
      username: username,
      userId: userId,
      rooms: rooms,
    },
  });
});

app.post("/logout", function (req, res) {
  // TODO: do some work to close the session user's WebRTC connection

  const userId = req.session.userId;
  if (userId.length > 0 && userRoomMap.get(userId)) {
    const joinedRoomId = userRoomMap.get(userId);
    rooms[joinedRoomId].deleteParticipant(userId);
    rooms[joinedRoomId].deleteStreamParticipant(userId);
  }
  req.session.destroy(function () {
    if (userId) {
      authenticatedUserIds.delete(userId);
      const ws = sessionMap.get(userId);
      if (ws) ws.close();
      sessionMap.delete(userId);
    }
    res.send({ type: SignalMessageType.LOG_OUT_SUCCESS });
  });
});

// testing path
app.use("/hello", (req, res) => {
  res.json({ hello: "A polite English greeting word" });
});

// testing path
app.use("/world", (req, res) => {
  res.send("world!");
});

// testing path: GET author information by author id
app.get("/author/:id", author_controller.author_detail);

// testing path: GET author information list
app.get("/authors", author_controller.author_list);

// testing path: GET video clip
app.get("/video_clip", video_controller.get_video_clip);

app.get("/video_hls", video_controller.get_video_hls);

/**
 * error handling middleware setup
 */

app.use(function (req, res, next) {
  next(new Error("Something Broke!"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).send(err.message);
});

/**
 * Create a WebSocket server completely detached from the HTTP server
 *
 * the user who hasn't logged in cannot cannot open the websocket connection
 */

httpServer.on("upgrade", function (request, socket, head) {
  sessionParser(request, {}, function next() {
    if (!authenticatedUserIds.has(request.session.userId)) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const wss = new WebSocket.Server({ noServer: true });

    wss.on("connection", function (ws, request) {
      // session id setup
      const sessionUserName = request.session.username;
      const sessionUserId = request.session.userId;

      sessionMap.set(sessionUserId, ws);
      ws.userId = sessionUserId;

      // handling events for each websocket connection
      ws.on("message", function (message) {
        const parsedMessage = JSON.parse(message);
        const type = parsedMessage.type;
        const payload = parsedMessage.payload;

        switch (type) {
          case SignalMessageType.CREATE_ROOM: {
            const roomId = uuidv4();
            const room = new Room(roomId, payload.roomName);
            room.addParticipant(sessionUserId, sessionUserName);
            rooms[roomId] = room;
            //
            // When a new room is created,
            // broadcast the latest rooms info to each client
            // &&
            // broadcast the latest participants info to each client in this new room
            //
            sessionMap.forEach((ws, userId) => {
              if (ws.readyState === WebSocket.OPEN) {
                const updateRoomsData = {
                  type: SignalMessageType.UPDATE_ROOMS,
                  payload: {
                    rooms: rooms,
                  },
                };
                ws.send(JSON.stringify(updateRoomsData));
              }
            });
            //
            // after broadcasting, make the client
            // who creates the new room to join it first
            //
            userRoomMap.set(sessionUserId, roomId);
            const joinRoomSuccessData = {
              type: SignalMessageType.JOIN_ROOM_SUCCESS,
              payload: {
                roomId: room.id,
                roomName: room.name,
              },
            };
            ws.send(JSON.stringify(joinRoomSuccessData));
            break;
          }

          case SignalMessageType.JOIN_ROOM: {
            const joinedRoomId = payload.roomId;
            const joinedRoom = rooms[joinedRoomId];
            if (joinedRoom) {
              // If there is a newcomer requesting to join into the room,
              // Let it join (as a normal participant) first
              //
              joinedRoom.addParticipant(sessionUserId, sessionUserName);
              userRoomMap.set(sessionUserId, roomId);
              const joinRoomSuccessData = {
                type: SignalMessageType.JOIN_ROOM_SUCCESS,
                payload: {
                  roomId: joinedRoom.id,
                  roomName: joinedRoom.name,
                },
              };
              ws.send(JSON.stringify(joinRoomSuccessData));
            }
            break;
          }

          case SignalMessageType.LEAVE_ROOM: {
            const leftRoomId = payload.roomId;
            const leftRoom = rooms[leftRoomId];

            if (leftRoom) {
              userRoomMap.delete(sessionUserId);
              leftRoom.deleteStreamParticipant(sessionUserId);

              // TODO: do some work to close the session user's WebRTC connection

              leftRoom.deleteParticipant(sessionUserId);
              const data = {
                type: SignalMessageType.LEAVE_ROOM_SUCCESS,
                payload: {
                  roomId: leftRoomId,
                  roomName: leftRoom.name,
                  userId: sessionUserId,
                },
              };
              ws.send(JSON.stringify(data));

              //
              // If this 'leftRoom' become an empty room, automatically delete it
              // and notify all authenticated clients
              //
              if (leftRoom.participants.size === 0) {
                delete rooms[leftRoomId]
                sessionMap.forEach((ws, _) => {
                  if (ws.readyState === WebSocket.OPEN) {
                    const updateRoomsData = {
                      type: SignalMessageType.UPDATE_ROOMS,
                      payload: {
                        rooms: rooms,
                      },
                    };
                    ws.send(JSON.stringify(updateRoomsData));
                  }
                });
              }
            }

            break;
          }

          // if finding that the number of the current room's stream participants is greater than 1,
          // the new peer should be provided WebRTC peer connection offers from each earlier stream participant
          //
          case SignalMessageType.WEBRTC_NEW_CALLING: {
            if (!userRoomMap.has(sessionUserId)) return;
            const callingRoomId = payload.roomId;
            const callingRoom = rooms[callingRoomId];
            if (!callingRoom) return;
            if (!callingRoom.participants.has(sessionUserId)) return;
            callingRoom.addStreamParticipant(sessionUserId, sessionUserName);
            if (callingRoom.streamParticipants.size <= 1) return;
            setTimeout(() => {
              callingRoom.streamParticipants.forEach((_, participantUserId) => {
                if (participantUserId !== sessionUserId) {
                  const websocketToAcceptNewPeer =
                    sessionMap.get(participantUserId);
                  const data = {
                    type: SignalMessageType.WEBRTC_NEW_PEER,
                    payload: {
                      userId: sessionUserId,
                    },
                  };
                  websocketToAcceptNewPeer.send(JSON.stringify(data));
                }
              });
            }, 0);
            break;
          }

          case SignalMessageType.WEBRTC_HANG_UP: {
            if (!userRoomMap.has(sessionUserId)) return;
            const hangUpRoomId = payload.roomId;
            const hangUpRoom = rooms[hangUpRoomId];
            if (!hangUpRoom) return;
            hangUpRoom.deleteStreamParticipant(sessionUserId);

            // TODO: do some work to close the session user's WebRTC connection

            break;
          }

          case SignalMessageType.WEBRTC_NEW_OFFER: {
            if (!userRoomMap.has(sessionUserId)) return;
            const websocketToTransferOffer = sessionMap.get(payload.userId);
            const offer = payload.offer;
            if (offer && websocketToTransferOffer) {
              const data = {
                type: SignalMessageType.WEBRTC_NEW_OFFER,
                payload: {
                  offer: offer,
                  from: sessionUserId,
                  to: payload.userId,
                },
              };
              websocketToTransferOffer.send(JSON.stringify(data));
            }
            break;
          }

          case SignalMessageType.WEBRTC_NEW_ANSWER: {
            if (!userRoomMap.has(sessionUserId)) return;
            const websocketToTransferAnswer = sessionMap.get(payload.userId);
            const answer = payload.answer;
            if (answer && websocketToTransferAnswer) {
              const data = {
                type: SignalMessageType.WEBRTC_NEW_ANSWER,
                payload: {
                  answer: answer,
                  from: sessionUserId,
                  to: payload.userId,
                },
              };
              websocketToTransferAnswer.send(JSON.stringify(data));
            }
            break;
          }

          case SignalMessageType.WEBRTC_NEW_ICE_CANDIDATE: {
            if (!userRoomMap.has(sessionUserId)) return;
            const websocketToTransfer = sessionMap.get(payload.userId);
            const iceCandidate = payload.iceCandidate;
            if (iceCandidate && websocketToTransfer) {
              const data = {
                type: SignalMessageType.WEBRTC_NEW_ICE_CANDIDATE,
                payload: {
                  iceCandidate: iceCandidate,
                  from: sessionUserId,
                  to: payload.userId,
                },
              };
              websocketToTransfer.send(JSON.stringify(answerAskerData));
            }
            break;
          }

          default:
            break;
        }
      });
      ws.on("close", function () {
        // websocket closed from client side
        sessionMap.delete(request.session.userId);
      });
    });

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit("connection", ws, request);
    });
  });
});

/**
 * start server listening & mongoose connection setup
 */

httpServer.listen(expressServerPort, () => {
  const mongooseUrl =
    "mongodb://mingdongshensen:mingdongshensen@localhost/admin";
  const mongooseOptions = { dbName: "test" };

  mongoose.connect(mongooseUrl, mongooseOptions);
  mongoose.connection.on("connecting", function () {
    console.log(chalk.yellow`express-server's mongodb connecting...`);
  });
  mongoose.connection.on("connected", function () {
    console.log(chalk.yellow`express-server's mongodb connection established`);
    // send message through stdout write stream if mongodb connection is established
    console.log(
      chalk.yellow`express-server is running on http://localhost:${expressServerPort}`
    );
    console.log(chalk.yellow`success`);
  });
  mongoose.connection.on("disconnected", function () {
    console.log(chalk.yellow`express-server's mongodb connection closed`);
  });
  mongoose.connection.on("error", () => {
    console.error(chalk.red`express-server's mongodb connection failed`);
  });
});
