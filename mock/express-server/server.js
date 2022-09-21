// const createError = require('http-errors');
// const cookieParser = require('cookie-parser');
const http = require("http");
const express = require("express");
const chalk = require("chalk");
const { expressServerPort, webSocketServerPort } = require("../../config/url");
const logger = require("morgan");
const connectMongDB = require("./controllers/mongoDBController").connectMongDB;
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const author_controller = require("./controllers/authorController");
const video_controller = require("./controllers/videoController");
const handleWebsocketUpgrade =
  require("./controllers/websocketController").handleUpgrade;
const signaling = require("./signaling/signaling");
const sessionController = require("./controllers/sessionController");
const groupChatRoomController = require("./controllers/groupChatRoomController");

const signalType = signaling.type;
const sendSignalThroughResponese = signaling.sendThroughResponese;
const sessionParser = sessionController.sessionParser;
const sessionMap = sessionController.sessionMap;
const authenticatedUserIds = sessionController.authenticatedUserIds;
const rooms = groupChatRoomController.rooms;
const userRoomMap = groupChatRoomController.userRoomMap;
const app = express();
const httpServer = http.createServer(app);

/**
 * ??? middleware setup
 */

app.use(logger("dev"));

/**
 * sessionParser middleware setup
 */

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

  sendSignalThroughResponese(res, signalType.LOG_IN_SUCCESS, {
    username: username,
    userId: userId,
    rooms: rooms,
  });
});

app.post("/logout", function (req, res) {
  const userId = req.session.userId;
  const username = req.session.username;

  // TODO: do some work to close the session user's WebRTC connection

  console.log(
    `[WebSocket] before logout action been executed, the connections' userIds are [${chalk.yellow`logString`}]`
  );
  for (let sessionUserId of Array.from(sessionMap.keys())) {
    console.log(
      `[Connection-UserId] ${chalk.yellow`${sessionUserId}`}`
    );
  }


  if (userId && userId.length > 0 && userRoomMap.get(userId)) {
    const joinedRoomId = userRoomMap.get(userId);
    rooms[joinedRoomId].deleteParticipant(userId);
    rooms[joinedRoomId].deleteStreamParticipant(userId);
  }

  // TODO:
  // this 'session.destroy' method is used incorrectly,
  // and it will cause all sessiones to be deleted
  // after the first session.destroy being called
  req.session.destroy(function () {
    if (userId && userId.length > 0) {
      authenticatedUserIds.delete(userId);
      const ws = sessionMap.get(userId);
      if (ws) {
        console.log(
          `[WebSocket] will close connection to the user named ${username}`
        );
        ws.close();
      }
      sessionMap.delete(userId);
    }
    
    sendSignalThroughResponese(res, signalType.LOG_OUT_SUCCESS);
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

httpServer.on("upgrade", handleWebsocketUpgrade);

/**
 * start server listening & mongoose connection setup
 */

httpServer.listen(expressServerPort, () => {
  const openMongDBConnection = false;
  if (openMongDBConnection) {
    connectMongDB();
  }
});
