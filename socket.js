const socketIo = (io) => {
  // Store connected users with their room information using socket.io as their key
  const connectedUsers = new Map();
  // Handle new socket connections
  io.on("connection", (socket) => {
    // Get user from authentication
    const user = socket.handshake.auth.user;

    //! START:Join room handler
    socket.on("join room", (groupId) => {
      socket.join(groupId);
      // Store connected user and room info in connectedUsers map
      connectedUsers.set(socket.id, { user, room: groupId });
      // Get list of all users currently in the room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);
      // Emit updated users list to all clients in the room
      io.in(groupId).emit("users in room", usersInRoom);
      // Broadcast join notification to all other users in the room
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`,
        user: user,
      });
    });
    //! END:Join room handler

    //! START: Leave room handler
    //Triggered when user manually leaves a room
    socket.on("leave room", (groupId) => {
      //Remove socket from the room
      socket.leave(groupId);
      if (connectedUsers.has(socket.id)) {
        //Remove user from connected users and notify others
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });
    //! END: Leave room handler

    //! START:New message handler
    // Triggered when user sends a message
    socket.on("new message", (message) => {
      socket.to(message.groupId).emit("message received", message);
    });
    //! END: New message handler

    // ! START: Typing indicator
    // Triggered when user starts typing
    socket.on("typing", ({ groupId, username }) => {
      // Broadcast typing status to other users in the room
      socket.to(groupId).emit("user typing", { username });
    });
    socket.on("stop typing", ({ groupId }) => {
      // Broadcast stop typing status to other users in the room
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });
    // ! END: Typing indicator

    //! START: Disconnect handler
    //Triggered when user closes the connection
    socket.on("disconnect", () => {
      if (connectedUsers.has(socket.id)) {
        // Get user's room info before removing
        const userData = connectedUsers.get(socket.id);
        socket.to(userData.room).emit("user left", user?._id);
        connectedUsers.delete(socket.id);
        //! END: Disconnect handler
      }
    });
  });
};

module.exports = socketIo;
