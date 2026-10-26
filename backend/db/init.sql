-- CineConnect Database Initialization — v2 (Talent + Production House)
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ===================== ENUMS =====================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('TALENT', 'PRODUCTION_HOUSE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_status AS ENUM ('draft', 'open', 'closed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('submitted', 'under_review', 'shortlisted', 'rejected', 'hired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('reel', 'photo', 'text', 'story');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===================== USERS =====================
CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email             VARCHAR(255) UNIQUE,
    phone             VARCHAR(20) UNIQUE,
    password_hash     VARCHAR(255),
    role              user_role NOT NULL DEFAULT 'TALENT',
    auth_provider     VARCHAR(20) DEFAULT 'email',
    email_verified    BOOLEAN DEFAULT FALSE,
    phone_verified    BOOLEAN DEFAULT FALSE,
    identity_verified BOOLEAN DEFAULT FALSE,
    identity_doc_url  VARCHAR(512),
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- ===================== TALENT PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
    user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name               VARCHAR(200),
    bio                TEXT,
    photo_url          VARCHAR(512),
    date_of_birth      DATE,
    gender             VARCHAR(20),
    primary_craft      VARCHAR(50),
    secondary_crafts   VARCHAR(50)[],
    city               VARCHAR(100),
    state              VARCHAR(100),
    travel_radius_km   INTEGER DEFAULT 0,
    languages          JSONB DEFAULT '[]',
    availability       JSONB DEFAULT '{}',
    embedding          VECTOR(768),
    completeness_score INTEGER DEFAULT 0,
    updated_at         TIMESTAMP DEFAULT NOW()
);

-- ===================== PRODUCTION HOUSE PROFILES =====================
CREATE TABLE IF NOT EXISTS production_house_profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name    VARCHAR(300) NOT NULL,
    about           TEXT,
    logo_url        VARCHAR(512),
    website_url     VARCHAR(512),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'India',
    genres          VARCHAR(50)[],              -- e.g. Drama, Action, Ad-Film
    specializations VARCHAR(100)[],             -- e.g. OTT, Feature Film, Ad Agency
    gst_number      VARCHAR(20),
    is_verified     BOOLEAN DEFAULT FALSE,
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ===================== SKILLS =====================
CREATE TABLE IF NOT EXISTS skills (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS user_skills (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id    INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(20) DEFAULT 'intermediate',
    PRIMARY KEY (user_id, skill_id)
);

-- ===================== EXPERIENCES =====================
CREATE TABLE IF NOT EXISTS experiences (
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
CREATE INDEX IF NOT EXISTS idx_experiences_user ON experiences(user_id);

-- ===================== PORTFOLIO =====================
CREATE TABLE IF NOT EXISTS portfolio_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(30) NOT NULL,   -- photo | video | showreel | audio | document | resume
    s3_url      VARCHAR(512) NOT NULL,
    cdn_url     VARCHAR(512),
    title       VARCHAR(200),
    description TEXT,
    is_public   BOOLEAN DEFAULT TRUE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_items(user_id);

-- ===================== PROJECTS (Production House) =====================
CREATE TABLE IF NOT EXISTS projects (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            VARCHAR(300) NOT NULL,
    description      TEXT,
    genre            VARCHAR(50),
    project_type     VARCHAR(50),              -- feature_film | short_film | web_series | ad | music_video
    status           project_status DEFAULT 'upcoming',
    shoot_start_date DATE,
    shoot_end_date   DATE,
    location         VARCHAR(200),
    budget_range     VARCHAR(100),
    poster_url       VARCHAR(512),
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_production ON projects(production_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ===================== OPPORTUNITIES / CASTING CALLS =====================
CREATE TABLE IF NOT EXISTS opportunities (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
    posted_by        UUID NOT NULL REFERENCES users(id),
    title            VARCHAR(300) NOT NULL,
    description      TEXT,
    craft            VARCHAR(50) NOT NULL,          -- Actor | DOP | Editor | etc.
    required_skills  VARCHAR(100)[],
    experience_years INTEGER,
    age_min          INTEGER,
    age_max          INTEGER,
    gender_pref      VARCHAR(20),
    city             VARCHAR(100),
    state            VARCHAR(100),
    is_remote        BOOLEAN DEFAULT FALSE,
    project_type     VARCHAR(50),
    pay_min          DECIMAL(12,2),
    pay_max          DECIMAL(12,2),
    pay_unit         VARCHAR(20) DEFAULT 'project',-- day | week | project
    shoot_start      DATE,
    shoot_end        DATE,
    application_deadline DATE,
    status           opportunity_status DEFAULT 'open',
    embedding        VECTOR(768),
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opportunities_craft ON opportunities(craft);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_by ON opportunities(posted_by);

-- ===================== APPLICATIONS =====================
CREATE TABLE IF NOT EXISTS applications (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id     UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    talent_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_note         TEXT,
    portfolio_item_ids UUID[],
    reel_ids           UUID[],
    status             application_status DEFAULT 'submitted',
    status_history     JSONB DEFAULT '[]',
    rejection_reason   TEXT,
    applied_at         TIMESTAMP DEFAULT NOW(),
    updated_at         TIMESTAMP DEFAULT NOW(),
    UNIQUE(opportunity_id, talent_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_talent ON applications(talent_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- ===================== AUDITION STEPS =====================
CREATE TABLE IF NOT EXISTS audition_steps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    step_type       VARCHAR(50) NOT NULL,    -- online_audition | physical_audition | interview | callback
    title           VARCHAR(200),
    instructions    TEXT,
    meeting_url     VARCHAR(512),
    location        TEXT,
    scheduled_at    TIMESTAMP,
    is_completed    BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audition_application ON audition_steps(application_id);

-- ===================== INVITATIONS (Collaboration) =====================
CREATE TABLE IF NOT EXISTS invitations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    opportunity_id  UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    message         TEXT,
    status          invitation_status DEFAULT 'pending',
    expires_at      TIMESTAMP,
    responded_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_invitations_to ON invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_from ON invitations(from_user_id);

-- ===================== SAVED JOBS =====================
CREATE TABLE IF NOT EXISTS saved_opportunities (
    user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    saved_at       TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, opportunity_id)
);

-- ===================== POSTS / REELS (Social Content) =====================
CREATE TABLE IF NOT EXISTS posts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          post_type NOT NULL DEFAULT 'reel',
    media_url     VARCHAR(512),
    cdn_url       VARCHAR(512),
    thumbnail_url VARCHAR(512),
    caption       TEXT,
    tags          VARCHAR(100)[],
    like_count    INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count   INTEGER DEFAULT 0,
    save_count    INTEGER DEFAULT 0,
    is_public     BOOLEAN DEFAULT TRUE,
    expires_at    TIMESTAMP,                -- for stories
    created_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- ===================== SOCIAL =====================
CREATE TABLE IF NOT EXISTS follows (
    follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS saved_posts (
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
    saved_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- ===================== CHAT =====================
CREATE TABLE IF NOT EXISTS conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_ids UUID[] NOT NULL,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participant_ids);

CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id),
    body            TEXT,
    attachment_urls VARCHAR(512)[],
    status          VARCHAR(20) DEFAULT 'sent',   -- sent | delivered | read
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ===================== NOTIFICATIONS =====================
CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    title      VARCHAR(300),
    body       TEXT,
    data       JSONB,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

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
    ('Hair Styling', 'makeup')
ON CONFLICT (name) DO NOTHING;
