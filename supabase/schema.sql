-- ====================================================================
-- SAHAAY: Community Assistance & Volunteer Coordination Platform
-- Database Schema for Supabase (PostgreSQL)
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if re-running
DROP TABLE IF EXISTS assistance_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('requester', 'volunteer')),
    location VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ASSISTANCE REQUESTS TABLE
CREATE TABLE assistance_requests (
    id TEXT PRIMARY KEY,
    requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (
        category IN (
            'medicine_delivery',
            'grocery_assistance',
            'transportation',
            'senior_citizen_support',
            'emergency_community_support',
            'other'
        )
    ),
    location VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (
        status IN ('OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    contact_preference VARCHAR(100) DEFAULT 'chat',
    accepted_volunteer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    nexconn_channel_id TEXT,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for fast lookup and filtering
CREATE INDEX idx_requests_status ON assistance_requests(status);
CREATE INDEX idx_requests_category ON assistance_requests(category);
CREATE INDEX idx_requests_requester ON assistance_requests(requester_id);
CREATE INDEX idx_requests_volunteer ON assistance_requests(accepted_volunteer_id);
CREATE INDEX idx_requests_channel ON assistance_requests(nexconn_channel_id);
CREATE INDEX idx_requests_created ON assistance_requests(created_at DESC);

-- TRIGGER for updating updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_requests_modtime
BEFORE UPDATE ON assistance_requests
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;

-- Allow public read of requests and users for demo purposes
CREATE POLICY "Allow read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow read requests" ON assistance_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert requests" ON assistance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update requests" ON assistance_requests FOR UPDATE USING (true);

-- ====================================================================
-- SEED DATA FOR DEMO & TESTING
-- ====================================================================

INSERT INTO users (id, name, email, role, location, bio) VALUES
('usr_req_anjali', 'Anjali Sharma', 'anjali@example.com', 'requester', 'Indiranagar, Bengaluru', 'Senior citizen requiring occasional prescription delivery and grocery help.'),
('usr_vol_rahul', 'Rahul Verma', 'rahul@example.com', 'volunteer', 'Koramangala, Bengaluru', 'Active community volunteer with car for medicine & emergency aid.'),
('usr_vol_priya', 'Priya Patel', 'priya@example.com', 'volunteer', 'Whitefield, Bengaluru', 'Weekend helper for senior citizens and elder care coordination.');

INSERT INTO assistance_requests (
    id, requester_id, title, description, category, location, priority, status, contact_preference
) VALUES
(
    'req_med_001',
    'usr_req_anjali',
    'Urgent BP & Diabetes Medication Pickup',
    'Need prescription refill collected from Apollo Pharmacy 100ft Rd and delivered to 12th Main Indiranagar. Prescription slip is ready.',
    'medicine_delivery',
    'Indiranagar, Bengaluru',
    'urgent',
    'OPEN',
    'chat'
),
(
    'req_groc_002',
    'usr_req_anjali',
    'Weekly Essentials & Fresh Vegetables',
    'Need assistance buying basic pantry items (dal, rice, oats) and green vegetables for an elderly couple unable to walk to the market.',
    'grocery_assistance',
    'Indiranagar, Bengaluru',
    'medium',
    'OPEN',
    'chat'
),
(
    'req_snr_003',
    'usr_req_anjali',
    'Hospital Appointment Escort',
    'Looking for a compassionate volunteer to accompany an 82-year-old lady to Manipal Hospital OPD checkup and back.',
    'senior_citizen_support',
    'Old Airport Rd, Bengaluru',
    'high',
    'OPEN',
    'chat'
);
