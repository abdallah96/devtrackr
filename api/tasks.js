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
      // Get all tasks for the authenticated user
      const tasks = await prisma.task.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(tasks);
    } else if (req.method === 'POST') {
      // Create a new task for the authenticated user
      const { text, date } = req.body;
      const task = await prisma.task.create({
        data: { 
          text, 
          date: new Date(date), 
          completed: false,
          userId: user.userId
        }
      });
      res.status(201).json(task);
    } else if (req.method === 'PUT') {
      // Update a task (check ownership first)
      const { id } = req.query;
      const { text, completed } = req.body;
      
      // Verify task belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { id: parseInt(id), userId: user.userId }
      });
      
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const updateData = {};
      if (text !== undefined) updateData.text = text;
      if (completed !== undefined) updateData.completed = completed;
      
      const task = await prisma.task.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      res.status(200).json(task);
    } else if (req.method === 'DELETE') {
      // Delete a task (check ownership first)
      const { id } = req.query;
      
      // Verify task belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { id: parseInt(id), userId: user.userId }
      });
      
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      await prisma.task.delete({
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