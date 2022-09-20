function GroupChatRoom(roomId, roomName) {
  // room  related
  //
  this.id = roomId;
  this.name = roomName;

  // (normal) participant related
  //
  this.participants = new Map();
  this.addParticipant = (userId, username) => {
    const participant = {
      id: userId,
      name: username,
    };
    this.participants.set(userId, participant);
  };

  this.deleteParticipant = (userId) => {
    this.participants.delete(userId);
  };

  // stream participant related
  //
  this.streamParticipants = new Map();
  this.addStreamParticipant = (userId, username) => {
    const participant = {
      id: userId,
      name: username,
    };
    this.streamParticipants.set(userId, participant);
  };
  this.deleteStreamParticipant = (userId) => {
    delete this.streamParticipants.delete(userId);
  };
}

module.exports = GroupChatRoom;