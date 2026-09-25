-- KidsTube Single Family Edition - Flyway Migration V2
-- Seed baseline data: Settings, Categories, Sample Channel & Curated Videos

-- 1. Default App Settings (45 minutes daily, bedtime 21:00 to 07:00)
INSERT INTO app_settings (id, daily_time_limit_minutes, bedtime_start, bedtime_end, is_locked)
VALUES (1, 45, '21:00:00', '07:00:00', FALSE);

-- 2. Curated Categories
INSERT INTO categories (name, icon_url, display_order)
VALUES 
    ('Hoạt hình vui nhộn', 'film', 1),
    ('Ca nhạc thiếu nhi', 'music', 2),
    ('Khám phá & Khoa học', 'compass', 3),
    ('Bé học Tiếng Anh', 'book-open', 4);

-- 3. Initial Sample Approved Channel (CoComelon - Nursery Rhymes)
INSERT INTO channels (youtube_channel_id, title, custom_url, thumbnail_url)
VALUES 
    ('UCbCmjCuTUZos62Q4gtHW4wQ', 'CoComelon - Nursery Rhymes', '@CoComelon', 'https://yt3.googleusercontent.com/ytc/AIdro_kXJp0=s176-c-k-c0x00ffffff-no-rj');

-- 4. Initial Sample Curated Safe Videos
INSERT INTO videos (youtube_video_id, title, thumbnail_url, duration_seconds, category_id, channel_id, is_active)
VALUES 
    ('WRVsOCh907o', 'Wheels on the Bus | CoComelon Nursery Rhymes & Kids Songs', 'https://i.ytimg.com/vi/WRVsOCh907o/hqdefault.jpg', 211, 2, 1, TRUE),
    ('71_hDuL8jH4', 'Bath Song | CoComelon Nursery Rhymes & Kids Songs', 'https://i.ytimg.com/vi/71_hDuL8jH4/hqdefault.jpg', 178, 2, 1, TRUE),
    ('b0A88m4bU8o', 'Yes Yes Vegetables Song | CoComelon Nursery Rhymes', 'https://i.ytimg.com/vi/b0A88m4bU8o/hqdefault.jpg', 228, 1, 1, TRUE),
    ('XqZsoesa55w', 'Baby Shark Dance | #babyshark Most Viewed Video', 'https://i.ytimg.com/vi/XqZsoesa55w/hqdefault.jpg', 136, 4, 1, TRUE);
