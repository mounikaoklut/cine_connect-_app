-- CineConnect Database Initialization
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ===================== USERS =====================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255),
    
    auth_provider   VARCHAR(20) DEFAULT 'email',
    email_verified  BOOLEAN DEFAULT FALSE,
    phone_verified  BOOLEAN DEFAULT FALSE,
    identity_verified BOOLEAN DEFAULT FALSE,
    identity_doc_url VARCHAR(512),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ===================== PROFILES =====================
CREATE TABLE profiles (
    user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name              VARCHAR(200),
    bio               TEXT,
    photo_url         VARCHAR(512),
    date_of_birth     DATE,
    gender            VARCHAR(20),
    primary_craft     VARCHAR(50),
    secondary_crafts  VARCHAR(50)[],
    city              VARCHAR(100),
    state             VARCHAR(100),
    travel_radius_km  INTEGER DEFAULT 0,
    languages         JSONB DEFAULT '[]',
    availability      JSONB DEFAULT '{}',
    embedding         VECTOR(768),
    completeness_score INTEGER DEFAULT 0,
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- ===================== SKILLS =====================
CREATE TABLE skills (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE user_skills (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id    INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(20) DEFAULT 'intermediate',
    PRIMARY KEY (user_id, skill_id)
);

-- ===================== EXPERIENCES =====================
CREATE TABLE experiences (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    company     VARCHAR(200),
    role_type   VARCHAR(50),
    start_date  DATE,
    end_date    DATE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_experiences_user ON experiences(user_id);

-- ===================== PORTFOLIO =====================
CREATE TABLE portfolio_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(30) NOT NULL,
    s3_url      VARCHAR(512) NOT NULL,
    title       VARCHAR(200),
    description TEXT,
    is_public   BOOLEAN DEFAULT TRUE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_user ON portfolio_items(user_id);

-- ===================== JOBS =====================
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by       UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(300) NOT NULL,
    description     TEXT,
    craft           VARCHAR(50) NOT NULL,
    required_skills VARCHAR(100)[],
    city            VARCHAR(100),
    state           VARCHAR(100),
    project_type    VARCHAR(50),
    pay_min         DECIMAL(12,2),
    pay_max         DECIMAL(12,2),
    pay_unit        VARCHAR(20) DEFAULT 'project',
    shoot_start     DATE,
    shoot_end       DATE,
    is_remote       BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'open',
    embedding       VECTOR(768),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_craft ON jobs(craft);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ===================== APPLICATIONS =====================
CREATE TABLE applications (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status            VARCHAR(30) DEFAULT 'applied',
    cover_note        TEXT,
    portfolio_item_ids UUID[],
    status_history    JSONB DEFAULT '[]',
    applied_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);

-- ===================== SAVED JOBS =====================
CREATE TABLE saved_jobs (
    user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id   UUID REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, job_id)
);

-- ===================== SOCIAL =====================
CREATE TABLE posts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          VARCHAR(20) NOT NULL,
    media_url     VARCHAR(512),
    caption       TEXT,
    like_count    INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    expires_at    TIMESTAMP,
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

CREATE TABLE follows (
    follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE likes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE TABLE comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);

-- ===================== CHAT =====================
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_ids UUID[] NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id),
    body            TEXT,
    attachment_urls VARCHAR(512)[],
    status          VARCHAR(20) DEFAULT 'sent',
    created_at      TIMESTAMP DEFAULT NOW()
);


CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ===================== NOTIFICATIONS =====================
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    title      VARCHAR(300),
    body       TEXT,
    data       JSONB,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- ===================== SEED DATA: SKILLS =====================
INSERT INTO skills (name, category) VALUES
    -- Acting
    ('Method Acting', 'acting'),
    ('Improvisation', 'acting'),
    ('Voice Modulation', 'acting'),
    ('Dialogue Delivery', 'acting'),
    ('Emotional Range', 'acting'),
    ('Action/Stunts', 'acting'),
    ('Dance', 'acting'),
    ('Mimicry', 'acting'),
    -- Camera
    ('Cinematography', 'camera'),
    ('Camera Operation', 'camera'),
    ('Lighting', 'camera'),
    ('Aerial/Drone', 'camera'),
    ('Steadicam', 'camera'),
    -- Editing
    ('Video Editing', 'editing'),
    ('Color Grading', 'editing'),
    ('VFX', 'editing'),
    ('Sound Design', 'editing'),
    ('DaVinci Resolve', 'editing'),
    ('Adobe Premiere', 'editing'),
    ('Final Cut Pro', 'editing'),
    -- Direction
    ('Script Analysis', 'direction'),
    ('Shot Composition', 'direction'),
    ('Actor Direction', 'direction'),
    ('Storyboarding', 'direction'),
    -- Writing
    ('Screenwriting', 'writing'),
    ('Dialogue Writing', 'writing'),
    ('Story Development', 'writing'),
    -- Production
    ('Production Management', 'production'),
    ('Location Scouting', 'production'),
    ('Budgeting', 'production'),
    ('Casting', 'production'),
    -- Music
    ('Music Composition', 'music'),
    ('Playback Singing', 'music'),
    ('Instrument (Guitar)', 'music'),
    ('Instrument (Piano)', 'music'),
    -- Makeup & Costume
    ('Prosthetic Makeup', 'makeup'),
    ('Costume Design', 'costume'),
    ('Hair Styling', 'makeup');
