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
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Verify authentication
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { taskId, description } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
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

    // Check if there's already an active entry for this user
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: user.userId,
        isActive: true
      }
    });

    if (activeEntry) {
      return res.status(400).json({ error: 'There is already an active time entry. Please stop it first.' });
    }

    // Create new time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId: parseInt(taskId),
        userId: user.userId,
        startTime: new Date(),
        description: description || null,
        isActive: true,
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

  } catch (error) {
    console.error('Start tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}