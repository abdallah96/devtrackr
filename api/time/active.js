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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Verify authentication
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Get the currently active time entry for this user
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: user.userId,
        isActive: true
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

    if (!activeEntry) {
      return res.status(200).json(null);
    }

    res.status(200).json(activeEntry);

  } catch (error) {
    console.error('Get active entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}