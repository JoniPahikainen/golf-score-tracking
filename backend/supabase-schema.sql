-- Golf Score Tracking Database Schema
-- This file contains the complete database schema for the golf score tracking application

-- Enable UUID extension for automatic UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create custom types
CREATE TYPE tee_color AS ENUM ('red', 'gold', 'blue', 'white', 'black', 'championship', 'forward', 'middle', 'back');
CREATE TYPE weather_condition AS ENUM ('sunny', 'cloudy', 'rainy', 'windy', 'stormy');
CREATE TYPE round_status AS ENUM ('active', 'completed', 'abandoned');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(50) UNIQUE NOT NULL CHECK (LENGTH(user_name) >= 3),
    email VARCHAR(255) UNIQUE,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    handicap_index DECIMAL(4,1) DEFAULT 0.0 CHECK (handicap_index >= -5.0 AND handicap_index <= 54.0),
    date_of_birth DATE,
    phone VARCHAR(20),
    profile_picture_url TEXT,
    preferred_tee_color tee_color,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL CHECK (LENGTH(name) >= 2),
    location VARCHAR(300),
    description TEXT,
    website_url TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    par_total INTEGER CHECK (par_total >= 60 AND par_total <= 80),
    hole_count INTEGER DEFAULT 18 CHECK (hole_count IN (9, 18)),
    designer VARCHAR(200),
    year_built INTEGER CHECK (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM NOW())),
    course_type VARCHAR(50) DEFAULT 'public' CHECK (course_type IN ('public', 'private', 'semi-private', 'resort')),
    amenities JSONB DEFAULT '[]'::JSONB,
    course_rating DECIMAL(4,1) CHECK (course_rating >= 60.0 AND course_rating <= 80.0),
    slope_rating INTEGER CHECK (slope_rating >= 55 AND slope_rating <= 155),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course holes table
CREATE TABLE course_holes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
    par INTEGER NOT NULL CHECK (par >= 3 AND par <= 6),
    handicap_ranking INTEGER CHECK (handicap_ranking >= 1 AND handicap_ranking <= 18),
    description TEXT,
    hole_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, hole_number)
);

-- Course tees table
CREATE TABLE course_tees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hole_id UUID NOT NULL REFERENCES course_holes(id) ON DELETE CASCADE,
    tee_name VARCHAR(50) NOT NULL,
    tee_color tee_color,
    length INTEGER NOT NULL CHECK (length >= 50 AND length <= 700), -- in yards
    course_rating DECIMAL(4,1),
    slope_rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hole_id, tee_name)
);

-- Rounds table
CREATE TABLE rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    title VARCHAR(200),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME,
    end_time TIME,
    tee_name VARCHAR(50) NOT NULL,
    weather weather_condition,
    temperature INTEGER, -- in Fahrenheit
    wind_speed INTEGER, -- in mph
    notes TEXT,
    status round_status DEFAULT 'active',
    is_tournament BOOLEAN DEFAULT false,
    tournament_name VARCHAR(200),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Round players table (many-to-many relationship between rounds and users)
CREATE TABLE round_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handicap_at_time DECIMAL(4,1) DEFAULT 0.0 CHECK (handicap_at_time >= -5.0 AND handicap_at_time <= 54.0),
    total_score INTEGER DEFAULT 0,
    total_putts INTEGER DEFAULT 0,
    fairways_hit INTEGER DEFAULT 0,
    greens_in_regulation INTEGER DEFAULT 0,
    total_penalties INTEGER DEFAULT 0,
    driving_distance_avg DECIMAL(5,1), -- average driving distance in yards
    longest_drive INTEGER, -- longest drive in yards
    position INTEGER, -- finishing position in the round
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(round_id, user_id)
);

