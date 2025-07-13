const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// Get JWT secret from environment or generate a random one
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex');

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

const googleOAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const app = express();

// CORS configuration - Dynamic for development and production
const allowedOrigins = [
  // Development origins
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5002',
  'http://localhost:3002',
  'http://localhost:3003',
  // Production origins (add your domain here)
  'https://devtrackr-one.vercel.app/',
  'https://devtrackr-one.vercel.app/',
  // Electron app origins
  'file://',
  'app://',
  // Allow all localhost ports for development
  /^https?:\/\/localhost:\d+$/,
  /^https?:\/\/127\.0\.0\.1:\d+$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches regex patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static('build'));

const prisma = new PrismaClient();

// Basic hello route for testing
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: "Hello from local server!" });
});

// JWT verification middleware
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },  // Only include id and email in the token
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        createdAt: userWithoutPassword.createdAt,
        updatedAt: userWithoutPassword.updatedAt
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        createdAt: userWithoutPassword.createdAt,
        updatedAt: userWithoutPassword.updatedAt
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes - require authentication
// Get all tasks for authenticated user
app.get('/api/tasks', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task for authenticated user
app.post('/api/tasks', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { text, date } = req.body;
    const task = await prisma.task.create({
      data: { 
        text, 
        date: new Date(date), 
        completed: false,
        userId: user.userId
      }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task completion or text (check ownership)
app.put('/api/tasks/:id', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.params;
    const { completed, text } = req.body;
    
    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: parseInt(id), userId: user.userId }
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updateData = {};
    if (completed !== undefined) updateData.completed = completed;
    if (text !== undefined) updateData.text = text;
    
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task (check ownership)
app.delete('/api/tasks', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.query;
    
    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: parseInt(id), userId: user.userId }
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all journal entries for authenticated user
app.get('/api/journal', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new journal entry for authenticated user
app.post('/api/journal', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { text, date } = req.body;
    const entry = await prisma.journalEntry.create({
      data: { 
        text, 
        date: new Date(date),
        userId: user.userId
      }
    });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update journal entry (check ownership)
app.put('/api/journal/:id', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.params;
    const { text } = req.body;
    
    // Verify journal entry belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: { id: parseInt(id), userId: user.userId }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    const entry = await prisma.journalEntry.update({
      where: { id: parseInt(id) },
      data: { text }
    });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a journal entry (check ownership)
app.delete('/api/journal', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.query;
    
    // Verify journal entry belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: { id: parseInt(id), userId: user.userId }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    await prisma.journalEntry.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google Calendar Integration Routes
app.get('/api/auth/google/url', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  res.status(503).json({ 
    error: 'Google Calendar integration is temporarily unavailable',
    message: 'This feature is currently under maintenance. Please try again later.'
  });
});

app.post('/api/auth/google/callback', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  res.status(503).json({ 
    error: 'Google Calendar integration is temporarily unavailable',
    message: 'This feature is currently under maintenance. Please try again later.'
  });
});

app.get('/api/calendar/events', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { startDate, endDate } = req.query;
    
    // Get tasks and journal entries for the calendar
    const [tasks, journalEntries] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId: user.userId,
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        include: {
          workspace: true
        }
      }),
      prisma.journalEntry.findMany({
        where: {
          userId: user.userId,
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        include: {
          workspace: true
        }
      })
    ]);

    // Format events for calendar
    const events = [
      ...tasks.map(task => ({
        id: `task-${task.id}`,
        title: task.text,
        start: task.date,
        end: task.date,
        allDay: true,
        type: 'task',
        completed: task.completed,
        workspace: task.workspace
      })),
      ...journalEntries.map(entry => ({
        id: `journal-${entry.id}`,
        title: entry.text,
        start: entry.date,
        end: entry.date,
        allDay: true,
        type: 'journal',
        workspace: entry.workspace
      }))
    ];

    res.status(200).json(events);
  } catch (error) {
    console.error('Calendar events API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/calendar/sync', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  res.status(503).json({ 
    error: 'Google Calendar integration is temporarily unavailable',
    message: 'This feature is currently under maintenance. Please try again later.'
  });
});

// Workspace Management Routes
app.get('/api/workspaces', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId } } }
        ]
      },
      include: {
        owner: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            createdAt: true,
            updatedAt: true
          }
        },
        members: {
          include: {
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        _count: {
          select: { tasks: true, journalEntries: true }
        }
      }
    });
    
    res.json(workspaces);
  } catch (error) {
    console.error('Workspaces fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

app.post('/api/workspaces', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }
    
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        color,
        ownerId: user.userId
      },
      include: {
        owner: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            createdAt: true,
            updatedAt: true
          }
        },
        members: {
          include: {
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });
    
    res.json(workspace);
  } catch (error) {
    console.error('Workspace creation error:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

app.put('/api/workspaces/:id', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    
    // Check if user is owner or admin
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId, role: 'admin' } } }
        ]
      }
    });
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }
    
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: parseInt(id) },
      data: { name, description, color },
      include: {
        owner: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            createdAt: true,
            updatedAt: true
          }
        },
        members: {
          include: {
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });
    
    res.json(updatedWorkspace);
  } catch (error) {
    console.error('Workspace update error:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

app.post('/api/workspaces/:id/invite', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.params;
    const { email, role = 'member' } = req.body;
    
    // Check if user is owner or admin
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId, role: 'admin' } } }
        ]
      }
    });
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }
    
    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add user to workspace
    const member = await prisma.workspaceMember.create({
      data: {
        userId: invitedUser.id,
        workspaceId: parseInt(id),
        role
      },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
    
    res.json(member);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User is already a member of this workspace' });
    }
    console.error('Workspace invite error:', error);
    res.status(500).json({ error: 'Failed to invite user to workspace' });
  }
});

