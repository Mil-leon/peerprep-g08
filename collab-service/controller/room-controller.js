import { v4 as uuidv4 } from "uuid";
import RoomModel from "../model/room-model.js";

export function createRoomController(io) {
  /**
   * POST /rooms/create
   * Called by the matching service once a match is found.
   * Body: { questionId?: string }
   */
  const createRoom = (req, res) => {
    const id = uuidv4();
    const { questionId = null } = req.body ?? {};
    const room = RoomModel.create(id, questionId);

    res.json({ roomId: room.id, questionId: room.questionId });
  };

  /**
   * POST /rooms/join
   * Body: { roomId: string }
   * Returns the full room metadata so the frontend can read questionId.
   */
  const joinRoom = (req, res) => {
    const { roomId, user } = req.body;

    console.log("joinroom body:", req.body);

    const { error, data: room } = RoomModel.addUserToRoom(roomId, user);
    if (!error) {
      return res.json({
        success: true,
        roomId: room.id,
        questionId: room.questionId,
      });
    } else if (error === "Room is full") {
      return res.status(403).json({ error: "Room full" });
    } else {
      return res.status(404).json({ error: "Room not found" });
    }
  };

  /**
   * GET /rooms/:roomId
   * Lightweight read used by the frontend to hydrate room metadata.
   */
  const getRoom = (req, res) => {
    const { roomId } = req.params;

    const room = RoomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ roomId: room.id, questionId: room.questionId });
  };

  /**
   * DELETE /rooms/:roomId
   */
  const endRoom = (req, res) => {
    const { roomId } = req.params;

    io.to(roomId).emit("room_ended");

    RoomModel.remove(roomId);

    res.json({ success: true });
  };

  return { createRoom, joinRoom, getRoom, endRoom };
}
