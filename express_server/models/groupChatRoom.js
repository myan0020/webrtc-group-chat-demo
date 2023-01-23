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
  
  Object.defineProperties(this, {
    participantsSize: {
      get: () => {
        return this.participants.size;
      },
    },
  });
}

module.exports = GroupChatRoom;
