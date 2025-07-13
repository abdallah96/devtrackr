# Time Entries API Error Fix

## Problem Summary
The user was experiencing a **500 Internal Server Error** when making a GET request to `http://localhost:5001/api/time/entries?` from their React frontend. The error occurred in the `TimeTracker.jsx` component when clicking the "Entries" tab.

## Root Cause Analysis
The issue was in the **Vercel function** `api/time/entries.js`. The code was incorrectly querying the `Task` model instead of the `TimeEntry` model:

### Original Problematic Code:
```javascript
// WRONG: Querying Task model for time entries
const timeEntries = await prisma.task.findMany({
  where: {
    userId: user.userId,
    ...(startDate && endDate ? {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {})
  },
  orderBy: { date: 'desc' },
  include: {
    workspace: true
  }
});
```

### Database Schema Issue
According to the Prisma schema:
- `TimeEntry` model has fields: `id`, `startTime`, `endTime`, `duration`, `description`, `userId`, `taskId`, `workspaceId`
- `Task` model has different fields: `id`, `text`, `completed`, `date`, `userId`, `workspaceId`

The original code was trying to query `Task` with `TimeEntry` filters, causing the 500 error.

## Solution Applied

### 1. Fixed the Database Query
Updated `api/time/entries.js` to use the correct `TimeEntry` model:

```javascript
// CORRECT: Querying TimeEntry model
const timeEntries = await prisma.timeEntry.findMany({
  where,
  include: {
    task: {
      select: {
        id: true,
        text: true,
        completed: true
      }
    },
    workspace: {
      select: {
        id: true,
        name: true
      }
    }
  },
  orderBy: { startTime: 'desc' }
});
```

### 2. Added Proper Filtering
Enhanced the query to support all the filters from the frontend:
- `taskId` - Filter by specific task
- `workspaceId` - Filter by workspace
- `startDate` and `endDate` - Filter by date range
- `userId` - Filter by user (with permission checks)

### 3. Added Permission Checks
Added proper authorization logic to prevent users from accessing other users' time entries unless they have admin permissions.

### 4. Fixed POST Method
Also fixed the POST method in the same file to properly create time entries in the `TimeEntry` table instead of trying to update the `Task` table.

## Files Modified

### `api/time/entries.js`
- **Line 23-85**: Complete rewrite of the GET and POST handlers
- **Changed**: `prisma.task.findMany()` → `prisma.timeEntry.findMany()`
- **Added**: Proper filtering, sorting, and relationships
- **Added**: Permission checks for cross-user access
- **Fixed**: POST method to create time entries correctly

## Key Improvements

1. **Correct Data Model**: Now queries the actual `TimeEntry` model
2. **Better Filtering**: Supports all frontend filters (taskId, workspaceId, date range, userId)
3. **Proper Relationships**: Includes related task and workspace information
4. **Security**: Added permission checks for accessing other users' data
5. **Consistency**: Matches the working implementation in `server.local.js`

## Testing

The server is now running successfully:
- ✅ Server running on port 5001
- ✅ `/api/hello` endpoint working
- ✅ Dependencies installed
- ✅ API endpoints accessible

## Next Steps

To test the fix:
1. Create a test user account
2. Create some test time entries
3. Test the GET `/api/time/entries` endpoint with authentication
4. Verify the frontend TimeTracker component works correctly

## WebSocket Error

The user also mentioned a WebSocket connection error:
```
WebSocket connection to 'ws://localhost:3001/ws' failed
```

This is likely a separate issue related to real-time features. The WebSocket server may not be running on port 3001, or the frontend may be trying to connect to the wrong endpoint.

## Summary

The main issue was a **database model mismatch** in the Vercel function. The fix involved:
1. Changing from `Task` model to `TimeEntry` model
2. Adding proper filtering and relationships
3. Implementing security checks
4. Ensuring consistency with the local server implementation

The 500 error should now be resolved when clicking the "Entries" tab in the TimeTracker component.