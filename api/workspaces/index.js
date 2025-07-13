const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../utils/auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          OR: [
            { ownerId: user.userId },
            { members: { some: { userId: user.userId } } }
          ]
        },
        include: {
          owner: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              createdAt: true,
              updatedAt: true
            }
          },
          members: {
            include: {
              user: { 
                select: { 
                  id: true, 
                  name: true, 
                  email: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          },
          _count: {
            select: { tasks: true, journalEntries: true }
          }
        }
      });
      
      return res.json(workspaces);
    } catch (error) {
      console.error('Workspaces fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, color } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Workspace name is required' });
      }
      
      const workspace = await prisma.workspace.create({
        data: {
          name,
          description,
          color,
          ownerId: user.userId
        },
        include: {
          owner: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              createdAt: true,
              updatedAt: true
            }
          },
          members: {
            include: {
              user: { 
                select: { 
                  id: true, 
                  name: true, 
                  email: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          }
        }
      });
      
      return res.json(workspace);
    } catch (error) {
      console.error('Workspace creation error:', error);
      return res.status(500).json({ error: 'Failed to create workspace' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}; 