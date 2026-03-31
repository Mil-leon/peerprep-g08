import { createRoom, getRoom, deleteRoom } from "../utils/room-store.js";

class RoomModel {
    static create(id, questionId = null) {
        createRoom(id, questionId);
        return getRoom(id);
    }

    static findById(id) {
        return getRoom(id);
    }

    static remove(id) {
        deleteRoom(id);
    }
}

export default RoomModel;