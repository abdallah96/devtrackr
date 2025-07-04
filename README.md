# 🚀 G-Tracker — Modern Productivity & Journal App

A beautiful, full-stack productivity application for tracking tasks, journal entries, and visualizing your productivity journey. Built with a modern tech stack and designed for both web and desktop use.

![G-Tracker Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

---

## ✨ Features

### 🎯 Core Functionality
- **📝 Task Management**: Add, edit, delete, and mark tasks as complete
- **📖 Journal Entries**: Write, edit, and search through journal entries
- **📊 Productivity Dashboard**: Visual progress tracking and weekly insights
- **🔍 Search & Filter**: Find specific tasks and journal entries quickly

### 🎨 User Experience
- **🌙 Dark Theme**: Beautiful, modern dark interface
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **⚡ Real-time Updates**: Instant UI updates with optimistic rendering
- **🎯 Inline Actions**: Edit and delete with smooth inline confirmations

### 🏗️ Technical Features
- **💾 Persistent Storage**: PostgreSQL database with Prisma ORM
- **🔄 Real-time Sync**: Frontend-backend communication via REST API
- **🖥️ Desktop App**: Install as PWA or build with Electron
- **🚀 Production Ready**: Deploy to Vercel with serverless functions

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **CSS3** - Custom styling with dark theme
- **PWA** - Progressive Web App capabilities

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Production database

### Development & Deployment
- **Vercel** - Serverless deployment
- **Electron** - Desktop app packaging
- **GitHub** - Version control

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gtracker.git
cd gtracker/devtrackr

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Run database migrations
npx prisma migrate dev

# Start development server
yarn dev
```

### Available Scripts

```bash
# Development
yarn dev          # Start React app + Express server
yarn start        # Start React app only
yarn server       # Start Express server only

# Production
yarn build        # Build for production
yarn dist         # Build desktop app with Electron

# Database
npx prisma studio # Open database GUI
npx prisma migrate # Run database migrations
```

---

## 📱 Usage

### Dashboard
- **Today's Progress**: View completed vs total tasks
- **Journal Preview**: See your latest journal entry
- **Weekly Productivity**: Track completion trends

### Tasks
- **Add Tasks**: Type and press Enter or click Add
- **Edit Tasks**: Click the pencil icon to edit inline
- **Delete Tasks**: Click trash icon, then confirm
- **Mark Complete**: Check the checkbox to toggle status

### Journal
- **Write Entries**: Use the large text area
- **Edit Entries**: Click pencil icon to modify
- **Delete Entries**: Click trash icon with confirmation
- **Search**: Filter entries by typing in search box

### Insights
- **Last Week's Progress**: Compare with current week
- **Journal History**: Review past entries
- **Productivity Trends**: Visual data analysis

---

## 🖥️ Desktop App

### PWA Installation (Instant)
1. Open the app in Chrome/Safari
2. Click the "Install" button in the address bar
3. Your app is now a desktop application!

### Electron Build (Advanced)
```bash
# Build desktop installer
yarn dist

# Available for:
# - macOS (.dmg)
# - Windows (.exe) 
# - Linux (.AppImage)
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL=your_postgres_connection_string
```

### Manual Deployment
```bash
# Build the app
yarn build

# Deploy build folder to your hosting service
```

---

## 🗄️ Database Schema

### Tasks
```sql
- id: Int (Primary Key)
- text: String
- completed: Boolean
- date: DateTime
- createdAt: DateTime
```

### Journal Entries
```sql
- id: Int (Primary Key)
- text: String
- date: DateTime
- createdAt: DateTime
```

---

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=5001
NODE_ENV=production
REACT_APP_API_PORT=5001
```

### Customization
- **App Icon**: Replace `public/logo.png`
- **Theme Colors**: Edit CSS variables in `src/index.css`
- **Window Size**: Modify `public/electron.js` for desktop app

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built as part of the journey from junior to senior developer
- Inspired by modern productivity tools
- Thanks to the React and Node.js communities

---

**Made with ❤️ by [Your Name]**

*Transform your productivity journey with G-Tracker!*