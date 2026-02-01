# RAAHI - Travel Marketplace

A full-stack travel marketplace platform for Pakistan with AI-powered travel assistant.

## Project Structure

```
RAAHI_FYP/
├── frontend/          # React + TypeScript frontend
├── backend/           # Node.js/Express + TypeScript backend
└── ai-agent/          # LangChain-based AI assistant service
```

## Features

- **Dual Authentication**: Separate login for tourists and travel agencies
- **AI Travel Assistant**: Natural language queries for package recommendations
- **Package Management**: CRUD operations for travel packages
- **Booking System**: Complete booking flow with real-time notifications
- **Reviews & Ratings**: User reviews for packages
- **Real-time Notifications**: WebSocket-based notifications for agencies
- **Pakistani Focus**: All packages and data focused on Pakistani destinations

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Framer Motion (animations)
- Socket.io Client

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Socket.io (WebSocket)
- Zod Validation

### AI Agent
- Node.js + TypeScript
- OpenAI API
- LangChain (ready for integration)

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb raahi_db

# Or using SQL
psql -U postgres
CREATE DATABASE raahi_db;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Update DATABASE_URL with your PostgreSQL credentials

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database with Pakistani data
npm run prisma:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. AI Agent Setup

```bash
cd ai-agent

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Add your OPENAI_API_KEY

# Start AI agent server
npm run dev
```

AI Agent will run on `http://localhost:5001`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/raahi_db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
AI_AGENT_URL=http://localhost:5001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_AGENT_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5000
```

### AI Agent (.env)
```env
OPENAI_API_KEY=your-openai-api-key
BACKEND_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/user/register` - Register tourist
- `POST /api/auth/user/login` - Login tourist
- `POST /api/auth/agency/register` - Register agency
- `POST /api/auth/agency/login` - Login agency
- `GET /api/auth/me` - Get current user

### Packages
- `GET /api/packages` - Get all packages (with filters)
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create package (Agency only)
- `PUT /api/packages/:id` - Update package (Agency only)
- `DELETE /api/packages/:id` - Delete package (Agency only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/cancel` - Cancel booking

### AI Agent
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/recommend` - Get package recommendations
- `POST /api/ai/book` - Book via AI

## Seed Data

The database is seeded with:
- 10 Pakistani travel agencies
- 40+ travel packages (Hunza, Swat, Naran, Skardu, Neelum Valley, etc.)
- 30 tourist users from major Pakistani cities
- Sample bookings and reviews

## Usage

1. **Tourist Flow**:
   - Register/Login as tourist
   - Use AI chat to find packages: "I want to go to Hunza for 2 days under 20K"
   - Select a recommended package
   - Complete booking

2. **Agency Flow**:
   - Register/Login as agency
   - Create and manage packages
   - View bookings and notifications
   - Confirm/cancel bookings

## Development

```bash
# Run all services
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: AI Agent
cd ai-agent && npm run dev
```

## License

MIT
