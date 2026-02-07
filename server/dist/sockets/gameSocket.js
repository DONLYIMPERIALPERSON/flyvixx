"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const logger_1 = require("../utils/logger");
const connectedUsers = new Map();
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        logger_1.logger.info(`🔌 User connected: ${socket.id}`);
        // Handle user joining
        socket.on('join_game', (data) => {
            const user = {
                id: data.userId,
                socketId: socket.id,
                username: data.username
            };
            connectedUsers.set(socket.id, user);
            socket.join('game_room');
            logger_1.logger.info(`🎮 User ${data.userId} joined game room`);
            socket.emit('joined_game', { success: true });
        });
        // Handle bet placement
        socket.on('place_bet', (data) => {
            logger_1.logger.info(`💰 Bet placed:`, data);
            // TODO: Implement bet logic
            socket.emit('bet_placed', { success: true, betId: 'temp_' + Date.now() });
        });
        // Handle cashout
        socket.on('cash_out', () => {
            const user = connectedUsers.get(socket.id);
            if (user) {
                logger_1.logger.info(`💸 User ${user.id} cashed out`);
                // TODO: Implement cashout logic
                socket.emit('cashed_out', { success: true });
            }
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            const user = connectedUsers.get(socket.id);
            if (user) {
                logger_1.logger.info(`🔌 User disconnected: ${user.id}`);
                connectedUsers.delete(socket.id);
            }
        });
        // Handle heartbeat
        socket.on('heartbeat', () => {
            socket.emit('heartbeat_ack');
        });
    });
    // Broadcast game state updates (for future real-time multiplier)
    const broadcastGameState = (state) => {
        io.to('game_room').emit('game_state', state);
    };
    // Export for use in other modules
    return { broadcastGameState };
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=gameSocket.js.map