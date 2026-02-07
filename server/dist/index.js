"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const gameSocket_1 = require("./sockets/gameSocket");
const database_1 = require("./config/database");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const game_1 = __importDefault(require("./routes/game"));
const transaction_1 = __importDefault(require("./routes/transaction"));
const otp_1 = __importDefault(require("./routes/otp"));
const safehaven_1 = __importDefault(require("./routes/safehaven"));
const referral_1 = __importDefault(require("./routes/referral"));
const notification_1 = __importDefault(require("./routes/notification"));
const app = (0, express_1.default)();
/** * PRO-TIP: Trust Proxy
 * Required for Cloudflare and Rate Limiting to work correctly.
 */
app.set('trust proxy', 1);
const server = (0, http_1.createServer)(app);
// Use the environment variable for the frontend domain
const frontendUrl = process.env.FRONTEND_URL || "https://flyvixx.com";
const io = new socket_io_1.Server(server, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
// Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: frontendUrl,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
app.use(rateLimiter_1.rateLimiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/user', user_1.default);
app.use('/api/game', game_1.default);
app.use('/api/transactions', transaction_1.default);
app.use('/api/otp', otp_1.default);
app.use('/api/safehaven', safehaven_1.default);
app.use('/api/referral', referral_1.default);
app.use('/api/notifications', notification_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Socket.io setup
(0, gameSocket_1.setupSocketHandlers)(io);
// Start server
const PORT = process.env.PORT || 3001;
async function startServer() {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 Flyvixx Server running on port ${PORT}`);
            logger_1.logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
            logger_1.logger.info(`🔗 Frontend URL: ${frontendUrl}`);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('✅ Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('✅ Server closed');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map