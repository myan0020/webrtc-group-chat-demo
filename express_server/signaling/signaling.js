const chalk = require("chalk");

const typeEnum = {
  // HTTP //
  //
  // auth
  LOG_IN_SUCCESS: 1,
  LOG_OUT_SUCCESS: 2,

  // WebSocket //
  //
  // heartbeat
  PING: 3,
  PONG: 4,
  //
  // chat room
  GET_ROOMS: 5,
  CREATE_ROOM: 6,
  UPDATE_ROOMS: 7,
  JOIN_ROOM: 8,
  JOIN_ROOM_SUCCESS: 9,
  LEAVE_ROOM: 10,
  LEAVE_ROOM_SUCCESS: 11,
  //
  // WebRTC connection
  WEBRTC_NEW_PEER_ARIVAL: 12,
  WEBRTC_NEW_PEER_LEAVE: 13,
  WEBRTC_NEW_PASSTHROUGH: 14,
};

const createMessage = (selectedType, payload) => {
  const typeValueSet = new Set(Object.values(typeEnum));
  if (!typeValueSet.has(selectedType)) {
    console.log(chalk.red`'createMessage' has received a wrong 'selectedType'( ${selectedType} )`);
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
  for (let typeName in typeEnum) if (typeEnum[typeName] === typeValue) return typeName;
  return undefined;
};

exports.typeEnum = typeEnum;

exports.findTypeNameByTypeValue = findTypeNameByTypeValue;

exports.sendThroughResponse = (res, selectedType, payload) => {
  if (!res) {
    console.log(chalk.red`Response cannot be sent because 'res' param is Null`);
    return;
  }

  const message = createMessage(selectedType, payload);
  if (!message) {
    console.log(chalk.red`Response cannot be sent because the outgoing message is Null`);
    return;
  }

  const selectedTypeName = findTypeNameByTypeValue(selectedType);
  if (!selectedTypeName || selectedTypeName.length === 0) {
    console.log(
      chalk.red`[HTTP] the log to show signal type name cannot be printed because 'selectedType'( pointing to ${selectedTypeName} ) param is invalid`
    );
  } else {
    console.log(
      `[${chalk.green`HTTP`}] ${chalk.green`${selectedTypeName}`} signal msg respond ${chalk.blue`to`} a user`
    );
  }

  res.send(message);
};

exports.sendThroughWebsocket = (websocket, selectedType, payload) => {
  if (!websocket) {
    console.log(
      chalk.red`[WebSocket] msg of type(${selectedType}) and of payload(${JSON.stringify(
        payload
      )}) cannot be sent because 'websocket' param is Null`
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
      `[${chalk.green`WebSocket`}] ${chalk.green`${selectedTypeName}`} signal msg ${chalk.blue`to`} a user of a name(${chalk.green`${
        websocket.username ? websocket.username : "unknown"
      }`})`
    );
  }

  websocket.send(createSerializedMessage(selectedType, payload));
};
