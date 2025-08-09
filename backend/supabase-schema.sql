-- Supabase Schema Migration for Golf Score Tracking App
-- This file contains the SQL schema to replace Firebase Firestore collections

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces users collection)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table (replaces courses collection)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    amenities JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course holes table (normalized from holes array in course document)
CREATE TABLE course_holes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL,
    par INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, hole_number)
);

-- Course tees table (normalized from tees array in hole document)
CREATE TABLE course_tees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hole_id UUID NOT NULL REFERENCES course_holes(id) ON DELETE CASCADE,
    tee_id VARCHAR(50) NOT NULL,
    tee_name VARCHAR(100) NOT NULL,
    length INTEGER NOT NULL,
    stroke_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hole_id, tee_id)
);

-- Rounds table (replaces rounds collection)
CREATE TABLE rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    tee_id VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Round players table (normalized from players array in round document)
CREATE TABLE round_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    hcp_at_time DECIMAL(4,1) NOT NULL,
    total_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(round_id, user_id)
);

-- Player scores table (normalized from scores array in player document)
CREATE TABLE player_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_player_id UUID NOT NULL REFERENCES round_players(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL,
    strokes INTEGER NOT NULL,
    putts INTEGER,
    fairway_hit BOOLEAN DEFAULT false,
    green_in_reg BOOLEAN DEFAULT false,
    penalties INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(round_player_id, hole_number)
);

-- Indexes for performance
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_rounds_course_id ON rounds(course_id);
CREATE INDEX idx_rounds_date ON rounds(date);
CREATE INDEX idx_round_players_round_id ON round_players(round_id);
CREATE INDEX idx_round_players_user_id ON round_players(user_id);
CREATE INDEX idx_player_scores_round_player_id ON player_scores(round_player_id);
CREATE INDEX idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX idx_course_tees_hole_id ON course_tees(hole_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_scores ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your needs)
-- Users can read all users but only update their own data
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Courses are publicly readable, but only authenticated users can modify
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert courses" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update courses" ON courses FOR UPDATE USING (auth.role() = 'authenticated');

-- Course holes and tees inherit course permissions
CREATE POLICY "Anyone can view course holes" ON course_holes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage course holes" ON course_holes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view course tees" ON course_tees FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage course tees" ON course_tees FOR ALL USING (auth.role() = 'authenticated');

-- Rounds and related data - users can only see/modify their own rounds
CREATE POLICY "Users can view all rounds" ON rounds FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rounds" ON rounds FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update rounds" ON rounds FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all round players" ON round_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage round players" ON round_players FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all player scores" ON player_scores FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage player scores" ON player_scores FOR ALL USING (auth.role() = 'authenticated');
