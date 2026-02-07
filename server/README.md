# Flyvixx Server

Backend server for the Flyvixx crash game, built with Node.js, TypeScript, and Socket.io.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Database and configuration
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models (TODO)
│   ├── routes/          # API routes
│   │   ├── auth.ts      # Authentication endpoints
│   │   ├── user.ts      # User management
│   │   └── game.ts      # Game-related endpoints
│   ├── sockets/         # WebSocket handlers
│   │   └── gameSocket.ts # Real-time game events
│   ├── utils/           # Utility functions
│   │   └── logger.ts    # Winston logger
│   └── index.ts         # Server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/user/profile` - Get user profile
- `GET /api/user/balance` - Get user balance

### Game
- `GET /api/game/history` - Get game history
- `GET /api/game/stats` - Get game statistics

### Health Check
- `GET /health` - Server health status

## 🔌 WebSocket Events

### Client → Server
- `join_game` - Join game room
- `place_bet` - Place a bet
- `cash_out` - Cash out current bet
- `heartbeat` - Connection heartbeat

### Server → Client
- `joined_game` - Confirmation of joining
- `bet_placed` - Bet placement confirmation
- `cashed_out` - Cashout confirmation
- `game_state` - Real-time game state updates

## 🗄️ Database

Currently using in-memory storage for development. To add a real database:

1. Install database driver (e.g., `pg` for PostgreSQL)
2. Update `src/config/database.ts`
3. Add database models in `src/models/`
4. Update environment variables

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | Database connection URL | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## 🧪 Development

### Adding New Routes
1. Create route file in `src/routes/`
2. Import and use in `src/index.ts`
3. Add proper error handling and logging

### Adding Socket Events
1. Update `src/sockets/gameSocket.ts`
2. Add event handlers in the connection callback
3. Use logger for debugging

### Database Integration
1. Choose database (PostgreSQL recommended)
2. Add ORM (Prisma/TypeORM)
3. Create models and migrations
4. Update database config

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set up proper logging
- Enable HTTPS in production

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Write meaningful commit messages
4. Test your changes

## 📝 License

MIT License - see LICENSE file for details.