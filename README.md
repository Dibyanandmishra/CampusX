# Campus Safety / SOS App

A realtime safety alert platform where students can press SOS, which shares their live location and shows a red pin on a map. Admins can mark it as resolved, and pins turn green.

## Features

- **SOS Button**: Students can trigger emergency alerts with their location
- **Real-time Map**: Live updates showing SOS reports with color-coded pins
- **Admin Dashboard**: Manage and resolve SOS reports
- **WebSocket Integration**: Real-time updates across all clients

## Tech Stack

- **Frontend**: React + Vite, Leaflet Maps, TailwindCSS, Socket.io
- **Backend**: Node.js + Express, Socket.io, MongoDB
- **Database**: MongoDB Atlas with Mongoose ODM

## Project Structure

```
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md        # This file
```

## Quick Start

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

## API Endpoints

- `POST /api/sos` - Create new SOS report
- `GET /api/sos` - Get all active reports
- `PATCH /api/sos/:id/resolve` - Mark report as resolved

## Socket Events

- `new_sos` - Emitted when new SOS report is created
- `resolve_sos` - Emitted when SOS report is resolved
