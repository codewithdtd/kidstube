-- KidsTube Single Family Edition - Flyway Migration V3
-- Add is_short column and index to videos table for YouTube Shorts support

ALTER TABLE videos ADD COLUMN is_short BOOLEAN DEFAULT FALSE NOT NULL;

CREATE INDEX idx_videos_is_short_active ON videos(is_short, is_active);

-- Seed initial sample safe kids shorts (CoComelon verified real shorts)
INSERT INTO videos (youtube_video_id, title, thumbnail_url, duration_seconds, category_id, channel_id, is_active, is_short)
VALUES 
    ('9Xilq06tmac', 'JJ''s Happy Halloween Pumpkins! 🎃👻 #cocomelon #kids #shorts', 'https://i.ytimg.com/vi/9Xilq06tmac/hqdefault.jpg', 35, 1, 1, TRUE, TRUE),
    ('MtXa6QE0MJ0', 'Who Will JJ Find in the Magical Forest? 🌲🦊✨ CoComelon Read-Along #kids #shorts', 'https://i.ytimg.com/vi/MtXa6QE0MJ0/hqdefault.jpg', 40, 4, 1, TRUE, TRUE),
    ('9hZfmOvSXv8', 'Which Dino''s Do You Know? 🦕🦖🎶 My Favorite Dinosaur Song #cocomelon #kids #shorts', 'https://i.ytimg.com/vi/9hZfmOvSXv8/hqdefault.jpg', 38, 2, 1, TRUE, TRUE);

