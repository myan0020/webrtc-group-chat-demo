// const createError = require('http-errors');
// const cookieParser = require('cookie-parser');
const http = require("http");
const express = require("express");
const app = express();
const httpServer = http.createServer(app);
const logger = require("morgan");
const bodyParser = require("body-parser");

const { expressServerPort, webSocketServerPort } = require("../../config/url");
const mongoDBController = require("./controllers/mongoDBController");
const authorController = require("./controllers/authorController");
const videoController = require("./controllers/videoController");
const websocketController =
  require("./controllers/websocketController");
const authenticationController = require('./controllers/authenticationController');
const sessionController = require("./controllers/sessionController");
const sessionParser = sessionController.sessionParser;

const openMongDBConnection = false;
// testing paths: setup the allowed url paths for webpack-dev-server proxy
const paths = ["/hello", "/world", "/author", "/video", "/login", "/logout"];

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

app.post("/login", authenticationController.handleLogin);

app.post("/logout", authenticationController.handleLogout);

// testing path
app.use("/hello", (req, res) => {
  res.json({ hello: "A polite English greeting word" });
});

// testing path
app.use("/world", (req, res) => {
  res.send("world!");
});

// testing path: GET author information by author id
app.get("/author/:id", authorController.authorDetail);

// testing path: GET author information list
app.get("/authors", authorController.authorList);

// testing path: GET video clip
app.get("/video_clip", videoController.getVideoClip);

app.get("/video_hls", videoController.getVideoHLS);

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
 * note: the user who hasn't logged in cannot cannot open the websocket connection
 */

httpServer.on("upgrade", websocketController.handleUpgrade);

/**
 * start server listening & mongoose connection setup
 */

httpServer.listen(expressServerPort, () => {
  if (openMongDBConnection) {
    mongoDBController.connectMongDB();
  }
});


