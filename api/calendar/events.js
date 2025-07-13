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
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Calendar events API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
} 