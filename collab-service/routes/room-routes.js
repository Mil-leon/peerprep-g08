import express from "express";
import { createRoom, joinRoom, getRoom, endRoom } from "../controller/room-controller.js";

const router = express.Router();

router.post("/create", createRoom);
router.post("/join", joinRoom);
router.get("/:roomId", getRoom);
router.delete("/:roomId", endRoom);

export default router;