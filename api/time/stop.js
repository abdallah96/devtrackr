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
    const { timeEntryId } = req.body;

    let timeEntry;

    if (timeEntryId) {
      // Stop specific time entry
      timeEntry = await prisma.timeEntry.findFirst({
        where: {
          id: parseInt(timeEntryId),
          userId: user.userId,
          isActive: true
        }
      });
    } else {
      // Stop the currently active entry for this user
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
    const duration = Math.floor((endTime - new Date(timeEntry.startTime)) / 1000);

    // Update time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: { id: timeEntry.id },
      data: {
        endTime,
        duration,
        isActive: false
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

  } catch (error) {
    console.error('Stop tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}