-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;

-- Create artists table
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table with registration number fields
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    registration_number VARCHAR(50) UNIQUE,
    degree VARCHAR(20),
    batch_year INTEGER,
    semester VARCHAR(10),
    roll_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table with all fields
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    venue VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    available_tickets INTEGER NOT NULL,
    artist_id INTEGER REFERENCES artists(id),
    status VARCHAR(20) DEFAULT 'active',
    category VARCHAR(100),
    is_free BOOLEAN DEFAULT FALSE,
    registration_link VARCHAR(500),
    max_participants INTEGER,
    early_bird_discount INTEGER DEFAULT 10,
    early_bird_deadline INTEGER DEFAULT 5,
    has_early_bird BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    num_tickets INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    booking_date DATE NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contact_submissions table
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'unread'
);

-- Insert default artist
INSERT INTO artists (name, description) VALUES 
('SSUET Event Organizer', 'Default event organizer for SSUET events')
ON CONFLICT (id) DO NOTHING;

-- Insert admin user (password: admin123)
-- The password hash is for 'admin123' using werkzeug security
INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES 
('Admin', 'User', 'admin@example.com', 'scrypt:32768:8:1$O6HgJX3RXFgVQ71P$e6cdc9ebe901a978bd75b945a99db0b560c510b7a968a26c3b5ab3584a2c29f122f1203a5edf81d766c5f62e0a7ea0071c3463628f164b4864e4d66d7e5ed10f', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample events
INSERT INTO events (name, description, date, venue, price, available_tickets, artist_id, status, category, is_free, early_bird_discount, early_bird_deadline, has_early_bird) VALUES
('Annual Tech Conference 2026', 'Biggest tech conference of the year featuring industry experts', CURRENT_DATE + INTERVAL '10 days', 'SSUET Main Auditorium', 100, 500, 1, 'active', 'Tech & Academia', FALSE, 15, 7, TRUE),
('Cultural Fest 2026', 'Celebrate diversity with music, food, and cultural performances', CURRENT_DATE + INTERVAL '15 days', 'SSUET Ground', 50, 1000, 1, 'active', 'Major Festivals & Trips', FALSE, 10, 5, TRUE),
('AI Workshop', 'Hands-on workshop on Artificial Intelligence', CURRENT_DATE + INTERVAL '5 days', 'CS Lab', 0, 100, 1, 'active', 'Seminars & Workshops', TRUE, 0, 0, FALSE),
('Summer Internship Program', 'Paid internship opportunity for final year students', CURRENT_DATE + INTERVAL '20 days', 'Online', 0, 50, 1, 'active', 'Internship Programs', TRUE, 0, 0, FALSE),
('Sports Gala 2026', 'Annual sports competition', CURRENT_DATE + INTERVAL '12 days', 'Sports Complex', 30, 300, 1, 'active', 'Sports & Competitions', FALSE, 10, 5, TRUE)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_registration_number ON users(registration_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);