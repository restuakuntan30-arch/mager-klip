-- =====================================================
-- MagerKlip Database Setup
-- Run this in Supabase SQL Editor (one-time setup)
-- =====================================================

-- 1. PROFILES TABLE (user data + subscription plan)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  pro_until TIMESTAMPTZ,
  credits INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIP HISTORY TABLE (saves every analysis)
CREATE TABLE IF NOT EXISTS clip_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  yt_id TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  duration TEXT,
  clips JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clip_history_user ON clip_history(user_id, created_at DESC);

-- 3. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ROW LEVEL SECURITY (each user only sees their own data)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clip history policies
DROP POLICY IF EXISTS "Users view own history" ON clip_history;
CREATE POLICY "Users view own history" ON clip_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own history" ON clip_history;
CREATE POLICY "Users insert own history" ON clip_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own history" ON clip_history;
CREATE POLICY "Users delete own history" ON clip_history
  FOR DELETE USING (auth.uid() = user_id);

-- DONE! Tables and security ready.
