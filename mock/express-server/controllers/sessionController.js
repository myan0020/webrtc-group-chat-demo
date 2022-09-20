const session = require("express-session");
const sessionParser = session({
  saveUninitialized: false,
  secret: "$eCuRiTy",
  resave: false,
});
const sessionMap = new Map();
const authenticatedUserIds = new Set();

exports.sessionParser = sessionParser;
exports.sessionMap = sessionMap;
exports.authenticatedUserIds = authenticatedUserIds;