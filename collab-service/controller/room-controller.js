import { v4 as uuidv4 } from "uuid";
import RoomModel from "../model/room-model.js";

/**
 * POST /rooms/create
 * Called by the matching service once a match is found.
 * Body: { questionId?: string }
 */
export const createRoom = (req, res) => {
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
export const joinRoom = (req, res) => {
    const { roomId } = req.body;

    const room = RoomModel.findById(roomId);
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }

    res.json({ success: true, roomId: room.id, questionId: room.questionId });
};

/**
 * GET /rooms/:roomId
 * Lightweight read used by the frontend to hydrate room metadata.
 */
export const getRoom = (req, res) => {
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
export const endRoom = (req, res) => {
    const { roomId } = req.params;

    RoomModel.remove(roomId);

    res.json({ success: true });
};