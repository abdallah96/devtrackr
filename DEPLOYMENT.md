# G-Tracker Deployment Guide

## Overview
This app is configured to deploy on Vercel using serverless functions for the API and static hosting for the React frontend.

## Pre-deployment Setup

### 1. Database Setup
- Ensure your Postgres database is accessible from Vercel (Vercel Postgres or external provider)
- Your database should already be set up with the Prisma schema

### 2. Environment Variables
You'll need to set these in Vercel:
- `DATABASE_URL`: Your Postgres connection string

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

### 4. Set Environment Variables
In the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `DATABASE_URL` with your Postgres connection string

### 5. Run Database Migrations
After deployment, run Prisma migrations:
```bash
vercel env pull .env
npx prisma migrate deploy
```

## File Structure for Vercel

```
devtrackr/
├── api/                    # Serverless functions
│   ├── tasks.js           # GET/POST /api/tasks
│   ├── tasks/[id].js      # PUT /api/tasks/[id]
│   └── journal.js         # GET/POST /api/journal
├── src/                   # React frontend
├── prisma/               # Database schema
├── vercel.json           # Vercel configuration
└── package.json
```

## How It Works

### Development vs Production
- **Development**: Uses Express server on localhost:5001
- **Production**: Uses Vercel serverless functions at `/api/*`

### API Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task completion
- `GET /api/journal` - Get all journal entries
- `POST /api/journal` - Create new journal entry

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is set correctly
2. **CORS Errors**: CORS is handled by serverless functions
3. **Build Errors**: Check that all dependencies are in package.json

### Local Testing
To test the production build locally:
```bash
npm run build
vercel dev
```

## Migration from Express Server

The original `server.js` is kept for local development. For production:
- API routes moved to `/api/*.js` files
- CORS handled by serverless functions
- Database connections managed per request

## Next Steps

After deployment:
1. Test all functionality
2. Set up custom domain (optional)
3. Configure analytics (optional)
4. Set up monitoring (optional) 