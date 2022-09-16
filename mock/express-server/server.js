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
const sessionMap = new Map(); // websocket session map
const rooms = {}; // chat rooms, look like { [roomId]: instanceof Room }
const Room = function (roomId, roomName) {
  this.id = roomId;
  this.name = roomName;
  this.participants = {};
  this.addParticipant = (userId, username) => {
    const participant = {
      id: userId,
      name: username,
    };
    this.participants[userId] = participant;
  };
  this.deleteParticipant = (userId) => {
    delete this.participants[userId];
  };
};

/**
 * This signal message type list match the same one on each client side
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
  req.session.userId = uuidv4();
  req.session.username = username;
  res.send({
    type: SignalMessageType.LOG_IN_SUCCESS,
    payload: {
      username: username,
      rooms: rooms,
    },
  });
});

app.post("/logout", function (req, res) {
  const ws = sessionMap.get(req.session.userId);
  req.session.destroy(function () {
    if (ws) ws.close();
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
 */

httpServer.on("upgrade", function (request, socket, head) {
  sessionParser(request, {}, function next() {
    if (!request.session.userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const wss = new WebSocket.Server({ noServer: true });

    wss.on("connection", function (ws, request) {
      // session id setup
      const requestUserName = request.session.username;
      const requestUserId = request.session.userId;

      sessionMap.set(requestUserId, ws);
      ws.userId = requestUserId;

      // handling events for each websocket connection
      ws.on("message", function (message) {
        const parsedMessage = JSON.parse(message);
        const type = parsedMessage.type;
        const payload = parsedMessage.payload;

        switch (type) {

          case SignalMessageType.CREATE_ROOM: {
            const roomId = uuidv4();
            const room = new Room(roomId, payload.roomName);
            room.addParticipant(
              requestUserId,
              requestUserName
            );
            rooms[roomId] = room;
            //
            // When a new room is created,
            // broadcast the lastest rooms info to each client
            //
            sessionMap.forEach((ws) => {
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
            const roomIdToJoin = payload.roomId;
            const roomToJoin = rooms[roomIdToJoin];
            if (roomToJoin) {
              roomToJoin.addParticipant(
                requestUserId,
                requestUserName
              );
              const joinRoomSuccessData = {
                type: SignalMessageType.JOIN_ROOM_SUCCESS,
                payload: {
                  roomId: roomToJoin.id,
                  roomName: roomToJoin.name,
                },
              };
              ws.send(JSON.stringify(joinRoomSuccessData));
            }
            break;
          }

          case SignalMessageType.LEAVE_ROOM: {
            const leaveRoomId = payload.roomId;
            const roomToLeave = rooms[leaveRoomId];
            if (roomToLeave) {
              roomToLeave.deleteParticipant(requestUserId);
              const leaveRoomSuccessData = {
                type: SignalMessageType.LEAVE_ROOM_SUCCESS,
                payload: {
                  roomId: roomToLeave.id,
                  roomName: roomToLeave.name,
                },
              };
              console.log(`LEAVE_ROOM: ${leaveRoomSuccessData}`)
              ws.send(JSON.stringify(leaveRoomSuccessData));
            }
            break;
          }

          default:
            break;
        }
  
      });
      ws.on("close", function () {
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
