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
    const { workspaceId, startDate, endDate, groupBy } = req.query;
    
    // Build where clause
    const where = { 
      userId: user.userId,
      isActive: false // Only completed entries for reports
    };
    
    if (workspaceId) where.workspaceId = parseInt(workspaceId);
    if (startDate) where.startTime = { gte: new Date(startDate) };
    if (endDate) {
      where.startTime = where.startTime || {};
      where.startTime.lte = new Date(endDate);
    }

    // Get time entries
    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            text: true
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

    // Calculate basic statistics
    const totalDuration = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalEntries = timeEntries.length;
    const avgDuration = totalEntries > 0 ? totalDuration / totalEntries : 0;

    // Group by logic
    let groupedData = {};
    
    if (groupBy === 'task') {
      groupedData = timeEntries.reduce((acc, entry) => {
        const taskId = entry.task.id;
        if (!acc[taskId]) {
          acc[taskId] = {
            taskId,
            taskName: entry.task.text,
            totalDuration: 0,
            entries: 0
          };
        }
        acc[taskId].totalDuration += entry.duration || 0;
        acc[taskId].entries += 1;
        return acc;
      }, {});
    } else if (groupBy === 'workspace') {
      groupedData = timeEntries.reduce((acc, entry) => {
        const workspaceId = entry.workspace.id;
        if (!acc[workspaceId]) {
          acc[workspaceId] = {
            workspaceId,
            workspaceName: entry.workspace.name,
            totalDuration: 0,
            entries: 0
          };
        }
        acc[workspaceId].totalDuration += entry.duration || 0;
        acc[workspaceId].entries += 1;
        return acc;
      }, {});
    } else if (groupBy === 'date') {
      groupedData = timeEntries.reduce((acc, entry) => {
        const date = new Date(entry.startTime).toDateString();
        if (!acc[date]) {
          acc[date] = {
            date,
            totalDuration: 0,
            entries: 0
          };
        }
        acc[date].totalDuration += entry.duration || 0;
        acc[date].entries += 1;
        return acc;
      }, {});
    }

    const reports = {
      summary: {
        totalDuration,
        totalEntries,
        avgDuration,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      },
      groupedData: Object.values(groupedData),
      rawEntries: timeEntries
    };

    res.status(200).json(reports);

  } catch (error) {
    console.error('Time reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}