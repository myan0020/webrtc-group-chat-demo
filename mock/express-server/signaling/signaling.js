const chalk = require("chalk");

const SignalMessageTypeObject = {
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
const SignalMessageTypeSet = new Set(Object.values(SignalMessageTypeObject));

const SignalMessage = function (selectedType, payload) {
  if (!SignalMessageTypeSet.has(selectedType)) {
    throw Error(
      "'SignalMessage' constructor has received a wrong value for 'selectedType'"
    );
  }
  this.type = selectedType;
  this.payload = payload;
};



const createMessage = (selectedType, payload) => {
  return new SignalMessage(selectedType, payload);
};

const createSerializedMessage = (selectedType, payload) => {
  return JSON.stringify(createMessage(selectedType, payload));
};

const type = {
  LOG_IN_SUCCESS: SignalMessageTypeObject.LOG_IN_SUCCESS,
  LOG_OUT_SUCCESS: SignalMessageTypeObject.LOG_OUT_SUCCESS,

  // Chat room singals
  CREATE_ROOM: SignalMessageTypeObject.CREATE_ROOM,
  UPDATE_ROOMS: SignalMessageTypeObject.UPDATE_ROOMS,
  JOIN_ROOM: SignalMessageTypeObject.JOIN_ROOM,
  JOIN_ROOM_SUCCESS: SignalMessageTypeObject.JOIN_ROOM_SUCCESS,
  LEAVE_ROOM: SignalMessageTypeObject.LEAVE_ROOM,
  LEAVE_ROOM_SUCCESS: SignalMessageTypeObject.LEAVE_ROOM_SUCCESS,

  // WebRTC connection singals
  WEBRTC_NEW_PEER_ARIVAL: SignalMessageTypeObject.WEBRTC_NEW_PEER_ARIVAL,
  WEBRTC_NEW_PEER_LEAVE: SignalMessageTypeObject.WEBRTC_NEW_PEER_LEAVE,
  WEBRTC_NEW_PASSTHROUGH: SignalMessageTypeObject.WEBRTC_NEW_PASSTHROUGH,
};

exports.type = type;

exports.sendThroughResponese = (res, selectedType, payload) => {
  if (!res) {
    console.log(chalk.red`Response cannot be sent because 'res' param is Null`);
    return;
  }
  res.send(createMessage(selectedType, payload));
};

exports.sendThroughWebsocket = (websocket, selectedType, payload) => {
  if (!websocket) {
    console.log(chalk.red`WebSocket msg cannot be sent because 'websocket' param is Null`);
    return;
  }
  websocket.send(createSerializedMessage(selectedType, payload));
};

