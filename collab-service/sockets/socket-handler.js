import CollabRoomModel from "../model/collab-room-model.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", async (roomId, userData) => {
      socket.join(roomId);

      // Load persisted messages from database
      const messages = await CollabRoomModel.getMessages(roomId);
      socket.emit("load_messages", messages);
    });

    socket.on("send_message", async ({ roomId, message, senderUsername, senderId }) => {
      const msg = {
        id: Date.now(),
        text: message,
        senderUsername: senderUsername || "Unknown",
        senderId: senderId || socket.id,
      };

      // Save message to database
      await CollabRoomModel.addMessage(roomId, msg);

      // Broadcast to all users in the room
      io.to(roomId).emit("receive_message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
