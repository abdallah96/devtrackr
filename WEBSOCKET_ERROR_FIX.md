# WebSocket Connection Error Fix

## Problem Summary
The calendar and other components are experiencing a WebSocket connection error:
```
WebSocket connection to 'ws://localhost:3001/ws' failed
```

## Root Cause Analysis
The WebSocket connection error is related to React's development server hot reload functionality. The error occurs because:

1. **React Development Server Not Running**: The React development server should be running on port 3001 for hot reloading
2. **CORS Configuration**: The backend server is configured to allow connections from `http://localhost:3001`
3. **Port Mismatch**: The WebSocket is trying to connect to port 3001, but the React server isn't running there

## Evidence from Codebase
In `server.local.js`, the CORS configuration allows connections from port 3001:
```javascript
cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',  // React dev server expected here
    'http://localhost:5000',
    'http://localhost:5001',
    // ... other origins
  ],
  credentials: true
})
```

## Solution Options

### Option 1: Run React Development Server (Recommended)
Start your React development server on port 3001:

```bash
# Set the port and start React development server
PORT=3001 npm start
```

Or create a `.env` file in your project root:
```
PORT=3001
```

Then run:
```bash
npm start
```

### Option 2: Update Port Configuration
If you prefer to keep React on port 3000, update the WebSocket connection configuration.

#### Update Environment Configuration
Create or update your `.env` file:
```
# React development server port
PORT=3000
REACT_APP_WS_PORT=3000
```

#### Update package.json Scripts
Modify your `package.json` scripts to ensure consistent port usage:
```json
{
  "scripts": {
    "start": "PORT=3000 react-scripts start",
    "server": "nodemon server.local.js",
    "dev": "concurrently \"npm run server\" \"PORT=3000 npm start\""
  }
}
```

### Option 3: Disable WebSocket in Development
If you don't need hot reloading, you can disable the WebSocket connection by setting:
```
GENERATE_SOURCEMAP=false
FAST_REFRESH=false
```

## Recommended Setup

### 1. Start Backend Server (Port 5001)
```bash
npm run server
# or
node server.local.js
```

### 2. Start React Development Server (Port 3001)
```bash
PORT=3001 npm start
```

### 3. Alternative: Use the dev Script
```bash
npm run dev
```

## Verifying the Fix

### 1. Check Backend Server
```bash
curl http://localhost:5001/api/hello
```
Should return: `{"message":"Hello from local server!"}`

### 2. Check React Server
Navigate to: `http://localhost:3001`
You should see your React application without WebSocket errors.

### 3. Check Browser Console
Open browser developer tools and check the console for WebSocket errors. They should be resolved.

## Additional Troubleshooting

### If Port 3001 is Already in Use
Find and kill the process using port 3001:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

### If You Still Get WebSocket Errors
1. Clear browser cache and cookies
2. Restart both servers
3. Check firewall settings
4. Verify no other applications are using port 3001

## Current Server Configuration

Based on the codebase analysis:
- **Backend API Server**: Port 5001 (server.local.js)
- **Expected React Server**: Port 3001 (based on CORS config)
- **WebSocket Connection**: ws://localhost:3001/ws (React hot reload)

## Summary

The WebSocket error is caused by the React development server not running on the expected port (3001). Start your React development server on port 3001 to resolve the WebSocket connection errors affecting the calendar and other components.

The WebSocket connection is used for React's hot reload functionality, which enables live code updates without page refreshes during development.