// Team Management Routes
app.get('/api/workspaces/:workspaceId/teams', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { workspaceId } = req.params;
    
    // Check if user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: parseInt(workspaceId),
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId } } }
        ]
      }
    });
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }
    
    const teams = await prisma.team.findMany({
      where: { workspaceId: parseInt(workspaceId) },
      include: {
        members: {
          include: {
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });
    
    res.json(teams);
  } catch (error) {
    console.error('Teams fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/api/workspaces/:workspaceId/teams', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;
    
    // Check if user has admin access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: parseInt(workspaceId),
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId, role: 'admin' } } }
        ]
      }
    });
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }
    
    const team = await prisma.team.create({
      data: {
        name,
        description,
        color,
        workspaceId: parseInt(workspaceId),
        members: {
          create: {
            userId: user.userId,
            role: 'lead'
          }
        }
      },
      include: {
        members: {
          include: {
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });
    
    res.json(team);
  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.post('/api/teams/:teamId/members', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { teamId } = req.params;
    const { userId, role = 'member' } = req.body;
    
    // Check if user has admin access to team's workspace
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
      include: {
        workspace: {
          include: {
            owner: true,
            members: true
          }
        }
      }
    });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const hasAccess = team.workspace.ownerId === user.userId || 
                     team.workspace.members.some(m => m.userId === user.userId && m.role === 'admin');
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const member = await prisma.teamMember.create({
      data: {
        userId: parseInt(userId),
        teamId: parseInt(teamId),
        role
      },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
    
    res.json(member);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }
    console.error('Team member addition error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Time Tracking Routes
app.post('/api/time/start', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { taskId, description } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }
    
    // Verify task belongs to user or user has access through workspace
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        OR: [
          { userId: user.userId },
          { workspace: { members: { some: { userId: user.userId } } } }
        ]
      },
      include: { workspace: true }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    
    // Stop any active time entry for this user
    const activeEntries = await prisma.timeEntry.findMany({
      where: { 
        userId: user.userId, 
        isActive: true 
      }
    });
    
    const endTime = new Date();
    for (const entry of activeEntries) {
      const duration = Math.floor((endTime - new Date(entry.startTime)) / 1000);
      await prisma.timeEntry.update({
        where: { id: entry.id },
        data: {
          isActive: false,
          endTime,
          duration
        }
      });
      
      // Update task total time
      await prisma.task.update({
        where: { id: entry.taskId },
        data: {
          totalTimeSpent: { increment: duration },
          isTimeTracking: false
        }
      });
    }
    
    // Update the active time entry relationship to null
    await prisma.user.update({
      where: { id: user.userId },
      data: { activeTimeEntry: { disconnect: true } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Create new time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: user.userId,
        taskId: parseInt(taskId),
        workspaceId: task.workspaceId,
        description,
        startTime: new Date(),
        isActive: true
      },
      include: {
        task: { select: { id: true, text: true } },
        workspace: { select: { id: true, name: true } }
      }
    });
    
    // Update the user's active time entry
    await prisma.user.update({
      where: { id: user.userId },
      data: { activeTimeEntryId: timeEntry.id }
    });
    
    // Update task to indicate it's being tracked
    await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { isTimeTracking: true }
    });
    
    res.json(timeEntry);
  } catch (error) {
    console.error('Start time tracking error:', error);
    res.status(500).json({ error: 'Failed to start time tracking' });
  }
});

