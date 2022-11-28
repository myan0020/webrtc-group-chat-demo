const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const sessionController = require("./sessionController");
const sessionMap = sessionController.sessionMap;
const authenticatedUserIds = sessionController.authenticatedUserIds;
const signaling = require("../signaling/signaling");
const sendSignalThroughResponse = signaling.sendThroughResponse;
const signalTypeEnum = signaling.typeEnum;
const groupChatRoomController = require("./groupChatRoomController");
const rooms = groupChatRoomController.rooms;
const userRoomMap = groupChatRoomController.userRoomMap;

exports.handleLogin = (req, res, next) => {
  const userName = req.body.userName;
  const userId = uuidv4();
  req.session.userId = userId;
  req.session.username = userName;
  authenticatedUserIds.add(userId);

  sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
    userName: userName,
    userId: userId,
  });
};

exports.handleLogout = (req, res, next) => {
  const userId = req.session.userId;
  const username = req.session.username;

  // TODO:
  //
  // Priority Level: Middle
  //
  // WebSocket connection does not close at a right moment or for a right user
  //

  console.log(
    `[WebSocket] before logout action been executed, the connections' userIds are [${chalk.yellow`logString`}]`
  );
  for (let sessionUserId of Array.from(sessionMap.keys())) {
    console.log(`[Connection-UserId] ${chalk.yellow`${sessionUserId}`}`);
  }

  if (userId && userId.length > 0 && userRoomMap.get(userId)) {
    const joinedRoomId = userRoomMap.get(userId);
    rooms[joinedRoomId].deleteParticipant(userId);
  }

  // TODO:
  //
  // Priority Level: Middle
  //
  // this 'session.destroy' method is used incorrectly,
  // and it will cause all sessiones to be deleted
  // after the first session.destroy being called
  //

  req.session.destroy(function () {
    if (userId && userId.length > 0) {
      authenticatedUserIds.delete(userId);
      const ws = sessionMap.get(userId);
      if (ws) {
        console.log(`[WebSocket] will close connection to the user named ${username}`);
        ws.close();
      }
      sessionMap.delete(userId);
    }

    sendSignalThroughResponse(res, signalTypeEnum.LOG_OUT_SUCCESS);
  });
};
