# Authentication Setup Guide

## Overview
DevTrackr now includes user authentication with JWT tokens. Each user has their own tasks and journal entries.

## Environment Variables
Create a `.env.local` file in the root directory with:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Database Changes
The database schema has been updated to include:
- `User` table with email, password (hashed), and name
- `Task` and `JournalEntry` tables now have `userId` foreign keys
- All data is now user-specific

## New Features
1. **User Registration**: Users can create accounts with email and password
2. **User Login**: Secure authentication with JWT tokens
3. **User Logout**: Clear session and return to login screen
4. **Data Isolation**: Each user only sees their own tasks and journal entries
5. **Session Persistence**: Users stay logged in across browser sessions

## API Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- All existing endpoints now require authentication headers

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- User data isolation
- Input validation
- Error handling

## Usage
1. Start the application
2. Register a new account or login
3. All your data will be private to your account
4. Use the logout button to sign out

## Development
- Install dependencies: `npm install`
- Set up environment variables
- Run database migrations: `npx prisma db push`
- Start development server: `npm run dev` 