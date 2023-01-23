const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const sessionController = require("./sessionController");
const websocketMap = sessionController.websocketMap;
const authenticatedUserIds = sessionController.authenticatedUserIds;
const signaling = require("../signaling/signaling");
const sendSignalThroughResponse = signaling.sendThroughResponse;
const signalTypeEnum = signaling.typeEnum;
const websocketController = require("./websocketController");

exports.handleLogin = (req, res, next) => {
  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(function (err) {
    if (err) next(err);

    // store user information in session, typically a user id
    const userId = uuidv4();
    const userName = req.body.userName;
    req.session.userId = userId;
    req.session.username = userName;
    authenticatedUserIds.add(userId);

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
      sendSignalThroughResponse(res, signalTypeEnum.LOG_IN_SUCCESS, {
        userName: userName,
        userId: userId,
      });
    });
  });
};

exports.handleLogout = (req, res, next) => {
  const sessionUserId = req.session.userId;
  const sessionUserName = req.session.username;

  console.log(
    `[${chalk.green`HTTP`}] before logout action been executed, avaliable session are [${chalk.yellow`...`}]`
  );
  for (let userId of Array.from(websocketMap.keys())) {
    console.log(`[${chalk.yellow`${userId}`}]`);
  }

  // TODO:
  //
  // Priority Level: Low
  //
  // this 'session.destroy' method may be used incorrectly,
  // because 'req.session' regards each browser(eg: chrome, firefox ...) as one unique user,
  // as a result, when you log out inside a browser, no matter how many tabs you has opened inside that browser,
  // 'req.session' will think that they(tabs) log out
  //

  req.session.destroy(function () {
    if (sessionUserId && sessionUserId.length > 0) {
      authenticatedUserIds.delete(sessionUserId);

      if (websocketMap.has(sessionUserId)) {
        const ws = websocketMap.get(sessionUserId);
        websocketController.handleLeaveRoom(ws, sessionUserId);

        console.log(
          `[${chalk.green`WebSocket`}] will perform ${chalk.green`an active connection close`} to a user of a name(${chalk.green`${
            typeof sessionUserName === "string" ? sessionUserName : "unknown"
          }`})`
        );
      }
    }

    sendSignalThroughResponse(res, signalTypeEnum.LOG_OUT_SUCCESS);
  });
};