-- Player scores table (individual hole scores)
CREATE TABLE player_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_player_id UUID NOT NULL REFERENCES round_players(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
    strokes INTEGER NOT NULL DEFAULT 0 CHECK (strokes >= 0 AND strokes <= 15),
    putts INTEGER DEFAULT 0 CHECK (putts >= 0 AND putts <= 10),
    fairway_hit BOOLEAN DEFAULT false,
    green_in_regulation BOOLEAN DEFAULT false,
    penalties INTEGER DEFAULT 0 CHECK (penalties >= 0 AND penalties <= 5),
    chip_shots INTEGER DEFAULT 0 CHECK (chip_shots >= 0),
    sand_saves INTEGER DEFAULT 0 CHECK (sand_saves >= 0),
    driving_distance INTEGER CHECK (driving_distance >= 0 AND driving_distance <= 500), -- in yards
    approach_distance INTEGER CHECK (approach_distance >= 0 AND approach_distance <= 300), -- distance to pin after approach shot
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(round_player_id, hole_number)
);

-- User statistics table (for tracking user performance over time)
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rounds_played INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    best_score INTEGER,
    worst_score INTEGER,
    total_eagles INTEGER DEFAULT 0,
    total_birdies INTEGER DEFAULT 0,
    total_pars INTEGER DEFAULT 0,
    total_bogeys INTEGER DEFAULT 0,
    total_double_bogeys INTEGER DEFAULT 0,
    total_worse INTEGER DEFAULT 0,
    fairway_hit_percentage DECIMAL(5,2),
    green_in_regulation_percentage DECIMAL(5,2),
    average_putts_per_round DECIMAL(4,2),
    longest_drive INTEGER,
    favorite_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    last_round_date DATE,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Course ratings table (user reviews and ratings)
