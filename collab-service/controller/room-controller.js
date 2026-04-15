import { v4 as uuidv4 } from "uuid";
import { finalizeRoom } from "../yjs/yjs-handler.js";
import CollabRoomModel from "../model/collab-room-model.js";

export function createRoomController(io) {
  /**
   * POST /rooms/create
   * Called by the matching service once a match is found.
   * Body: { questionId?: string }
   */
  const createRoom = async (req, res) => {
    const id = uuidv4();
    const { questionId = null } = req.body ?? {};
    const room = await CollabRoomModel.create(id, questionId);

    res.json({ roomId: room.roomId, questionId: room.questionId });
  };

  /**
   * POST /rooms/join
   * Body: { roomId: string }
   * Returns the full room metadata so the frontend can read questionId.
   */
  const joinRoom = async (req, res) => {
    const { roomId, user } = req.body;
    
    // Check if room has ended
    const isEnded = await CollabRoomModel.isRoomEnded(roomId);
    if (isEnded) {
      return res.status(410).json({ error: "Room has ended" });
    }
    
    const { error, data: room } = await CollabRoomModel.addUserToRoom(
      roomId,
      user,
    );
    if (!error) {
      return res.json({
        success: true,
        roomId: room.roomId,
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
  const getRoom = async (req, res) => {
    const { roomId } = req.params;

    const room = await CollabRoomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.endedAt) {
      return res.status(410).json({ error: "Room has ended" });
    }

    res.json({ roomId: room.roomId, questionId: room.questionId });
  };

  /**
   * DELETE /rooms/:roomId
   */
  const endRoom = async (req, res) => {
    const { roomId } = req.params;

    io.to(roomId).emit("room_ended");

    await finalizeRoom(roomId);
    await CollabRoomModel.endRoom(roomId);

    res.json({ success: true });
  };

  return { createRoom, joinRoom, getRoom, endRoom };
}

