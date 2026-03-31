import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { createRoomRouter } from "./routes/room-routes.js";
import socketHandler from "./sockets/socket-handler.js";

const port = process.env.PORT || 3219;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Pass io instance to room router for broadcasting
app.use("/rooms", createRoomRouter(io));

socketHandler(io);

server.listen(port, () => {
    console.log("Server running on port " + port);
});