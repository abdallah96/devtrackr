# 🚀 DevTrackr - Complete Productivity Management Platform

A comprehensive, full-stack productivity application with team collaboration, workspace management, and calendar integration. Built with modern web technologies and designed for scalability.

![DevTrackr Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Calendar](https://img.shields.io/badge/Calendar-Google%20Calendar-red)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Team Collaboration](#team-collaboration)
8. [Calendar Integration](#calendar-integration)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [License](#license)

---

## ✨ Features

### 🎯 Core Functionality
- **📝 Personal Task Management**: Create, edit, delete, and organize tasks with priorities
- **📖 Journal Entries**: Write, edit, and search through personal journal entries with mood tracking
- **📊 Productivity Dashboard**: Visual progress tracking with weekly insights and analytics
- **🔍 Advanced Search**: Find specific tasks and journal entries with powerful filters

### 👥 Team Collaboration
- **🏢 Workspace Management**: Create and manage multiple workspaces for different projects
- **👥 Team Formation**: Organize team members within workspaces with role-based access
- **📋 Shared Task Management**: Assign tasks to team members and track progress
- **🔐 Role-Based Access Control**: Owner, Admin, Member, and Viewer roles with appropriate permissions

### 📅 Calendar Integration
- **🔗 Google Calendar Sync**: Two-way synchronization with Google Calendar
- **📅 Event Management**: View and manage calendar events alongside tasks
- **📈 Calendar Analytics**: Insights into meeting patterns and time management
- **🔔 Smart Notifications**: Contextual notifications for upcoming events and tasks

### 🎨 User Experience
- **🌙 Dark/Light Theme**: Beautiful, modern interface with theme switching
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **⚡ Real-time Updates**: Instant UI updates with optimistic rendering
- **🎯 Intuitive Interface**: Clean, modern design with smooth animations

### 🏗️ Technical Features
- **💾 Persistent Storage**: PostgreSQL database with Prisma ORM
- **🔄 Real-time Sync**: Frontend-backend communication via REST API
- **🔒 Secure Authentication**: JWT-based authentication with refresh tokens
- **📊 Performance Analytics**: Built-in performance monitoring and optimization
- **🚀 Production Ready**: Optimized for deployment on various platforms

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework with concurrent features
- **CSS3** - Custom styling with CSS variables and modern layouts
- **Lucide React** - Beautiful, customizable icons
- **React Hook Form** - Efficient form handling with validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework with middleware support
- **Prisma** - Modern database ORM with type safety
- **PostgreSQL** - Production-grade database
- **JWT** - Secure authentication tokens

### Calendar Integration
- **Google Calendar API** - Real-time calendar synchronization
- **Google OAuth2** - Secure authentication flow
- **Calendar Analytics** - Meeting insights and time tracking

### Development & Deployment
- **Vercel** - Serverless deployment platform
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Google Cloud Console account (for calendar integration)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/devtrackr.git
cd devtrackr

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma migrate deploy

# Start development server
npm run dev
```

### Development Scripts

```bash
# Development
npm run dev          # Start React app + Express server
npm start            # Start React app only
npm run server       # Start Express server only

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npx prisma studio    # Open database GUI
npx prisma migrate   # Run database migrations
npx prisma generate  # Generate Prisma client
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/devtrackr"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Google Calendar Integration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/auth/google/callback"

# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend Configuration
REACT_APP_API_PORT=5001
REACT_APP_API_BASE_URL="http://localhost:5001/api"
```

### Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
6. Copy Client ID and Client Secret to your `.env` file

### Database Setup

```bash
# Using PostgreSQL locally
createdb devtrackr

# Or using Docker
docker run --name devtrackr-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=devtrackr -p 5432:5432 -d postgres:14

# Run migrations
npx prisma migrate deploy
```

---

## 🗄️ Database Schema

### Core Models

```prisma
model User {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  password          String
  name              String?
  avatar            String?
  timezone          String?
  googleAccessToken String?
  googleRefreshToken String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relationships
  ownedWorkspaces   Workspace[] @relation("WorkspaceOwner")
  workspaceMembers  WorkspaceMember[]
  teamMembers       TeamMember[]
  tasks             Task[]
  journalEntries    JournalEntry[]
  calendarEvents    CalendarEvent[]
}

model Workspace {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  color       String?
  isDefault   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relationships
  ownerId     Int
  owner       User      @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  members     WorkspaceMember[]
  teams       Team[]
  tasks       Task[]
  journalEntries JournalEntry[]
  calendarEvents CalendarEvent[]
}

model Task {
  id          Int       @id @default(autoincrement())
  text        String
  completed   Boolean   @default(false)
  priority    String    @default("medium")
  dueDate     DateTime?
  date        DateTime
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relationships
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  workspaceId Int?
  workspace   Workspace? @relation(fields: [workspaceId], references: [id])
  teamId      Int?
  team        Team?     @relation(fields: [teamId], references: [id])
  
  // Calendar integration
  calendarEventId String?
  calendarEvent   CalendarEvent? @relation(fields: [calendarEventId], references: [googleEventId])
}
```

### Collaboration Models

```prisma
model WorkspaceMember {
  id          Int       @id @default(autoincrement())
  role        String    @default("member") // owner, admin, member, viewer
  joinedAt    DateTime  @default(now())
  
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  workspaceId Int
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  
  @@unique([userId, workspaceId])
}

model Team {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  color       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  workspaceId Int
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  members     TeamMember[]
  tasks       Task[]
}

model TeamMember {
  id       Int      @id @default(autoincrement())
  role     String   @default("member") // lead, member
  joinedAt DateTime @default(now())
  
  userId   Int
  user     User     @relation(fields: [userId], references: [id])
  teamId   Int
  team     Team     @relation(fields: [teamId], references: [id])
  
  @@unique([userId, teamId])
}
```

---

## 👥 Team Collaboration

### Workspace Management

DevTrackr supports multi-workspace collaboration with the following features:

#### Creating Workspaces
```javascript
// Create a new workspace
const workspace = await workspaceAPI.create(
  'Project Alpha',
  'Main project workspace',
  '#6366f1'
);
```

#### Inviting Team Members
```javascript
// Invite user to workspace
await workspaceAPI.invite(
  workspaceId,
  'user@example.com',
  'member' // role: owner, admin, member, viewer
);
```

#### Team Formation
```javascript
// Create a team within workspace
const team = await workspaceAPI.createTeam(
  workspaceId,
  'Frontend Team',
  'Responsible for UI/UX development',
  '#8b5cf6'
);
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Owner** | Full control over workspace, can delete workspace |
| **Admin** | Manage members, create/delete teams, manage all content |
| **Member** | Create content, participate in teams, view all content |
| **Viewer** | Read-only access to workspace content |

### Team Management Features

- **Team Creation**: Organize members into focused teams
- **Role Assignment**: Team leads and members with specific permissions
- **Task Assignment**: Assign tasks to specific team members
- **Progress Tracking**: Monitor team productivity and completion rates
- **Communication**: Built-in activity feeds and notifications

---

## 📅 Calendar Integration

### Google Calendar Sync

DevTrackr provides seamless integration with Google Calendar:

#### Setting Up Calendar Integration

1. Navigate to Calendar tab in the application
2. Click "Connect Google Calendar"
3. Authorize DevTrackr to access your calendar
4. Your events will automatically sync

#### Features

- **Two-way Sync**: Changes in Google Calendar reflect in DevTrackr
- **Event Creation**: Create calendar events from tasks
- **Meeting Insights**: Analytics on meeting patterns and time usage
- **Smart Scheduling**: Avoid conflicts when scheduling tasks

#### Calendar Analytics

```javascript
// Get calendar insights
const insights = {
  busiestDay: 'Tuesday',
  averageMeetingDuration: 45, // minutes
  meetingCount: 23,
  freeTime: 6.5 // hours per day
};
```

### Calendar Event Management

```javascript
// Sync calendar events
await calendarAPI.sync();

// Get upcoming events
const events = await calendarAPI.getEvents(
  new Date().toISOString(),
  endDate.toISOString()
);

// Create event from task
await calendarAPI.createEvent({
  title: task.text,
  start: task.dueDate,
  duration: 60 // minutes
});
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start server.local.js --name devtrackr
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5001

CMD ["npm", "start"]
```

### Environment Configuration

For production deployment, ensure these environment variables are set:

```bash
# Production Database
DATABASE_URL="postgresql://user:pass@prod-db:5432/devtrackr"

# Secure JWT Secret
JWT_SECRET="your-production-jwt-secret"

# Google Calendar (Production)
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-client-secret"
GOOGLE_REDIRECT_URI="https://yourdomain.com/auth/google/callback"

# Production Settings
NODE_ENV=production
PORT=5001
```

---

## 🔧 API Reference

### Authentication Endpoints

```javascript
// Register new user
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

// Login user
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Workspace Endpoints

```javascript
// Get all workspaces
GET /api/workspaces

// Create workspace
POST /api/workspaces
{
  "name": "Project Alpha",
  "description": "Main project workspace",
  "color": "#6366f1"
}

// Invite user to workspace
POST /api/workspaces/:id/invite
{
  "email": "user@example.com",
  "role": "member"
}

// Create team
POST /api/workspaces/:workspaceId/teams
{
  "name": "Frontend Team",
  "description": "UI/UX development team",
  "color": "#8b5cf6"
}
```

### Calendar Endpoints

```javascript
// Get Google auth URL
GET /api/auth/google/url

// Handle auth callback
POST /api/auth/google/callback
{
  "code": "google-auth-code"
}

// Get calendar events
GET /api/calendar/events?timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-31T23:59:59Z

// Sync calendar
POST /api/calendar/sync
```

### Task Endpoints

```javascript
// Get all tasks
GET /api/tasks

// Create task
POST /api/tasks
{
  "text": "Complete project documentation",
  "date": "2024-01-15",
  "priority": "high",
  "dueDate": "2024-01-20T10:00:00Z"
}

// Update task
PUT /api/tasks/:id
{
  "completed": true,
  "text": "Updated task text"
}

// Delete task
DELETE /api/tasks?id=123
```

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- OAuth2 integration with Google

### Data Protection
- SQL injection prevention with Prisma
- XSS protection with input sanitization
- CSRF protection with secure headers
- Rate limiting for API endpoints

### Privacy & Compliance
- Data encryption at rest and in transit
- User data export capabilities
- GDPR compliance features
- Audit logging for security events

---

## 📊 Analytics & Insights

### Productivity Metrics
- Daily and weekly task completion rates
- Time tracking and productivity patterns
- Goal achievement analysis
- Team productivity comparisons

### Calendar Analytics
- Meeting frequency and duration analysis
- Time allocation insights
- Schedule optimization recommendations
- Work-life balance metrics

### Reporting Features
- Exportable productivity reports
- Team performance dashboards
- Custom analytics queries
- Integration with external analytics tools

---

## 🔧 Customization & Extensions

### Theming
```css
/* Custom theme variables */
:root {
  --primary-color: #your-brand-color;
  --secondary-color: #your-secondary-color;
  --background-color: #your-background-color;
}
```

### Plugin System
- Custom task types and fields
- Third-party integrations
- Webhook support for external services
- Custom dashboard widgets

### API Extensions
- Custom endpoints for specific workflows
- Integration with project management tools
- CRM and business system connections
- Mobile app API compatibility

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database connection
npx prisma db push

# Reset database
npx prisma migrate reset
```

#### Google Calendar Issues
```bash
# Check OAuth configuration
curl -X GET "http://localhost:5001/api/auth/google/url" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Build Issues
```bash
# Clear build cache
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Performance Optimization
- Enable database query optimization
- Configure CDN for static assets
- Implement caching strategies
- Monitor application performance

---

## 🤝 Contributing

We welcome contributions to DevTrackr! Here's how to get started:

### Development Setup

```bash
# Fork the repository
git clone https://github.com/your-username/devtrackr.git
cd devtrackr

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m 'Add amazing feature'

# Push to branch
git push origin feature/amazing-feature

# Create Pull Request
```

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Include tests for new features

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by productivity methodologies
- Thanks to the open-source community
- Special thanks to contributors and users

---

## 📞 Support

For support, please:
- Check the documentation
- Search existing issues
- Create a new issue with details
- Contact the development team

**Transform your productivity with DevTrackr - where collaboration meets efficiency!**

---

*Made with ❤️ by the DevTrackr team*