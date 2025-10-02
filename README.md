# Golf Score Tracking

A full-stack application for tracking golf scores and rounds with React, TypeScript, Express, and Supabase.

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

**Backend:**
- Node.js with Express
- TypeScript
- Supabase for database
- JWT authentication
- Jest for testing

## Quick Start

### Prerequisites
- Node.js
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd golf-score-tracking
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   ```
   
   Configure your `.env` file with:
   - Supabase URL and service role key
   - JWT secret (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - Port (default: 3000)

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   cp env.example .env
   ```
   
   Configure your `.env` file with:
   - API URL (default: http://localhost:3000)

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── db/       # Database layer
│   │   └── utils/    # Utility functions
│   └── tests/        # Backend tests
├── frontend/         # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   └── hooks/     # Custom hooks
└── README.md
```

## Environment Variables

See `backend/env.example` and `frontend/env.example` for required environment variables.

## Database

See `db/SCHEMA.md` for a simplified schema view with:
- Required: `[x]` indicates the column must be provided
- Default: textual default value when the DB auto-fills

For full types, constraints, and triggers, see `db/schema.sql`. Enums are listed in `db/SCHEMA.md` under Enums.