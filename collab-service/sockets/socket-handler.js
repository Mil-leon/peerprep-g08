import { rooms } from "../utils/room-store.js";

export default function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join_room", (roomId, userData) => {
            socket.join(roomId);
            // Store user info on the socket for later use
            socket.userData = userData;
            socket.roomId = roomId;

            // Get the room and send all persisted messages to the joining user
            const room = rooms.get(roomId);
            if (room) {
                // Send all existing messages to the user who just joined
                socket.emit("load_messages", room.messages);
                
                // Add user to room's user list
                if (!room.users) room.users = [];
                room.users.push({
                    id: socket.id,
                    username: userData?.username || "Unknown"
                });
            }
        });

        socket.on("send_message", ({ roomId, message, senderUsername }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            const msg = {
                id: Date.now(),
                text: message,
                senderUsername: senderUsername,
                senderId: socket.id,
            };

            room.messages.push(msg);

            io.to(roomId).emit("receive_message", msg);
        });

        socket.on("disconnect", () => {
            const roomId = socket.roomId;
            if (roomId) {
                const room = rooms.get(roomId);
                if (room) {
                    // Remove user from room's user list
                    room.users = (room.users || []).filter(u => u.id !== socket.id);
                }
            }
            console.log("User disconnected:", socket.id);
        });
    });
}