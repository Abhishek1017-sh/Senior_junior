# Project Structure Visualization

```
senior_junior_interaction/
│
├── backend/                               # Backend application directory
│   ├── src/                               # Source code directory
│   │   ├── config/                        # Configuration files
│   │   │   ├── db.js                      # MongoDB connection setup
│   │   │   └── passport.js                # Passport OAuth strategies (Google/GitHub)
│   │   │
│   │   ├── models/                        # Mongoose models (Database schemas)
│   │   │   ├── User.js                    # User model with profiles, roles, connections
│   │   │   ├── Session.js                 # Session booking model
│   │   │   ├── Review.js                  # Review and rating model
│   │   │   └── ChatMessage.js             # Chat message model
│   │   │
│   │   ├── controllers/                   # Business logic controllers
│   │   │   ├── authController.js          # Authentication logic (register, login, OAuth)
│   │   │   ├── userController.js          # User management (profiles, search, updates)
│   │   │   ├── connectionController.js    # Connection management between users
│   │   │   ├── sessionController.js       # Session booking and management
│   │   │   └── reviewController.js        # Review submission and retrieval
│   │   │
│   │   ├── routes/                        # API route definitions
│   │   │   ├── authRoutes.js              # /api/auth/* endpoints
│   │   │   ├── userRoutes.js              # /api/users/* endpoints
│   │   │   ├── connectionRoutes.js        # /api/connections/* endpoints
│   │   │   ├── sessionRoutes.js           # /api/sessions/* endpoints
│   │   │   └── reviewRoutes.js            # /api/reviews/* endpoints
│   │
│   ├── middleware/                        # Express middleware
│   │   ├── auth.js                        # JWT authentication & role-based access
│   │   ├── errorHandler.js                # Global error handling
│   │   └── upload.js                      # File upload (multer) configuration
│   │
│   ├── utils/                             # Utility functions
│   │   └── generateToken.js               # JWT token generation and verification
│   │
│   ├── sockets/                           # WebSocket logic
│   │   └── chatSocket.js                  # Socket.io chat implementation
│   │
│   └── server.js                          # Main application entry point
│
│   ├── uploads/                           # Uploaded files (profile pictures)
│   │   └── .gitkeep                       # Keep folder in git
│   │
│   ├── .env                               # Environment variables (create from .env.example)
│   ├── .env.example                       # Environment variables template
│   ├── .gitignore                         # Git ignore rules
│   ├── package.json                       # Project dependencies and scripts
│   ├── jsconfig.json                      # JavaScript configuration
│   ├── Dockerfile                         # Docker container configuration
│   ├── docker-compose.yml                 # Docker Compose configuration
│   └── Procfile                           # Heroku deployment configuration
│
├── README.md                              # Project documentation
├── SETUP.md                               # Detailed setup instructions
├── API_EXAMPLES.md                        # API usage examples
├── PROJECT_STRUCTURE.md                   # This file - project structure overview
├── DEPLOYMENT.md                          # Deployment guides for various platforms
└── postman_collection.json                # Postman API collection for testing
```

## Key Components

### Models (Database Schemas)
- **User**: Stores user data, profiles, roles (junior/senior/both), social logins
- **Session**: Manages mentorship sessions between juniors and seniors
- **Review**: Stores ratings and reviews for completed sessions
- **ChatMessage**: Real-time chat messages between users

### Controllers (Business Logic)
- **authController**: Handles registration, login, OAuth, and user authentication
- **userController**: Manages user profiles, search, and updates
- **connectionController**: Handles connection requests between juniors and seniors
- **sessionController**: Manages session booking, confirmation, cancellation
- **reviewController**: Handles review submission with automatic rating calculations

### Routes (API Endpoints)
All routes follow RESTful conventions:
- **authRoutes**: Authentication endpoints
- **userRoutes**: User and profile management
- **connectionRoutes**: Connection management
- **sessionRoutes**: Session booking and management
- **reviewRoutes**: Review and rating system

### Middleware
- **auth.js**: JWT verification, role-based access control
- **errorHandler.js**: Centralized error handling
- **upload.js**: File upload configuration for profile pictures

### Real-time Chat
- **chatSocket.js**: Socket.io implementation for real-time messaging with authentication

## Data Flow

### 1. Authentication Flow
```
User → POST /api/auth/register → Controller → Hash Password → Save to DB → Generate JWT → Return Token
User → POST /api/auth/login → Controller → Verify Password → Generate JWT → Return Token
User → GET /api/auth/me → Middleware (verify JWT) → Controller → Return User Data
```

### 2. Session Booking Flow
```
Junior → POST /api/sessions/book → isAuthenticated → Controller → Create Session (pending) → DB
Senior → PUT /api/sessions/:id/confirm → isAuthenticated + isSenior → Update Status (confirmed) → DB
Either → PUT /api/sessions/:id/cancel → isAuthenticated → Update Status (cancelled) → DB
Senior → PUT /api/sessions/:id/complete → isAuthenticated + isSenior → Update Status (completed) → DB
```

### 3. Review Flow
```
User → POST /api/reviews → isAuthenticated → Verify Session Completed → Create Review → DB
System → Calculate Average Rating → Update Senior Profile → DB
Anyone → GET /api/reviews/senior/:id → Controller → Return Reviews → JSON
```

### 4. Real-time Chat Flow
```
User → Connect WebSocket with JWT → Authenticate → Join Personal Room
User → Emit 'join' with recipientId → Join Chat Room → Load Chat History
User → Emit 'sendMessage' → Save to DB → Broadcast to Room → Recipient Receives
User → Emit 'typing' → Broadcast to Room → Show Typing Indicator
```

## Security Features

✅ **Password Hashing**: bcrypt with salt rounds
✅ **JWT Authentication**: Stateless token-based authentication
✅ **Role-Based Access Control**: isAuthenticated, isSenior, isJunior middleware
✅ **Input Validation**: Mongoose schema validation
✅ **OAuth Integration**: Google and GitHub social login
✅ **Secure Headers**: Helmet.js for security headers
✅ **CORS Protection**: Configured for specific origins
✅ **File Upload Validation**: Type and size restrictions

## API Features

✨ **RESTful Design**: Standard HTTP methods and status codes
✨ **Pagination**: Built-in pagination for list endpoints
✨ **Search & Filter**: Advanced search for seniors by skills, interests, name
✨ **Real-time Communication**: Socket.io for instant messaging
✨ **File Uploads**: Profile picture upload with validation
✨ **Error Handling**: Consistent error response format
✨ **Session Management**: Complete booking lifecycle management
✨ **Rating System**: Automatic calculation of senior average ratings
