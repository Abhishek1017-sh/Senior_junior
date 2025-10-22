# Deployment Guide

This guide covers deploying the Senior-Junior Interaction Platform backend to various cloud platforms.

## Table of Contents
1. [Heroku Deployment](#heroku-deployment)
2. [AWS EC2 Deployment](#aws-ec2-deployment)
3. [DigitalOcean Deployment](#digitalocean-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed
- Git repository

### Steps

1. **Install Heroku CLI**
```bash
# Windows (with chocolatey)
choco install heroku-cli

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
heroku create your-app-name
```

4. **Add MongoDB Add-on**
```bash
heroku addons:create mongolab:sandbox
```

5. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_jwt_secret_here
heroku config:set SESSION_SECRET=your_session_secret_here
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set GITHUB_CLIENT_ID=your_github_client_id
heroku config:set GITHUB_CLIENT_SECRET=your_github_client_secret
heroku config:set FRONTEND_URL=https://your-frontend-url.com
heroku config:set NODE_ENV=production
```

6. **Create Procfile**
```bash
cd backend
echo "web: node src/server.js" > Procfile
```

7. **Deploy**
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

8. **Open Your App**
```bash
heroku open
```

---

## AWS EC2 Deployment

### Prerequisites
- AWS account
- EC2 instance running Ubuntu/Amazon Linux
- SSH access to instance

### Steps

1. **SSH into EC2 Instance**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install Node.js and npm**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install MongoDB**
```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **Clone Your Repository**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

5. **Install Dependencies**
```bash
npm install
```

6. **Create .env File**
```bash
nano .env
# Add your environment variables
```

7. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

8. **Start Application with PM2**
```bash
cd backend
pm2 start src/server.js --name senior-junior-api
pm2 startup
pm2 save
```

9. **Configure Nginx as Reverse Proxy**
```bash
sudo apt-get install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/api

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Set Up SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## DigitalOcean Deployment

### Using DigitalOcean App Platform

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `cd backend && npm install`
   - Run Command: `cd backend && node src/server.js`

3. **Add Environment Variables**
   - In App Platform dashboard, add all environment variables

4. **Add MongoDB Database**
   - Create a MongoDB cluster in DigitalOcean
   - Get connection string and add to environment variables

5. **Deploy**
   - Click "Deploy"
   - App Platform will build and deploy automatically

---

## Docker Deployment

### Create Dockerfile

```dockerfile
# Create this file: backend/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "src/server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/senior_junior_platform
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - mongo
    volumes:
      - ./uploads:/usr/src/app/uploads

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```
```

### Deploy with Docker

```bash
# Navigate to backend directory
cd backend

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

## Environment Variables

### Required Variables
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://your-mongodb-uri

# JWT
JWT_SECRET=your-super-secret-jwt-key-use-strong-random-string
JWT_EXPIRE=7d

# Session
SESSION_SECRET=your-session-secret-use-strong-random-string

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-domain.com/api/auth/github/callback

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

---

## Post-Deployment Checklist

### Security
- [ ] Change all default secrets (JWT_SECRET, SESSION_SECRET)
- [ ] Enable HTTPS/SSL
- [ ] Update CORS origins to production URLs only
- [ ] Set secure cookie options
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Configure MongoDB authentication
- [ ] Update OAuth redirect URIs to production URLs

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database indexes
- [ ] Enable MongoDB connection pooling
- [ ] Set up caching (Redis)
- [ ] Monitor memory usage

### Monitoring
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring (New Relic, DataDog)
- [ ] Configure alerts for errors
- [ ] Set up log aggregation

### Backup
- [ ] Configure MongoDB automated backups
- [ ] Set up file storage backups
- [ ] Test restore procedures
- [ ] Document backup schedule

### Testing
- [ ] Test all API endpoints
- [ ] Verify OAuth flows
- [ ] Test WebSocket connections
- [ ] Load test the API
- [ ] Test error handling

### Documentation
- [ ] Update API documentation with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedures

---

## Generating Strong Secrets

Use these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs

# Restart application
pm2 restart all

# Check for port conflicts
sudo lsof -i :5000
```

### WebSocket Connection Fails
- Ensure your reverse proxy (nginx) supports WebSocket upgrade
- Check firewall rules allow WebSocket connections
- Verify CORS settings include WebSocket origins

---

## Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancer (AWS ELB, nginx)
   - Implement sticky sessions for Socket.io
   - Use Redis adapter for Socket.io clustering

2. **Database Scaling**
   - Set up MongoDB replica sets
   - Enable sharding for large datasets
   - Use read replicas for queries

3. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static assets

---

## Support

For deployment issues:
- Check server logs
- Review environment variables
- Verify database connectivity
- Check firewall/security group settings
