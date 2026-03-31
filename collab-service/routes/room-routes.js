import express from "express";
import { createRoom, joinRoom, getRoom, createEndRoom } from "../controller/room-controller.js";

// Factory function to create router with io instance
export const createRoomRouter = (io) => {
    const router = express.Router();

    router.post("/create", createRoom);
    router.post("/join", joinRoom);
    router.get("/:roomId", getRoom);
    router.delete("/:roomId", createEndRoom(io));

    return router;
};

export default createRoomRouter;
