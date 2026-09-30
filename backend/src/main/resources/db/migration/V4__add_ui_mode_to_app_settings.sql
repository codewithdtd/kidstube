-- =========================================================================
-- Migration V4: Add ui_mode to app_settings
-- Allows parents/kids to switch between 'YOUTUBE' clone and 'KIDS_WORLD' custom theme
-- =========================================================================

ALTER TABLE app_settings ADD COLUMN ui_mode VARCHAR(30) DEFAULT 'KIDS_WORLD';

UPDATE app_settings SET ui_mode = 'KIDS_WORLD' WHERE ui_mode IS NULL;
