# Setup Instructions

Follow these steps to set up and run the Senior-Junior Interaction Platform backend.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

## Installation Steps

### 1. Clone or Navigate to Project Directory

```bash
cd c:\Users\Asus\Desktop\projects\senior_junior_interaction
```

### 2. Navigate to Backend Directory

```bash
cd backend
```

### 3. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 4. Set Up Environment Variables

Copy the `.env.example` file to create your `.env` file:

```bash
copy .env.example .env
```

Edit the `.env` file and update the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Update with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/senior_junior_platform

# JWT Secret - Change this to a secure random string
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# OAuth - Google (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth - GitHub (Get from GitHub Developer Settings)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Session Secret - Change this to a secure random string
SESSION_SECRET=your_session_secret_change_this_in_production

# Frontend URL (Update when deploying)
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 4. Set Up MongoDB

**Option A: Local MongoDB**
- Ensure MongoDB is running on your system
- Default connection: `mongodb://localhost:27017/senior_junior_platform`

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

### 5. Set Up OAuth (Optional but Recommended)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Senior-Junior Platform
   - Homepage URL: `http://localhost:5000`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### 6. Create Uploads Directory

```bash
mkdir uploads
```

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`)

## Verify Installation

Once the server is running, you should see output like:

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Server is running on port 5000                          ║
║   📝 Environment: development                                 ║
║   🔗 API: http://localhost:5000                              ║
║   💬 WebSocket: ws://localhost:5000                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
MongoDB Connected: localhost
```

### Test the API

Open your browser or use curl to test:

```bash
curl http://localhost:5000
```

You should receive:
```json
{
  "success": true,
  "message": "Welcome to Senior-Junior Interaction Platform API",
  "version": "1.0.0"
}
```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running: `mongod` (or check your MongoDB service)
- Verify the connection string in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- Change the PORT in `.env` to a different number (e.g., 5001)
- Or kill the process using port 5000

### OAuth Errors

**Error:** OAuth authentication fails

**Solution:**
- Verify OAuth credentials in `.env`
- Check redirect URIs match exactly in OAuth provider settings
- Ensure `FRONTEND_URL` is set correctly

### File Upload Errors

**Error:** Cannot upload files

**Solution:**
- Ensure `uploads` directory exists
- Check file permissions
- Verify `MAX_FILE_SIZE` in `.env`

## Next Steps

1. **Test all endpoints** using the examples in `API_EXAMPLES.md`
2. **Connect a frontend** application to consume this API
3. **Deploy to production** (see deployment guide below)

## Production Deployment Checklist

- [ ] Update all secrets in `.env` with secure random strings
- [ ] Use MongoDB Atlas or production MongoDB instance
- [ ] Update `FRONTEND_URL` with production URL
- [ ] Update OAuth redirect URIs with production URLs
- [ ] Set `NODE_ENV=production`
- [ ] Use a process manager like PM2 or Docker
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domain only
- [ ] Set up logging and monitoring
- [ ] Configure database backups

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Passport.js Documentation](http://www.passportjs.org/)

## Support

For issues or questions, please check:
- API documentation in `README.md`
- API examples in `API_EXAMPLES.md`
- Error messages in terminal output
