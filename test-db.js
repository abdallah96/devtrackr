const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);
    
    // Test creating a user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-connection@example.com',
        password: 'test123',
        name: 'Test Connection User'
      }
    });
    console.log('✅ User created successfully:', testUser.id);
    
    // Clean up - delete the test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 