# VicharSetu

VicharSetu is a full-stack polling platform where users can create, share, and manage polls through a public link. Poll creators can track responses, analyze results, and publish the final outcome for everyone to view.

## Features

- JWT Authentication
- Create and manage polls
- Public and authenticated polls
- Poll expiry support
- Single-choice voting
- Duplicate vote prevention
- Poll analytics dashboard
- Publish poll results

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Installation

### Clone the repository

```bash
git clone https://github.com/archakkhandayit/VicharSetu.git
cd VicharSetu
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Server

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### Client

```env
VITE_API_URL=http://localhost:5000
```

## License

MIT
