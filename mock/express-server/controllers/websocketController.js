const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const sessionMap = require("./sessionController").sessionMap;
const rooms = require("./groupChatRoomController").rooms;
const userRoomMap = require("./groupChatRoomController").userRoomMap;
const GroupChatRoom = require("../models/groupChatRoom");
const signalType = require("../signaling/signaling").type;
const sendSerializedSignalThroughWebsocket =
  require("../signaling/signaling").sendThroughWebsocket;
const sessionParser = require("./sessionController").sessionParser;
const authenticatedUserIds =
  require("./sessionController").authenticatedUserIds;
const chalk = require("chalk");

const create_web_socket = (session) => {
  console.log(
    `[WebSocket] will be created to the user named ${chalk.green`${session.username}`}`
  );
  const wss = new WebSocket.Server({ noServer: true });

  wss.on("connection", function (ws, request) {
    // session id setup
    const sessionUserName = request.session.username;
    const sessionUserId = request.session.userId;

    console.log(
      `[WebSocket] ${chalk.green`connection`} event from the user named ${chalk.green`${sessionUserName}`}`
    );

    sessionMap.set(sessionUserId, ws);
    ws.userId = sessionUserId;
    ws.username = sessionUserName;

    // handling events for each websocket connection
    ws.on("message", function (message) {
      const parsedMessage = JSON.parse(message);
      const type = parsedMessage.type;
      const payload = parsedMessage.payload;

      switch (type) {
        case signalType.CREATE_ROOM: {
          console.log(
            `[WebSocket] ${chalk.green`CREATE_ROOM`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`}`
          );

          const roomId = uuidv4();
          const room = new GroupChatRoom(roomId, payload.roomName);
          room.addParticipant(sessionUserId, sessionUserName);
          rooms[roomId] = room;
          //
          // When a new GroupChatRoom is created,
          // broadcast the latest rooms info to each client
          // &&
          // broadcast the latest participants info to each client in this new GroupChatRoom
          //
          sessionMap.forEach((ws, userId) => {
            if (ws.readyState === WebSocket.OPEN) {
              // ws.send(
              //   createSerializedSignalMessage(signalType.UPDATE_ROOMS, {
              //     rooms: rooms,
              //   })
              // );
              console.log(
                `[WebSocket] ${chalk.green`UPDATE_ROOMS`} signal msg ${chalk.green`to`} the user named ${chalk.green`${sessionUserName}`}`
              );
              sendSerializedSignalThroughWebsocket(
                ws,
                signalType.UPDATE_ROOMS,
                {
                  rooms: rooms,
                }
              );
            }
          });
          //
          // after broadcasting, make the client
          // who creates the new GroupChatRoom to join it first
          //
          userRoomMap.set(sessionUserId, roomId);
          console.log(
            `[WebSocket] ${chalk.green`JOIN_ROOM_SUCCESS`} signal msg ${chalk.green`to`} the user named ${chalk.green`${sessionUserName}`}`
          );
          sendSerializedSignalThroughWebsocket(
            ws,
            signalType.JOIN_ROOM_SUCCESS,
            {
              roomId: room.id,
              roomName: room.name,
            }
          );
          break;
        }

        case signalType.JOIN_ROOM: {
          console.log(
            `[WebSocket] ${chalk.green`JOIN_ROOM`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`}`
          );

          const joinedRoomId = payload.roomId;
          const joinedRoom = rooms[joinedRoomId];
          if (joinedRoom) {
            // If there is a newcomer requesting to join into the room,
            // Let it join (as a normal participant) first
            //
            joinedRoom.addParticipant(sessionUserId, sessionUserName);
            userRoomMap.set(sessionUserId, joinedRoomId);
            console.log(
              `[WebSocket] ${chalk.green`JOIN_ROOM_SUCCESS`} signal msg ${chalk.green`to`} the user named ${chalk.green`${sessionUserName}`}`
            );
            sendSerializedSignalThroughWebsocket(
              ws,
              signalType.JOIN_ROOM_SUCCESS,
              {
                roomId: joinedRoom.id,
                roomName: joinedRoom.name,
              }
            );
          }
          break;
        }

        case signalType.LEAVE_ROOM: {
          console.log(
            `[WebSocket] ${chalk.green`LEAVE_ROOM`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`}`
          );

          const leftRoomId = userRoomMap.get(sessionUserId);
          const leftRoom = rooms[leftRoomId];

          if (leftRoom) {
            userRoomMap.delete(sessionUserId);
            leftRoom.deleteStreamParticipant(sessionUserId);

            // TODO: do some work to close the session user's WebRTC connection

            leftRoom.deleteParticipant(sessionUserId);
            console.log(
              `[WebSocket] ${chalk.green`LEAVE_ROOM_SUCCESS`} signal msg ${chalk.green`to`} the user named ${chalk.green`${sessionUserName}`}`
            );
            sendSerializedSignalThroughWebsocket(
              ws,
              signalType.LEAVE_ROOM_SUCCESS,
              {
                roomId: leftRoomId,
                roomName: leftRoom.name,
                userId: sessionUserId,
              }
            );

            //
            // If this 'leftRoom' become an empty room, automatically delete it
            // and notify all authenticated clients
            //
            if (leftRoom.participants.size === 0) {
              delete rooms[leftRoomId];
              sessionMap.forEach((ws, _) => {
                if (ws.readyState === WebSocket.OPEN) {
                  console.log(
                    `[WebSocket] ${chalk.green`UPDATE_ROOMS`} signal msg ${chalk.green`to`} the user named ${chalk.green`${sessionUserName}`}`
                  );
                  sendSerializedSignalThroughWebsocket(
                    ws,
                    signalType.UPDATE_ROOMS,
                    {
                      rooms: rooms,
                    }
                  );
                }
              });
            }
          }

          break;
        }

        // if finding that the number of the current room's stream participants is greater than 1,
        // the new peer should be provided WebRTC peer connection offers from each earlier stream participant
        //
        case signalType.WEBRTC_NEW_CALLING: {
          console.log(
            `[WebSocket] ${chalk.green`WEBRTC_NEW_CALLING`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`}`
          );

          if (!userRoomMap.has(sessionUserId)) return;

          const callingRoomId = userRoomMap.get(sessionUserId);

          // const callingRoomId = payload.roomId;
          const callingRoom = rooms[callingRoomId];
          if (!callingRoom) return;
          if (!callingRoom.participants.has(sessionUserId)) return;
          callingRoom.addStreamParticipant(sessionUserId, sessionUserName);
          if (callingRoom.streamParticipants.size <= 1) return;
          setTimeout(() => {
            callingRoom.streamParticipants.forEach((_, participantUserId) => {
              if (participantUserId !== sessionUserId) {
                const websocketToAcceptNewPeer =
                  sessionMap.get(participantUserId);
                console.log(
                  `[WebSocket] ${chalk.green`WEBRTC_NEW_PEER`} signal msg ${chalk.green`to`} the user named ${chalk.green`${websocketToAcceptNewPeer.username}`}`
                );
                sendSerializedSignalThroughWebsocket(
                  websocketToAcceptNewPeer,
                  signalType.WEBRTC_NEW_PEER,
                  {
                    userId: sessionUserId,
                  }
                );
              }
            });
          }, 0);
          break;
        }

        case signalType.WEBRTC_HANG_UP: {
          console.log(
            `[WebSocket] ${chalk.green`WEBRTC_HANG_UP`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`}`
          );

          if (!userRoomMap.has(sessionUserId)) return;
          const hangUpRoomId = payload.roomId;
          const hangUpRoom = rooms[hangUpRoomId];
          if (!hangUpRoom) return;
          hangUpRoom.deleteStreamParticipant(sessionUserId);

          // TODO: do some work to close the session user's WebRTC connection

          break;
        }

        case signalType.WEBRTC_NEW_OFFER: {
          if (!userRoomMap.has(sessionUserId)) return;
          const websocketToTransferOffer = sessionMap.get(payload.userId);
          const offer = payload.offer;
          if (offer && websocketToTransferOffer) {
            console.log(
              `[WebSocket] ${chalk.green`WEBRTC_NEW_OFFER`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`} ${chalk.green`to`} the user named ${chalk.green`${websocketToTransferOffer.username}`}`
            );
            sendSerializedSignalThroughWebsocket(
              websocketToTransferOffer,
              signalType.WEBRTC_NEW_OFFER,
              {
                offer: offer,
                from: sessionUserId,
                to: payload.userId,
              }
            );
          }
          break;
        }

        case signalType.WEBRTC_NEW_ANSWER: {
          if (!userRoomMap.has(sessionUserId)) return;
          const websocketToTransferAnswer = sessionMap.get(payload.userId);
          const answer = payload.answer;
          if (answer && websocketToTransferAnswer) {
            console.log(
              `[WebSocket] ${chalk.green`WEBRTC_NEW_ANSWER`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`} ${chalk.green`to`} the user named ${chalk.green`${websocketToTransferAnswer.username}`}`
            );
            sendSerializedSignalThroughWebsocket(
              websocketToTransferAnswer,
              signalType.WEBRTC_NEW_ANSWER,
              {
                answer: answer,
                from: sessionUserId,
                to: payload.userId,
              }
            );
          }
          break;
        }

        case signalType.WEBRTC_NEW_ICE_CANDIDATE: {
          if (!userRoomMap.has(sessionUserId)) return;
          const websocketToTransfer = sessionMap.get(payload.userId);
          const iceCandidate = payload.iceCandidate;
          if (iceCandidate && websocketToTransfer) {
            console.log(
              `[WebSocket] ${chalk.green`WEBRTC_NEW_ICE_CANDIDATE`} signal msg ${chalk.green`from`} the user named ${chalk.green`${sessionUserName}`} ${chalk.green`to`} the user named ${chalk.green`${websocketToTransfer.username}`}`
            );
            sendSerializedSignalThroughWebsocket(
              websocketToTransfer,
              signalType.WEBRTC_NEW_ICE_CANDIDATE,
              {
                iceCandidate: iceCandidate,
                from: sessionUserId,
                to: payload.userId,
              }
            );
          }
          break;
        }

        default:
          break;
      }
    });
    ws.on("close", function () {
      // websocket closed from client side
      console.log(
        `[WebSocket] heard ${chalk.green`close`} event from the user named ${chalk.green`${sessionUserName}`}`
      );
      sessionMap.delete(request.session.userId);
    });
  });

  return wss;
};

exports.handleUpgrade = (request, socket, head) => {
  sessionParser(request, {}, function next() {
    if (!authenticatedUserIds.has(request.session.userId)) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const wss = create_web_socket(request.session);
    wss.handleUpgrade(request, socket, head, function (ws) {
      console.log(`[WebSocket] will emit a ${chalk.yellow`connection`} event `);
      wss.emit("connection", ws, request);
    });
  });
};
