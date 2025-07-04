import { PrismaClient } from '@prisma/client';
import { verifyToken } from './utils/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Set CORS headers for Vercel
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
      // Get all journal entries for the authenticated user
      const journalEntries = await prisma.journalEntry.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(journalEntries);
    } else if (req.method === 'POST') {
      // Create a new journal entry for the authenticated user
      const { text, date } = req.body;
      const journalEntry = await prisma.journalEntry.create({
        data: { 
          text, 
          date: new Date(date),
          userId: user.userId
        }
      });
      res.status(201).json(journalEntry);
    } else if (req.method === 'PUT') {
      // Update a journal entry (check ownership first)
      const { id } = req.query;
      const { text } = req.body;
      
      // Verify journal entry belongs to user
      const existingEntry = await prisma.journalEntry.findFirst({
        where: { id: parseInt(id), userId: user.userId }
      });
      
      if (!existingEntry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      
      const journalEntry = await prisma.journalEntry.update({
        where: { id: parseInt(id) },
        data: { text }
      });
      res.status(200).json(journalEntry);
    } else if (req.method === 'DELETE') {
      // Delete a journal entry (check ownership first)
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
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
} 