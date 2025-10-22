### Example API Usage

Below are examples of how to use the API endpoints using curl or any HTTP client.

---

## Authentication

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "role": "junior",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "interests": ["Web Development", "AI/ML"]
    }
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Users & Profiles

### Get All Seniors
```bash
curl -X GET "http://localhost:5000/api/users/seniors?page=1&limit=10"
```

### Search Seniors
```bash
# Search by skill
curl -X GET "http://localhost:5000/api/users/seniors/search?skill=React"

# Search by interest
curl -X GET "http://localhost:5000/api/users/seniors/search?interest=Web%20Development"

# Search by name
curl -X GET "http://localhost:5000/api/users/seniors/search?name=John"
```

### Get User Profile
```bash
curl -X GET http://localhost:5000/api/users/USER_ID
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "bio": "Full-stack developer passionate about mentoring"
    },
    "role": "senior",
    "seniorProfile": {
      "skills": ["React", "Node.js", "MongoDB"],
      "experience": "Software Engineer at Tech Corp",
      "hourlyRate": 50
    }
  }'
```

### Upload Profile Picture
```bash
curl -X POST http://localhost:5000/api/users/profile/picture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg"
```

---

## Connections

### Send Connection Request
```bash
curl -X POST http://localhost:5000/api/connections/request/SENIOR_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Accept Connection Request (Senior Only)
```bash
curl -X POST http://localhost:5000/api/connections/accept/JUNIOR_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Connections
```bash
curl -X GET http://localhost:5000/api/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Remove Connection
```bash
curl -X DELETE http://localhost:5000/api/connections/CONNECTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Sessions

### Book a Session
```bash
curl -X POST http://localhost:5000/api/sessions/book \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seniorId": "SENIOR_USER_ID",
    "topic": "React Best Practices",
    "scheduledTime": "2025-11-01T10:00:00Z",
    "duration": 60,
    "notes": "I want to learn about hooks and state management"
  }'
```

### Confirm Session (Senior Only)
```bash
curl -X PUT http://localhost:5000/api/sessions/SESSION_ID/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meetingLink": "https://meet.google.com/abc-defg-hij"
  }'
```

### Cancel Session
```bash
curl -X PUT http://localhost:5000/api/sessions/SESSION_ID/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Sessions
```bash
# Get all sessions
curl -X GET http://localhost:5000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only upcoming sessions
curl -X GET "http://localhost:5000/api/sessions?upcoming=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get sessions by status
curl -X GET "http://localhost:5000/api/sessions?status=confirmed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mark Session as Completed (Senior Only)
```bash
curl -X PUT http://localhost:5000/api/sessions/SESSION_ID/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Reviews & Ratings

### Submit a Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID",
    "rating": 5,
    "comment": "Excellent mentor! Very helpful and knowledgeable."
  }'
```

### Get Reviews for a Senior
```bash
curl -X GET "http://localhost:5000/api/reviews/senior/SENIOR_ID?page=1&limit=10"
```

### Get My Reviews
```bash
curl -X GET http://localhost:5000/api/reviews/my-reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## WebSocket Chat

### JavaScript Client Example

```javascript
import { io } from 'socket.io-client';

// Connect with JWT token
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Join a chat with another user
socket.emit('join', { recipientId: 'RECIPIENT_USER_ID' });

// Listen for chat history
socket.on('chatHistory', ({ messages }) => {
  console.log('Chat history:', messages);
});

// Send a message
socket.emit('sendMessage', {
  recipientId: 'RECIPIENT_USER_ID',
  message: 'Hello! How are you?'
});

// Listen for new messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Typing indicator
socket.emit('typing', { recipientId: 'RECIPIENT_USER_ID' });

// Stop typing
socket.emit('stopTyping', { recipientId: 'RECIPIENT_USER_ID' });

// Listen for typing indicator
socket.on('userTyping', ({ userId, username }) => {
  console.log(`${username} is typing...`);
});

// Mark messages as read
socket.emit('markAsRead', { senderId: 'SENDER_USER_ID' });
```

---

## OAuth Authentication

### Google OAuth Flow
1. Navigate to: `http://localhost:5000/api/auth/google`
2. User will be redirected to Google login
3. After successful authentication, user is redirected to frontend with token

### GitHub OAuth Flow
1. Navigate to: `http://localhost:5000/api/auth/github`
2. User will be redirected to GitHub login
3. After successful authentication, user is redirected to frontend with token

---

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if any */ ]
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```
