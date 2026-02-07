"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const logger_1 = require("../utils/logger");
const User_1 = require("../models/User");
const Game_1 = require("../models/Game");
const Bet_1 = require("../models/Bet");
const Transaction_1 = require("../models/Transaction");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Accept self-signed certificates for development
    entities: [User_1.User, Game_1.Game, Bet_1.Bet, Transaction_1.Transaction],
    synchronize: process.env.NODE_ENV === 'development', // Auto-create tables in dev
    logging: process.env.NODE_ENV === 'development',
    poolSize: 10,
    extra: {
        connectionTimeoutMillis: 10000,
        query_timeout: 10000,
        statement_timeout: 60000,
    }
});
const connectDatabase = async () => {
    try {
        logger_1.logger.info('🔄 Connecting to PostgreSQL database...');
        await exports.AppDataSource.initialize();
        logger_1.logger.info('✅ Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
//# sourceMappingURL=database.js.map