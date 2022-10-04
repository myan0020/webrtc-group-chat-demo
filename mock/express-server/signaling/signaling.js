const chalk = require("chalk");

const typeEnum = {
  // Session singals
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,

  CREATE_ROOM: 3,
  UPDATE_ROOMS: 4,
  JOIN_ROOM: 5,
  JOIN_ROOM_SUCCESS: 6,
  LEAVE_ROOM: 7,
  LEAVE_ROOM_SUCCESS: 8,
  // WebRTC connection singals
  WEBRTC_NEW_PEER_ARIVAL: 9,
  WEBRTC_NEW_PEER_LEAVE: 10,
  WEBRTC_NEW_PASSTHROUGH: 11,
};

const createMessage = (selectedType, payload) => {
  const typeValueSet = new Set(Object.values(typeEnum));
  if (!typeValueSet.has(selectedType)) {
    console.log(
      chalk.red`'createMessage' has received a wrong 'selectedType'( ${selectedType} )`
    );
    return null;
  }

  const message = {};
  message.type = selectedType;
  message.payload = payload;

  return message;
};

const createSerializedMessage = (selectedType, payload) => {
  return JSON.stringify(createMessage(selectedType, payload));
};

const findTypeNameByTypeValue = (typeValue) => {
  for (let typeName in typeEnum)
    if (typeEnum[typeName] === typeValue) return typeName;
  return undefined;
};

exports.typeEnum = typeEnum;

exports.findTypeNameByTypeValue = findTypeNameByTypeValue;

exports.sendThroughResponse = (res, selectedType, payload) => {
  if (!res) {
    console.log(
      chalk.red`Response cannot be sent because 'res' param is Null`
    );
    return;
  }

  const message = createMessage(selectedType, payload);
  if (!message) {
    console.log(
      chalk.red`Response cannot be sent because the outgoing message is Null`
    );
    return;
  }

  const selectedTypeName = findTypeNameByTypeValue(selectedType);
  if (!selectedTypeName || selectedTypeName.length === 0) {
    console.log(
      chalk.red`[HTTP] the log to show signal type name cannot be printed because 'selectedType'( pointing to ${selectedTypeName} ) param is invalid`
    );
  } else {
    console.log(
      `[HTTP] ${chalk.green`${selectedTypeName}`} signal msg respond ${chalk.blue`to`} a user`
    );
  }

  res.send(message);
};

exports.sendThroughWebsocket = (websocket, selectedType, payload) => {
  if (!websocket) {
    console.log(
      chalk.red`[WebSocket] msg cannot be sent because 'websocket' param is Null`
    );
    return;
  }

  const selectedTypeName = findTypeNameByTypeValue(selectedType);
  if (!selectedTypeName || selectedTypeName.length === 0) {
    console.log(
      chalk.red`[WebSocket] the log to show signal type name cannot be printed because 'selectedType'( pointing to ${selectedTypeName} ) param is invalid`
    );
  } else {
    console.log(
      `[WebSocket] ${chalk.green`${selectedTypeName}`} signal msg ${chalk.blue`to`} the user named ${chalk.green`${
        websocket.username ? websocket.username : "unknown"
      }`}`
    );
  }

  websocket.send(createSerializedMessage(selectedType, payload));
};