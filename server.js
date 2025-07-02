const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const prisma = new PrismaClient();

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text, date } = req.body;
    const task = await prisma.task.create({
      data: { text, date: new Date(date), completed: false }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task completion or text
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, text } = req.body;
    const updateData = {};
    if (completed !== undefined) updateData.completed = completed;
    if (text !== undefined) updateData.text = text;
    
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
app.delete('/api/tasks', async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all journal entries
app.get('/api/journal', async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new journal entry
app.post('/api/journal', async (req, res) => {
  try {
    const { text, date } = req.body;
    const entry = await prisma.journalEntry.create({
      data: { text, date: new Date(date) }
    });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update journal entry
app.put('/api/journal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const entry = await prisma.journalEntry.update({
      where: { id: parseInt(id) },
      data: { text }
    });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a journal entry
app.delete('/api/journal', async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.journalEntry.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});