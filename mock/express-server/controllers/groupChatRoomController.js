const signaling = require("../signaling/signaling");
const sendSignalThroughResponse = signaling.sendThroughResponse;
const signalTypeEnum = signaling.typeEnum;

const rooms = {};
const userRoomMap = new Map();

exports.handleGetRooms = (req, res, next) => {
  sendSignalThroughResponse(res, signalTypeEnum.GET_ROOMS, {
    rooms: rooms,
  });
};
exports.rooms = rooms;
exports.userRoomMap = userRoomMap;