const jwt = require('jsonwebtoken');

// Use environment variable for JWT secret or fall back to development secret
const JWT_SECRET = process.env.JWT_SECRET || 'devtrackr-development-secret-key-change-in-production';

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET
}; 