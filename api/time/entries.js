import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      const { startDate, endDate } = req.query;
      
      // Get time entries for the authenticated user within the date range
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

      const timeEntry = await prisma.task.update({
        where: { id: parseInt(taskId) },
        data: {
          date: new Date(startTime),
          ...(endTime && { completed: true })
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