app.post('/api/time/stop', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { timeEntryId } = req.body;
    
    let timeEntry;
    if (timeEntryId) {
      // Stop specific time entry
      timeEntry = await prisma.timeEntry.findFirst({
        where: {
          id: timeEntryId,
          userId: user.userId,
          isActive: true
        }
      });
    } else {
      // Stop current active time entry
      timeEntry = await prisma.timeEntry.findFirst({
        where: {
          userId: user.userId,
          isActive: true
        }
      });
    }
    
    if (!timeEntry) {
      return res.status(404).json({ error: 'No active time entry found' });
    }
    
    const endTime = new Date();
    const duration = Math.floor((endTime - new Date(timeEntry.startTime)) / 1000); // Duration in seconds
    
    // Clear the active time entry relationship
    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: timeEntry.id },
      data: {
        endTime: endTime,
        duration: duration,
        isActive: false
      },
      include: {
        task: { select: { id: true, text: true } },
        workspace: { select: { id: true, name: true } }
      }
    });

    // Update the user's active time entry to null
    await prisma.user.update({
      where: { id: user.userId },
      data: { activeTimeEntryId: null }
    });

    // Update task to indicate it's no longer being tracked
    await prisma.task.update({
      where: { id: timeEntry.taskId },
      data: { 
        isTimeTracking: false,
        totalTimeSpent: {
          increment: duration
        }
      }
    });
    
    res.json(updatedTimeEntry);
  } catch (error) {
    console.error('Stop time tracking error:', error);
    res.status(500).json({ error: 'Failed to stop time tracking' });
  }
});

app.get('/api/time/active', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    console.log('Prisma client:', typeof prisma, prisma ? 'defined' : 'undefined');
    const activeTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: user.userId,
        isActive: true
      },
      include: {
        task: { select: { id: true, text: true } },
        workspace: { select: { id: true, name: true } }
      }
    });
    
    res.json(activeTimeEntry);
  } catch (error) {
    console.error('Get active time entry error:', error);
    res.status(500).json({ error: 'Failed to get active time entry' });
  }
});

app.get('/api/time/entries', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { taskId, workspaceId, startDate, endDate, userId: requestedUserId } = req.query;
    
    // Build where clause
    const where = { userId: user.userId };
    
    // If requesting another user's time entries, check permissions
    if (requestedUserId && parseInt(requestedUserId) !== user.userId) {
      // Check if user has admin access to any shared workspace
      const hasAdminAccess = await prisma.workspaceMember.findFirst({
        where: {
          userId: user.userId,
          role: { in: ['owner', 'admin'] }
        }
      });
      
      if (!hasAdminAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      where.userId = parseInt(requestedUserId);
    }
    
    if (taskId) where.taskId = parseInt(taskId);
    if (workspaceId) where.workspaceId = parseInt(workspaceId);
    if (startDate) where.startTime = { gte: new Date(startDate) };
    if (endDate) {
      where.startTime = where.startTime || {};
      where.startTime.lte = new Date(endDate);
    }
    
    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        task: { select: { id: true, text: true } },
        workspace: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { startTime: 'desc' }
    });
    
    res.json(timeEntries);
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ error: 'Failed to get time entries' });
  }
});

