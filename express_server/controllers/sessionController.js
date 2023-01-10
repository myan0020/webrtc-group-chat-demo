const session = require("express-session");
const sessionParser = session({
  saveUninitialized: false,
  secret: "$eCuRiTy",
  resave: false,
});
const websocketMap = new Map();
const authenticatedUserIds = new Set();

exports.sessionParser = sessionParser;
exports.websocketMap = websocketMap;
exports.authenticatedUserIds = authenticatedUserIds;