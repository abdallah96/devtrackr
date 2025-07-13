import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Set CORS headers consistent with other endpoints
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://devtrackr-one.vercel.app',
    'https://devtrackr-one.vercel.app/'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify authentication for all requests
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'GET') {
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
      
      // Get time entries from the TimeEntry model, not Task model
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

      res.status(200).json(timeEntries);
    } else if (req.method === 'POST') {
      const { taskId, startTime, endTime, description } = req.body;

      // Validate input
      if (!taskId || !startTime) {
        return res.status(400).json({ error: 'Task ID and start time are required' });
      }

      // Verify task belongs to user
      const task = await prisma.task.findFirst({
        where: { 
          id: parseInt(taskId),
          userId: user.userId
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Create time entry
      const timeEntry = await prisma.timeEntry.create({
        data: {
          taskId: parseInt(taskId),
          userId: user.userId,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          description: description || null,
          duration: endTime ? Math.floor((new Date(endTime) - new Date(startTime)) / 1000) : null,
          isActive: !endTime,
          workspaceId: task.workspaceId
        },
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
        }
      });

      res.status(201).json(timeEntry);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Time entries API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
} 