const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../../utils/auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id: workspaceId } = req.query;

  if (req.method === 'GET') {
    try {
      // Check if user has access to workspace
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: parseInt(workspaceId),
          OR: [
            { ownerId: user.userId },
            { members: { some: { userId: user.userId } } }
          ]
        }
      });
      
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found or access denied' });
      }
      
      const teams = await prisma.team.findMany({
        where: { workspaceId: parseInt(workspaceId) },
        include: {
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
            select: { members: true }
          }
        }
      });
      
      return res.json(teams);
    } catch (error) {
      console.error('Teams fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, color } = req.body;
      
      // Check if user has admin access to workspace
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: parseInt(workspaceId),
          OR: [
            { ownerId: user.userId },
            { members: { some: { userId: user.userId, role: 'admin' } } }
          ]
        }
      });
      
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found or access denied' });
      }
      
      const team = await prisma.team.create({
        data: {
          name,
          description,
          color,
          workspaceId: parseInt(workspaceId),
          members: {
            create: {
              userId: user.userId,
              role: 'lead'
            }
          }
        },
        include: {
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
      
      return res.json(team);
    } catch (error) {
      console.error('Team creation error:', error);
      return res.status(500).json({ error: 'Failed to create team' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}; 