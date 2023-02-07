require('dotenv').config()

// const createError = require('http-errors');
// const cookieParser = require('cookie-parser');
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();

const server = require("http").createServer(app);

const logger = require("morgan");
const bodyParser = require("body-parser");
const apiRouter = require("./routers/apiRouter");
const mongoDBController = require("./controllers/mongoDBController");
const websocketController = require("./controllers/websocketController");
const sessionController = require("./controllers/sessionController");
const sessionParser = sessionController.sessionParser;

const openMongDBConnection = false;

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
 * static files serving middleware setup
 */

// the production build folder
app.use(express.static(path.join(process.cwd(), "build")));

// the folder that provides files for the html template file
app.use(express.static(path.join(process.cwd(), "public")));

/**
 * routes setup to send html
 */

// middleware to test if authenticated
function isAuthenticated (req, res, next) {
  if (req.session.userId) next()
  else next('route')
}

app.get("/signin", function (req, res) {
  res.sendFile(path.join(process.cwd(), "build", "index.html"));
});

app.get("/", function (req, res) {
  res.redirect("/signin");
});

app.get("/room-list", function (req, res) {
  res.redirect("/signin");
});

app.get("/chat-room", function (req, res) {
  res.redirect("/signin");
});

/**
 * api route setup to send data
 */

app.use("/api", apiRouter);

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

server.on("upgrade", websocketController.handleUpgrade);

/**
 * start server listening & mongoose connection setup
 */

server.listen(process.env.EXPRESS_SERVER_PORT, () => {
  console.log(`express server run on PORT(${process.env.EXPRESS_SERVER_PORT})`);

  if (openMongDBConnection) {
    mongoDBController.connectMongDB();
  }
});
