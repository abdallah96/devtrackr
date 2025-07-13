import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../utils/auth';

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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify authentication
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const entryId = parseInt(id);

  if (!entryId || isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get specific time entry
      const timeEntry = await prisma.timeEntry.findFirst({
        where: {
          id: entryId,
          userId: user.userId
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

      if (!timeEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      res.status(200).json(timeEntry);
    } else if (req.method === 'PUT') {
      // Update time entry
      const { startTime, endTime, description, taskId } = req.body;

      // Verify the entry belongs to the user
      const existingEntry = await prisma.timeEntry.findFirst({
        where: {
          id: entryId,
          userId: user.userId
        }
      });

      if (!existingEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      // Calculate duration if both start and end times are provided
      let duration = null;
      let isActive = existingEntry.isActive;

      if (startTime && endTime) {
        duration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);
        isActive = false;
      } else if (startTime && existingEntry.endTime) {
        duration = Math.floor((new Date(existingEntry.endTime) - new Date(startTime)) / 1000);
      } else if (endTime && existingEntry.startTime) {
        duration = Math.floor((new Date(endTime) - new Date(existingEntry.startTime)) / 1000);
        isActive = false;
      }

      // If taskId is being changed, verify the new task belongs to the user
      if (taskId && taskId !== existingEntry.taskId) {
        const task = await prisma.task.findFirst({
          where: {
            id: parseInt(taskId),
            userId: user.userId
          }
        });

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
      }

      // Update the entry
      const updatedEntry = await prisma.timeEntry.update({
        where: { id: entryId },
        data: {
          ...(startTime && { startTime: new Date(startTime) }),
          ...(endTime && { endTime: new Date(endTime) }),
          ...(description !== undefined && { description }),
          ...(taskId && { taskId: parseInt(taskId) }),
          ...(duration !== null && { duration }),
          isActive
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

      res.status(200).json(updatedEntry);
    } else if (req.method === 'DELETE') {
      // Delete time entry
      const existingEntry = await prisma.timeEntry.findFirst({
        where: {
          id: entryId,
          userId: user.userId
        }
      });

      if (!existingEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      await prisma.timeEntry.delete({
        where: { id: entryId }
      });

      res.status(200).json({ message: 'Time entry deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Time entry API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}