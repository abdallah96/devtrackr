const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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

// Update task completion
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { completed }
    });
    res.json(task);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});