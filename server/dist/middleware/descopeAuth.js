"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devAuth = exports.optionalDescopeAuth = exports.validateDescopeToken = void 0;
const node_sdk_1 = __importDefault(require("@descope/node-sdk"));
const logger_1 = require("../utils/logger");
const descopeClient = (0, node_sdk_1.default)({
    projectId: process.env.DESCOPE_PROJECT_ID || '',
    managementKey: process.env.DESCOPE_MANAGEMENT_KEY || '',
});
// Descope token validation middleware
const validateDescopeToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Validate the token with Descope
        const authInfo = await descopeClient.validateSession(token);
        if (!authInfo || !authInfo.token) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        // Attach user info and token to request
        req.user = authInfo.token;
        req.descopeToken = authInfo.token;
        logger_1.logger.info(`Authenticated user: ${authInfo.token.sub}`);
        next();
    }
    catch (error) {
        logger_1.logger.error('Token validation error:', error);
        res.status(401).json({ error: 'Token validation failed' });
    }
};
exports.validateDescopeToken = validateDescopeToken;
// Optional authentication middleware
const optionalDescopeAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const authInfo = await descopeClient.validateSession(token);
            if (authInfo && authInfo.token) {
                req.user = authInfo.token;
                req.descopeToken = authInfo.token;
                logger_1.logger.info(`Optional auth - authenticated user: ${authInfo.token.sub}`);
            }
        }
        next();
    }
    catch (error) {
        // Don't fail, just continue without authentication
        logger_1.logger.debug('Optional auth failed, continuing without auth:', error);
        next();
    }
};
exports.optionalDescopeAuth = optionalDescopeAuth;
// Development authentication middleware (allows dev login)
const devAuth = async (req, res, next) => {
    try {
        // Check for dev login cookie or header
        const devLogin = req.cookies?.devLogin || req.headers['x-dev-login'];
        if (devLogin === 'true') {
            // Mock user for development
            req.user = {
                sub: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
                email: 'ransomlucky234@gmail.com',
                email_verified: true,
                name: 'Dev User'
            };
            // Ensure dev user exists in database
            try {
                const { AppDataSource } = await Promise.resolve().then(() => __importStar(require('../config/database')));
                const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize();
                }
                const userRepository = AppDataSource.getRepository(User);
                let user = await userRepository.findOne({ where: { id: '550e8400-e29b-41d4-a716-446655440000' } });
                if (!user) {
                    user = new User();
                    user.id = '550e8400-e29b-41d4-a716-446655440000';
                    user.email = 'ransomlucky234@gmail.com';
                    user.passwordHash = 'dev_managed';
                    user.payoutDetails = {
                        btc: { btcAddress: '1DevTestAddress123456789' },
                        usdt: { usdtAddress: 'TDevTestAddress123456789' },
                        bank: { accountName: 'Dev User', accountNumber: '1234567890', bankName: 'Dev Bank' }
                    };
                    await userRepository.save(user);
                    logger_1.logger.info('✅ Dev user created in database');
                }
            }
            catch (dbError) {
                logger_1.logger.warn('Could not create dev user in database:', dbError);
            }
            logger_1.logger.info('Dev authentication - using mock user');
            return next();
        }
        // Fall back to normal Descope authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7);
        const authInfo = await descopeClient.validateSession(token);
        if (!authInfo || !authInfo.token) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.user = authInfo.token;
        req.descopeToken = authInfo.token;
        logger_1.logger.info(`Authenticated user: ${authInfo.token.sub}`);
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};
exports.devAuth = devAuth;
//# sourceMappingURL=descopeAuth.js.map