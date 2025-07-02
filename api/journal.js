import { PrismaClient } from '@prisma/client';

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

  try {
    if (req.method === 'GET') {
      // Get all journal entries
      const entries = await prisma.journalEntry.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(entries);
    } else if (req.method === 'POST') {
      // Create a new journal entry
      const { text, date } = req.body;
      const entry = await prisma.journalEntry.create({
        data: { text, date: new Date(date) }
      });
      res.status(201).json(entry);
    } else if (req.method === 'DELETE') {
      // Delete a journal entry
      const { id } = req.query;
      await prisma.journalEntry.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).end();
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
} 