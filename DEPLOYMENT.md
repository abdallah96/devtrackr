# 🚀 Vercel Deployment Guide

This guide will help you deploy G-Tracker to Vercel successfully.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Use [Neon](https://neon.tech) (free) or [Supabase](https://supabase.com)
3. **GitHub Repository**: Your code should be pushed to GitHub

## Step 1: Database Setup

### Option A: Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string

### Option B: Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string

## Step 2: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: g-tracker
# - Directory: ./devtrackr
# - Override settings? No
```

### Method 2: GitHub Integration
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Other
   - **Root Directory**: devtrackr
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: build

## Step 3: Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** > **Environment Variables**
2. Add these variables:

```
DATABASE_URL=your_postgres_connection_string
NODE_ENV=production
```

3. Click **Save**

## Step 4: Database Migration

After deployment, run database migrations:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run migrations
vercel env pull .env
npx prisma db push
```

## Step 5: Update Frontend API URL

Update your frontend to use the production API:

1. In Vercel dashboard, copy your deployment URL
2. Update `src/api.js` to use the production URL:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-domain.vercel.app/api' 
  : 'http://localhost:5001/api';
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that `vercel-build` script exists in package.json
   - Ensure all dependencies are in `dependencies` (not `devDependencies`)

2. **Database Connection Fails**
   - Verify DATABASE_URL is set correctly
   - Check if database allows external connections
   - Ensure database is running

3. **API Routes Not Working**
   - Check that API files are in `/api` directory
   - Verify CORS headers are set correctly
   - Check Vercel function logs

4. **Prisma Client Issues**
   - Run `npx prisma generate` locally
   - Ensure `@prisma/client` is in dependencies
   - Check that schema.prisma is correct

### Debug Commands:

```bash
# Check build logs
vercel logs

# Check function logs
vercel logs --function api/tasks

# Redeploy with debug info
vercel --debug
```

## Production Checklist

- [ ] Database is set up and accessible
- [ ] Environment variables are configured
- [ ] Database migrations are run
- [ ] API routes are working
- [ ] Frontend is connecting to production API
- [ ] CORS is configured correctly
- [ ] Build is successful
- [ ] Domain is configured (optional)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity

Your app should now be live at `https://your-project.vercel.app`! 🎉 