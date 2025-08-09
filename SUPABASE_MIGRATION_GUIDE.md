# Firebase to Supabase Migration Guide

This guide covers the complete migration from Firebase Firestore to Supabase for the Golf Score Tracking application.

## Overview

The migration includes:
- Replacing Firebase Admin SDK with Supabase client
- Converting Firestore document-based structure to PostgreSQL relational structure  
- Updating all repository functions to use Supabase queries
- Setting up proper database schema with foreign keys and constraints

## Changes Made

### 1. Backend Dependencies
- **Removed**: `firebase-admin`
- **Added**: `@supabase/supabase-js`

### 2. Database Structure Changes

#### Before (Firestore Collections):
- `users` - User documents with embedded data
- `courses` - Course documents with embedded holes and tees arrays
- `rounds` - Round documents with embedded players and scores arrays

#### After (PostgreSQL Tables):
- `users` - User table with proper columns
- `courses` - Course table
- `course_holes` - Normalized holes data
- `course_tees` - Normalized tees data  
- `rounds` - Round table
- `round_players` - Normalized players data
- `player_scores` - Normalized scores data

### 3. Configuration Changes

#### Backend Configuration
- **File**: `backend/src/supabase.ts` (was `firebase.ts`)
- **Environment Variables**:
  ```
  SUPABASE_URL=https://your-project-id.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

#### Frontend Configuration  
- **File**: `frontend/src/lib/supabase.ts`
- **Environment Variables**:
  ```
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

### 4. Repository Function Updates

All repository functions have been updated to use Supabase queries:

#### Users Repository (`backend/src/db/repositories/users.ts`)
- `createUser()` - Uses INSERT with RETURNING
- `getUserById()` - Uses SELECT with WHERE
- `getAllUsers()` - Uses SELECT with optional password filtering
- `getUserByUsername()` - Uses SELECT with WHERE on user_name
- `deleteUser()` - Uses DELETE with WHERE
- `deleteUserByUsername()` - Uses DELETE with WHERE on user_name

#### Courses Repository (`backend/src/db/repositories/courses.ts`)
- `createCourse()` - Creates course and related holes/tees in sequence
- `getAllCourses()` - Uses JOIN queries to fetch nested data
- `getCourseById()` - Uses JOIN queries to fetch single course with nested data
- `deleteCourse()` - Uses CASCADE DELETE via foreign keys

#### Rounds Repository (`backend/src/db/repositories/rounds.ts`)
- `createRound()` - Creates round, players, and scores in sequence
- `updateRound()` - Updates only basic round fields
- `getRoundsByUserId()` - Uses complex JOIN with filtering
- `getRoundById()` - Uses complex JOIN to fetch complete round data
- `deleteRound()` - Uses CASCADE DELETE via foreign keys

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Set Up Database Schema
Run the SQL schema from `backend/supabase-schema.sql` in your Supabase SQL editor:

```sql
-- The file contains:
-- - Table creation with proper types and constraints
-- - Foreign key relationships
-- - Indexes for performance
-- - Row Level Security (RLS) policies
-- - Triggers for updated_at timestamps
```

### 3. Configure Environment Variables

#### Backend (`backend/.env`):
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
PORT=3000
NODE_ENV=development
```

#### Frontend (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

### 4. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend  
npm install
```

### 5. Data Migration (Optional)

If you have existing Firebase data, you'll need to:

1. Export data from Firestore
2. Transform the document structure to relational format
3. Import into Supabase tables

Example transformation:

```javascript
// Firebase course document:
{
  id: "course1",
  name: "Pine Valley",
  holes: [
    {
      holeNumber: 1,
      par: 4,
      tees: [
        { teeId: "blue", teeName: "Blue", length: 380 }
      ]
    }
  ]
}

// Becomes multiple Supabase records:
// courses table:
{ id: "course1", name: "Pine Valley" }

// course_holes table:  
{ id: "hole1", course_id: "course1", hole_number: 1, par: 4 }

// course_tees table:
{ id: "tee1", hole_id: "hole1", tee_id: "blue", tee_name: "Blue", length: 380 }
```

## Key Benefits of Migration

1. **Better Performance**: PostgreSQL with proper indexing
2. **Data Integrity**: Foreign key constraints prevent orphaned records
3. **Powerful Queries**: Complex JOINs and aggregations  
4. **Real-time**: Supabase real-time subscriptions
5. **Row Level Security**: Built-in access control
6. **Cost**: More predictable pricing than Firebase

## Testing

After migration:

1. Test all CRUD operations for users, courses, and rounds
2. Verify data relationships are maintained
3. Check that frontend still works with existing API endpoints
4. Test error handling and edge cases

## Rollback Plan

If issues arise:
1. Keep Firebase configuration files in backup
2. Switch package.json dependencies back
3. Restore original repository files
4. Update environment variables

The migration maintains the same API interface, so the frontend should work without changes once the backend is properly configured.
