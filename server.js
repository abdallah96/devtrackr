const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Generate a secure JWT secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { workspaces: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DevTrackr API is running' });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
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

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task Routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      include: {
        timeEntries: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const tasksWithTime = tasks.map(task => ({
      ...task,
      totalTimeSpent: task.timeEntries.reduce((total, entry) => {
        return total + (entry.duration || 0);
      }, 0)
    }));

    res.json(tasksWithTime);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { text, workspaceId } = req.body;

    const task = await prisma.task.create({
      data: {
        text,
        userId: req.user.id,
        workspaceId: workspaceId || null
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    const task = await prisma.task.update({
      where: { id: parseInt(id), userId: req.user.id },
      data: { text, completed }
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id: parseInt(id), userId: req.user.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Time Tracking Routes
app.get('/api/time/active', authenticateToken, async (req, res) => {
  try {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: req.user.id,
        endTime: null,
        isActive: true
      },
      include: {
        task: true,
        workspace: true
      }
    });

    res.json(activeEntry);
  } catch (error) {
    console.error('Get active time entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/time/start', authenticateToken, async (req, res) => {
  try {
    const { taskId, description } = req.body;

    // Stop any existing active time entry
    const existingEntries = await prisma.timeEntry.findMany({
      where: {
        userId: req.user.id,
        endTime: null,
        isActive: true
      }
    });

    for (const entry of existingEntries) {
      const endTime = new Date();
      const duration = Math.floor((endTime - entry.startTime) / 1000);
      
      await prisma.timeEntry.update({
        where: { id: entry.id },
        data: {
          endTime,
          duration,
          isActive: false
        }
      });
    }

    // Get task details
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { workspace: true }
    });

    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create new time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        startTime: new Date(),
        description: description || '',
        userId: req.user.id,
        taskId: parseInt(taskId),
        workspaceId: task.workspaceId,
        isActive: true
      },
      include: {
        task: true,
        workspace: true
      }
    });

    // Update task tracking status
    await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { isTimeTracking: true }
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Start time tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/time/stop', authenticateToken, async (req, res) => {
  try {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: req.user.id,
        endTime: null,
        isActive: true
      }
    });

    if (!activeEntry) {
      return res.status(404).json({ error: 'No active time entry found' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - activeEntry.startTime) / 1000);

    // Update time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: { id: activeEntry.id },
      data: {
        endTime,
        duration,
        isActive: false
      }
    });

    // Update task tracking status and total time
    const allEntries = await prisma.timeEntry.findMany({
      where: { taskId: activeEntry.taskId }
    });

    const totalTimeSpent = allEntries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);

    await prisma.task.update({
      where: { id: activeEntry.taskId },
      data: {
        isTimeTracking: false,
        totalTimeSpent
      }
    });

    res.json(updatedEntry);
  } catch (error) {
    console.error('Stop time tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 DevTrackr API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;