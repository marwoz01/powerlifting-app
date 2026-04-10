-- PowerPlan Supabase Schema
-- Run this in Supabase SQL Editor

-- 1. User Settings
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  profile JSONB NOT NULL,
  one_rep_maxes JSONB NOT NULL,
  deadlift_variant TEXT NOT NULL DEFAULT 'sumo',
  schedule JSONB NOT NULL,
  goals JSONB NOT NULL,
  weak_points JSONB NOT NULL,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Programs (current + archived)
CREATE TABLE programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  program_id TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT true,
  weeks JSONB NOT NULL,
  days JSONB NOT NULL,
  base_one_rep_maxes JSONB NOT NULL,
  effective_one_rep_maxes JSONB,
  ai_generated BOOLEAN DEFAULT false,
  training_level TEXT,
  total_weeks INTEGER,
  deload_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clerk_user_id, program_id)
);

CREATE INDEX idx_programs_user_current ON programs(clerk_user_id, is_current);

-- 3. Workout Logs
CREATE TABLE workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  log_id TEXT NOT NULL,
  program_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  sets JSONB NOT NULL DEFAULT '[]',
  general_note TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clerk_user_id, log_id)
);

CREATE INDEX idx_logs_user_program ON workout_logs(clerk_user_id, program_id);
CREATE INDEX idx_logs_user_week_day ON workout_logs(clerk_user_id, week_number, day_number);

-- 4. Accessory Progression
CREATE TABLE accessory_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Active Workouts (ephemeral)
CREATE TABLE active_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL
);

-- 6. API Keys (write-only from client, read-only from server)
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  anthropic_key TEXT,
  openrouter_key TEXT,
  gemini_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Helper: extract Clerk user ID from JWT
-- Clerk JWT template maps user.id to "sub" claim

-- user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON user_settings FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "insert_own" ON user_settings FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "update_own" ON user_settings FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "delete_own" ON user_settings FOR DELETE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON programs FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "insert_own" ON programs FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "update_own" ON programs FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "delete_own" ON programs FOR DELETE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- workout_logs
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON workout_logs FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "insert_own" ON workout_logs FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "update_own" ON workout_logs FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "delete_own" ON workout_logs FOR DELETE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- accessory_progress
ALTER TABLE accessory_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON accessory_progress FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "insert_own" ON accessory_progress FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "update_own" ON accessory_progress FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "delete_own" ON accessory_progress FOR DELETE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- active_workouts
ALTER TABLE active_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON active_workouts FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "insert_own" ON active_workouts FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "update_own" ON active_workouts FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "delete_own" ON active_workouts FOR DELETE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- api_keys: NO SELECT from client — only INSERT/UPDATE
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_own" ON api_keys FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "update_own" ON api_keys FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));
-- Server reads via SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
