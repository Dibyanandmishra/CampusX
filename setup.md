# Campus Safety SOS App - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier)
- Git

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Database Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and new cluster
3. Get your connection string
4. Copy `server/env.example` to `server/.env`
5. Update `MONGO_URI` in `.env` with your MongoDB connection string

### 3. Environment Variables

Create `server/.env` file:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-safety
PORT=5000
```

### 4. Seed Database (Optional)

```bash
cd server
node seed.js
```

### 5. Run the Application

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

### 6. Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Features to Test

1. **SOS Button**: Click the big red SOS button to trigger an emergency alert
2. **Map View**: See all SOS reports on an interactive map
3. **Admin Dashboard**: View and resolve SOS reports
4. **Real-time Updates**: Open multiple browser tabs to see live updates

## Troubleshooting

- **Location Error**: Ensure your browser allows location access
- **MongoDB Connection**: Check your connection string and network access
- **Port Conflicts**: Change ports in `.env` and `vite.config.js` if needed

## API Endpoints

- `POST /api/sos` - Create SOS report
- `GET /api/sos` - Get all reports
- `PATCH /api/sos/:id/resolve` - Resolve report

## Socket Events

- `new_sos` - New SOS report created
- `resolve_sos` - SOS report resolved