app.get('/api/time/reports', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { workspaceId, startDate, endDate, groupBy = 'user' } = req.query;
    
    // Check if user has admin access to workspace
    if (workspaceId) {
      const hasAccess = await prisma.workspace.findFirst({
        where: {
          id: parseInt(workspaceId),
          OR: [
            { ownerId: user.userId },
            { members: { some: { userId: user.userId, role: { in: ['admin', 'owner'] } } } }
          ]
        }
      });
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to workspace reports' });
      }
    }
    
    // Build where clause for time entries
    const where = {};
    if (workspaceId) where.workspaceId = parseInt(workspaceId);
    if (startDate) where.startTime = { gte: new Date(startDate) };
    if (endDate) {
      where.startTime = where.startTime || {};
      where.startTime.lte = new Date(endDate);
    }
    
    // If no workspace specified, only show user's own data
    if (!workspaceId) {
      where.userId = user.userId;
    }
    
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        ...where,
        isActive: false // Only completed time entries
      },
      include: {
        task: { select: { id: true, text: true } },
        workspace: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    // Group and aggregate data
    const report = {};
    
    timeEntries.forEach(entry => {
      let groupKey;
      if (groupBy === 'user') {
        groupKey = `${entry.user.name || entry.user.email} (${entry.user.id})`;
      } else if (groupBy === 'task') {
        groupKey = `${entry.task.text} (${entry.task.id})`;
      } else if (groupBy === 'workspace') {
        groupKey = entry.workspace ? `${entry.workspace.name} (${entry.workspace.id})` : 'Personal';
      }
      
      if (!report[groupKey]) {
        report[groupKey] = {
          totalSeconds: 0,
          totalHours: 0,
          entryCount: 0,
          entries: []
        };
      }
      
      report[groupKey].totalSeconds += entry.duration || 0;
      report[groupKey].totalHours = Math.round((report[groupKey].totalSeconds / 3600) * 100) / 100;
      report[groupKey].entryCount += 1;
      report[groupKey].entries.push(entry);
    });
    
    res.json(report);
  } catch (error) {
    console.error('Get time reports error:', error);
    res.status(500).json({ error: 'Failed to generate time reports' });
  }
});

app.put('/api/time/entries/:id', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.params;
    const { description, startTime, endTime } = req.body;
    
    // Verify time entry belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: { 
        id,
        userId: user.userId 
      }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    
    // Recalculate duration if times are updated
    if (startTime || endTime) {
      const start = new Date(startTime || existingEntry.startTime);
      const end = new Date(endTime || existingEntry.endTime);
      updateData.duration = Math.floor((end - start) / 1000);
    }
    
    const updatedEntry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        task: { select: { id: true, text: true } },
        workspace: { select: { id: true, name: true } }
      }
    });
    
    // Update task total time if duration changed
    if (updateData.duration !== undefined) {
      const oldDuration = existingEntry.duration || 0;
      const newDuration = updateData.duration;
      const timeDiff = newDuration - oldDuration;
      
      await prisma.task.update({
        where: { id: existingEntry.taskId },
        data: {
          totalTimeSpent: {
            increment: timeDiff
          }
        }
      });
    }
    
    res.json(updatedEntry);
  } catch (error) {
    console.error('Update time entry error:', error);
    res.status(500).json({ error: 'Failed to update time entry' });
  }
});

app.delete('/api/time/entries/:id', async (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id } = req.params;
    
    // Verify time entry belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: { 
        id,
        userId: user.userId 
      }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    // Remove time from task total
    if (existingEntry.duration) {
      await prisma.task.update({
        where: { id: existingEntry.taskId },
        data: {
          totalTimeSpent: {
            decrement: existingEntry.duration
          }
        }
      });
    }
    
    await prisma.timeEntry.delete({
      where: { id }
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Delete time entry error:', error);
    res.status(500).json({ error: 'Failed to delete time entry' });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const path = require('path');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});