CREATE TABLE course_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    would_play_again BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- Handicap history table (track handicap changes over time)
CREATE TABLE handicap_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handicap_index DECIMAL(4,1) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calculation_method VARCHAR(50) DEFAULT 'USGA',
    rounds_used INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Golf equipment table (track user's equipment)
CREATE TABLE golf_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_type VARCHAR(50) NOT NULL, -- driver, 3-wood, 4-iron, wedge, putter, etc.
    brand VARCHAR(100),
    model VARCHAR(100),
    loft DECIMAL(4,1),
    shaft_flex VARCHAR(10), -- S, R, A, L, X
    purchase_date DATE,
    retire_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(user_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_courses_location ON courses(location);
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX idx_course_holes_hole_number ON course_holes(hole_number);
CREATE INDEX idx_course_tees_hole_id ON course_tees(hole_id);
CREATE INDEX idx_rounds_course_id ON rounds(course_id);
CREATE INDEX idx_rounds_date ON rounds(date);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_round_players_round_id ON round_players(round_id);
CREATE INDEX idx_round_players_user_id ON round_players(user_id);
CREATE INDEX idx_player_scores_round_player_id ON player_scores(round_player_id);
CREATE INDEX idx_player_scores_hole_number ON player_scores(hole_number);
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_course_ratings_course_id ON course_ratings(course_id);
CREATE INDEX idx_course_ratings_user_id ON course_ratings(user_id);
CREATE INDEX idx_handicap_history_user_id ON handicap_history(user_id);
CREATE INDEX idx_handicap_history_effective_date ON handicap_history(effective_date);
CREATE INDEX idx_golf_equipment_user_id ON golf_equipment(user_id);

-- Create composite indexes
CREATE INDEX idx_rounds_course_date ON rounds(course_id, date);
CREATE INDEX idx_round_players_user_round ON round_players(user_id, round_id);
CREATE INDEX idx_player_scores_player_hole ON player_scores(round_player_id, hole_number);

-- Create triggers for automatically updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_holes_updated_at BEFORE UPDATE ON course_holes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_tees_updated_at BEFORE UPDATE ON course_tees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_round_players_updated_at BEFORE UPDATE ON round_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_scores_updated_at BEFORE UPDATE ON player_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_ratings_updated_at BEFORE UPDATE ON course_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_golf_equipment_updated_at BEFORE UPDATE ON golf_equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user statistics
CREATE OR REPLACE FUNCTION calculate_user_statistics(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_rounds_played INTEGER;
    v_total_score INTEGER;
    v_best_score INTEGER;
    v_worst_score INTEGER;
    v_total_eagles INTEGER;
    v_total_birdies INTEGER;
    v_total_pars INTEGER;
    v_total_bogeys INTEGER;
    v_total_double_bogeys INTEGER;
    v_total_worse INTEGER;
    v_total_putts INTEGER;
    v_total_holes INTEGER;
    v_fairways_hit INTEGER;
    v_greens_in_reg INTEGER;
    v_total_fairway_opportunities INTEGER;
    v_total_gir_opportunities INTEGER;
    v_longest_drive INTEGER;
    v_last_round_date DATE;
BEGIN
    -- Get basic round statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(rp.total_score), 0),
        COALESCE(MIN(rp.total_score), 0),
        COALESCE(MAX(rp.total_score), 0),
        COALESCE(MAX(r.date), NULL)
    INTO 
        v_rounds_played,
        v_total_score,
        v_best_score,
        v_worst_score,
        v_last_round_date
    FROM round_players rp
    JOIN rounds r ON rp.round_id = r.id
    WHERE rp.user_id = p_user_id AND r.status = 'completed';

    -- Calculate detailed statistics from player scores
    SELECT 
        COALESCE(SUM(CASE WHEN ps.strokes - ch.par = -2 THEN 1 ELSE 0 END), 0), -- eagles
        COALESCE(SUM(CASE WHEN ps.strokes - ch.par = -1 THEN 1 ELSE 0 END), 0), -- birdies
        COALESCE(SUM(CASE WHEN ps.strokes - ch.par = 0 THEN 1 ELSE 0 END), 0),  -- pars
        COALESCE(SUM(CASE WHEN ps.strokes - ch.par = 1 THEN 1 ELSE 0 END), 0),  -- bogeys
        COALESCE(SUM(CASE WHEN ps.strokes - ch.par = 2 THEN 1 ELSE 0 END), 0),  -- double bogeys
        COALESCE(SUM(CASE WHEN ps.strokes - ch.par > 2 THEN 1 ELSE 0 END), 0),  -- worse
        COALESCE(SUM(ps.putts), 0),
        COUNT(*),
        COALESCE(SUM(CASE WHEN ps.fairway_hit THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN ps.green_in_regulation THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN ch.par > 3 THEN 1 ELSE 0 END), 0), -- fairway opportunities (par 4 and 5)
        COUNT(*), -- all holes are GIR opportunities
        COALESCE(MAX(ps.driving_distance), 0)
    INTO 
        v_total_eagles,
        v_total_birdies,
        v_total_pars,
        v_total_bogeys,
        v_total_double_bogeys,
        v_total_worse,
        v_total_putts,
        v_total_holes,
        v_fairways_hit,
        v_greens_in_reg,
        v_total_fairway_opportunities,
        v_total_gir_opportunities,
        v_longest_drive
    FROM player_scores ps
    JOIN round_players rp ON ps.round_player_id = rp.id
    JOIN rounds r ON rp.round_id = r.id
    JOIN course_holes ch ON r.course_id = ch.course_id AND ps.hole_number = ch.hole_number
    WHERE rp.user_id = p_user_id AND r.status = 'completed';

    -- Insert or update user statistics
    INSERT INTO user_statistics (
        user_id,
        rounds_played,
        average_score,
        best_score,
        worst_score,
        total_eagles,
        total_birdies,
        total_pars,
        total_bogeys,
        total_double_bogeys,
        total_worse,
        fairway_hit_percentage,
        green_in_regulation_percentage,
        average_putts_per_round,
        longest_drive,
        last_round_date,
        calculated_at
    ) VALUES (
        p_user_id,
        v_rounds_played,
        CASE WHEN v_rounds_played > 0 THEN ROUND(v_total_score::DECIMAL / v_rounds_played, 2) ELSE NULL END,
        CASE WHEN v_rounds_played > 0 THEN v_best_score ELSE NULL END,
        CASE WHEN v_rounds_played > 0 THEN v_worst_score ELSE NULL END,
        v_total_eagles,
        v_total_birdies,
        v_total_pars,
        v_total_bogeys,
        v_total_double_bogeys,
        v_total_worse,
        CASE WHEN v_total_fairway_opportunities > 0 THEN ROUND((v_fairways_hit::DECIMAL / v_total_fairway_opportunities) * 100, 2) ELSE NULL END,
        CASE WHEN v_total_gir_opportunities > 0 THEN ROUND((v_greens_in_reg::DECIMAL / v_total_gir_opportunities) * 100, 2) ELSE NULL END,
        CASE WHEN v_rounds_played > 0 THEN ROUND(v_total_putts::DECIMAL / v_rounds_played, 2) ELSE NULL END,
        CASE WHEN v_longest_drive > 0 THEN v_longest_drive ELSE NULL END,
        v_last_round_date,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        rounds_played = EXCLUDED.rounds_played,
        average_score = EXCLUDED.average_score,
        best_score = EXCLUDED.best_score,
        worst_score = EXCLUDED.worst_score,
        total_eagles = EXCLUDED.total_eagles,
        total_birdies = EXCLUDED.total_birdies,
        total_pars = EXCLUDED.total_pars,
        total_bogeys = EXCLUDED.total_bogeys,
        total_double_bogeys = EXCLUDED.total_double_bogeys,
        total_worse = EXCLUDED.total_worse,
        fairway_hit_percentage = EXCLUDED.fairway_hit_percentage,
        green_in_regulation_percentage = EXCLUDED.green_in_regulation_percentage,
        average_putts_per_round = EXCLUDED.average_putts_per_round,
        longest_drive = EXCLUDED.longest_drive,
        last_round_date = EXCLUDED.last_round_date,
        calculated_at = EXCLUDED.calculated_at,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user statistics when scores are updated
CREATE OR REPLACE FUNCTION trigger_update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update statistics for the affected user
    PERFORM calculate_user_statistics(
        (SELECT rp.user_id FROM round_players rp WHERE rp.id = COALESCE(NEW.round_player_id, OLD.round_player_id))
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_statistics_on_score_change
    AFTER INSERT OR UPDATE OR DELETE ON player_scores
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE handicap_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_equipment ENABLE ROW LEVEL SECURITY;

-- Public read access to courses and related data
CREATE POLICY "Public read access to courses" ON courses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access to course holes" ON course_holes
    FOR SELECT USING (true);

CREATE POLICY "Public read access to course tees" ON course_tees
    FOR SELECT USING (true);

-- Users can read their own data
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can read their own rounds and scores
CREATE POLICY "Users can access their own rounds" ON round_players
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own scores" ON player_scores
    FOR ALL USING (
        auth.uid() = (SELECT rp.user_id FROM round_players rp WHERE rp.id = round_player_id)
    );

-- Users can read their own statistics
CREATE POLICY "Users can read their own statistics" ON user_statistics
    FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own handicap history
CREATE POLICY "Users can access their own handicap history" ON handicap_history
    FOR ALL USING (auth.uid() = user_id);

-- Users can read their own equipment
CREATE POLICY "Users can access their own equipment" ON golf_equipment
    FOR ALL USING (auth.uid() = user_id);

-- Users can read and write their own course ratings
CREATE POLICY "Users can access their own course ratings" ON course_ratings
    FOR ALL USING (auth.uid() = user_id);

-- Users can access rounds they are participating in
CREATE POLICY "Users can access participating rounds" ON rounds
    FOR SELECT USING (
        id IN (SELECT round_id FROM round_players WHERE user_id = auth.uid())
    );

-- Insert some sample data for testing
INSERT INTO courses (id, name, location, description, par_total, hole_count, course_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Pebble Beach Golf Links', 'Pebble Beach, CA', 'World-famous oceanside golf course', 72, 18, 'resort'),
('550e8400-e29b-41d4-a716-446655440002', 'Augusta National Golf Club', 'Augusta, GA', 'Home of the Masters Tournament', 72, 18, 'private'),
('550e8400-e29b-41d4-a716-446655440003', 'St. Andrews Old Course', 'St. Andrews, Scotland', 'The home of golf', 72, 18, 'public');

-- Insert sample holes for Pebble Beach (simplified - first 3 holes)
INSERT INTO course_holes (course_id, hole_number, par, handicap_ranking) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 4, 15),
('550e8400-e29b-41d4-a716-446655440001', 2, 5, 7),
('550e8400-e29b-41d4-a716-446655440001', 3, 4, 11);

-- Insert sample tees for the holes
INSERT INTO course_tees (hole_id, tee_name, tee_color, length) SELECT
    ch.id, 'Championship', 'black', 
    CASE ch.hole_number 
        WHEN 1 THEN 380
        WHEN 2 THEN 520
        WHEN 3 THEN 390
    END
FROM course_holes ch 
WHERE ch.course_id = '550e8400-e29b-41d4-a716-446655440001' AND ch.hole_number <= 3;

INSERT INTO course_tees (hole_id, tee_name, tee_color, length) SELECT
    ch.id, 'Blue', 'blue',
    CASE ch.hole_number 
        WHEN 1 THEN 360
        WHEN 2 THEN 495
        WHEN 3 THEN 370
    END
FROM course_holes ch 
WHERE ch.course_id = '550e8400-e29b-41d4-a716-446655440001' AND ch.hole_number <= 3;

INSERT INTO course_tees (hole_id, tee_name, tee_color, length) SELECT
    ch.id, 'White', 'white',
    CASE ch.hole_number 
        WHEN 1 THEN 340
        WHEN 2 THEN 470
        WHEN 3 THEN 350
    END
FROM course_holes ch 
WHERE ch.course_id = '550e8400-e29b-41d4-a716-446655440001' AND ch.hole_number <= 3;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information and golf profiles';
COMMENT ON TABLE courses IS 'Golf courses with detailed information';
COMMENT ON TABLE course_holes IS 'Individual hole information for each course';
COMMENT ON TABLE course_tees IS 'Different tee options for each hole';
COMMENT ON TABLE rounds IS 'Golf rounds played';
COMMENT ON TABLE round_players IS 'Players participating in each round';
COMMENT ON TABLE player_scores IS 'Individual hole scores for each player';
COMMENT ON TABLE user_statistics IS 'Calculated performance statistics for users';
COMMENT ON TABLE course_ratings IS 'User reviews and ratings for courses';
COMMENT ON TABLE handicap_history IS 'Historical handicap index changes';
COMMENT ON TABLE golf_equipment IS 'User golf equipment tracking';

COMMENT ON COLUMN users.handicap_index IS 'USGA Handicap Index (-5.0 to 54.0)';
COMMENT ON COLUMN courses.course_rating IS 'Course rating for slope/handicap calculations';
COMMENT ON COLUMN courses.slope_rating IS 'Slope rating (55-155) for handicap calculations';
COMMENT ON COLUMN player_scores.strokes IS 'Number of strokes taken on the hole';
COMMENT ON COLUMN player_scores.putts IS 'Number of putts taken on the green';
COMMENT ON COLUMN player_scores.fairway_hit IS 'Whether the fairway was hit from the tee (par 4 and 5 only)';
COMMENT ON COLUMN player_scores.green_in_regulation IS 'Whether the green was reached in regulation';
