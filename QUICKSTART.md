# Quick Start Guide

Get your Senior-Junior Interaction Platform backend up and running in 5 minutes!

## 📋 Prerequisites

✅ Node.js v14+ installed  
✅ MongoDB installed and running  
✅ Git installed  

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
cd c:\Users\Asus\Desktop\projects\senior_junior_interaction
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
copy .env.example .env

# Edit .env and update these minimum required values:
# - MONGODB_URI (default: mongodb://localhost:27017/senior_junior_platform)
# - JWT_SECRET (generate a random string)
# - SESSION_SECRET (generate another random string)
```

**Generate secrets:**
```bash
# Run this in PowerShell/Terminal to generate secure secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

**You should see:**
```
╔═══════════════════════════════════════════════════════════════╗
║   🚀 Server is running on port 5000                          ║
║   📝 Environment: development                                 ║
║   🔗 API: http://localhost:5000                              ║
║   💬 WebSocket: ws://localhost:5000                          ║
╚═══════════════════════════════════════════════════════════════╝
MongoDB Connected: localhost
```

## ✅ Verify Installation

Open your browser or use curl:
```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "success": true,
  "message": "Welcome to Senior-Junior Interaction Platform API",
  "version": "1.0.0"
}
```

## 🧪 Test the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"test123\",\"role\":\"junior\"}"
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

Save the `token` from the response!

### 3. Get Your Profile
```bash
curl http://localhost:5000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📚 Next Steps

1. **Read Full Documentation**
   - `README.md` - Project overview
   - `SETUP.md` - Detailed setup instructions
   - `API_EXAMPLES.md` - Complete API examples

2. **Test with Postman**
   - Import `postman_collection.json` into Postman
   - Set the `baseUrl` variable to `http://localhost:5000`
   - Start testing all endpoints!

3. **Enable OAuth (Optional)**
   - Set up Google OAuth credentials
   - Set up GitHub OAuth credentials
   - Update `.env` with OAuth credentials
   - See `SETUP.md` for detailed instructions

4. **Start Building Your Frontend**
   - API is ready at `http://localhost:5000`
   - WebSocket available at `ws://localhost:5000`
   - All endpoints documented in `API_EXAMPLES.md`

## 🎯 Core Features Available

✨ **User Authentication**
- JWT-based auth
- Social login (Google/GitHub)
- Role-based access (Junior/Senior/Both)

✨ **User Profiles**
- Create and update profiles
- Upload profile pictures
- Search seniors by skills/interests

✨ **Connections**
- Send connection requests
- Accept connections
- Manage connections

✨ **Session Booking**
- Book mentorship sessions
- Confirm sessions
- Cancel sessions
- Complete sessions

✨ **Reviews & Ratings**
- Submit reviews
- View senior ratings
- Automatic rating calculations

✨ **Real-time Chat**
- One-to-one messaging
- Typing indicators
- Chat history
- Read receipts

## 🆘 Troubleshooting

### MongoDB Connection Error
**Problem:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Start MongoDB
mongod

# Or if installed as service (Windows)
net start MongoDB
```

### Port 5000 Already in Use
**Problem:** `EADDRINUSE: address already in use :::5000`

**Solution:** Change `PORT=5001` in `.env` file

### npm install fails
**Problem:** Dependency installation errors

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support & Resources

- **Project Structure:** See `PROJECT_STRUCTURE.md`
- **Deployment Guide:** See `DEPLOYMENT.md`
- **API Examples:** See `API_EXAMPLES.md`
- **Setup Details:** See `SETUP.md`

## 🎉 You're All Set!

Your backend is now running and ready to handle requests. Start building your frontend or test the API using the provided Postman collection.

Happy coding! 🚀
