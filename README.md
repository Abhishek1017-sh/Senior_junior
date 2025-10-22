# Senior-Junior Interaction Platform - Backend

A comprehensive backend API for a mentorship platform connecting students (juniors) with experienced seniors and industry professionals.

## Features

- 🔐 JWT-based authentication with social login (Google/GitHub OAuth)
- 👥 User profiles with junior and senior roles
- 🤝 Connection management between juniors and seniors
- 📅 Session booking and management
- ⭐ Review and rating system
- 💬 Real-time chat using Socket.io
- 📸 Profile picture upload

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, Passport.js (OAuth)
- **Real-time:** Socket.io
- **File Upload:** Multer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your actual values

6. Create uploads directory:
   ```bash
   mkdir uploads
   ```

### Running the Application

Development mode:
```bash
cd backend
npm run dev
```

Production mode:
```bash
cd backend
npm start
```

## API Documentation

### Authentication Endpoints (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user profile (protected)

### User Endpoints (`/api/users`)

- `GET /api/users/seniors` - Get all seniors
- `GET /api/users/seniors/search` - Search seniors by skills/interests
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/profile` - Update user profile (protected)

### Connection Endpoints (`/api/connections`)

- `POST /api/connections/request/:seniorId` - Send connection request (protected)
- `POST /api/connections/accept/:juniorId` - Accept connection request (protected, senior only)
- `GET /api/connections` - Get all connections (protected)

### Session Endpoints (`/api/sessions`)

- `POST /api/sessions/book` - Book a session (protected)
- `PUT /api/sessions/:sessionId/confirm` - Confirm session (protected, senior only)
- `PUT /api/sessions/:sessionId/cancel` - Cancel session (protected)
- `GET /api/sessions` - Get all sessions (protected)

### Review Endpoints (`/api/reviews`)

- `POST /api/reviews` - Submit a review (protected)
- `GET /api/reviews/senior/:seniorId` - Get reviews for a senior

## Socket.io Events

- `join` - Join a chat room
- `sendMessage` - Send a message
- `typing` - User is typing
- `stopTyping` - User stopped typing

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── Review.js
│   │   └── ChatMessage.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── connectionController.js
│   │   ├── sessionController.js
│   │   └── reviewController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── connectionRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── reviewRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── sockets/
│   │   └── chatSocket.js
│   └── server.js
├── uploads/
├── .env.example
├── package.json
├── Dockerfile
├── docker-compose.yml
└── Procfile
```

## License

ISC
