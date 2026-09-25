-- KidsTube Single Family Edition - Flyway Migration V1
-- Core 5 tables for 1 Parent + 1 Kid architecture

-- 1. CHANNELS (YouTube channels approved by parent)
CREATE TABLE channels (
    id BIGSERIAL PRIMARY KEY,
    youtube_channel_id VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    custom_url VARCHAR(255),
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES (Themes/Categories for kid exploration)
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon_url VARCHAR(255),
    display_order INT DEFAULT 0
);

-- 3. VIDEOS (Curated safe kid videos)
CREATE TABLE videos (
    id BIGSERIAL PRIMARY KEY,
    youtube_video_id VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INT DEFAULT 0,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    channel_id BIGINT REFERENCES channels(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. APP_SETTINGS (Singleton row: ID = 1 for family settings)
CREATE TABLE app_settings (
    id INT NOT NULL,
    daily_time_limit_minutes INT DEFAULT 45,
    bedtime_start TIME DEFAULT '21:00:00',
    bedtime_end TIME DEFAULT '07:00:00',
    is_locked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_app_settings PRIMARY KEY (id),
    CONSTRAINT check_single_row CHECK (id = 1)
);

-- 5. WATCH_HISTORIES (Kid viewing duration audit logs)
CREATE TABLE watch_histories (
    id BIGSERIAL PRIMARY KEY,
    video_id BIGINT REFERENCES videos(id) ON DELETE CASCADE,
    watched_seconds INT NOT NULL,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-speed queries on mobile feed and audit
CREATE INDEX idx_videos_category_active ON videos(category_id, is_active);
CREATE INDEX idx_videos_channel ON videos(channel_id);
CREATE INDEX idx_watch_histories_watched_at ON watch_histories(watched_at);
