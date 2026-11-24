-- =============================================================================
-- EcoCity Hub – Complete Database Architecture & Row Level Security (RLS)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  state TEXT,
  city TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  font_size TEXT DEFAULT 'md' CHECK (font_size IN ('sm', 'md', 'lg', 'xl')),
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'hi', 'es', 'fr', 'de')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CARBON RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.carbon_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  car_km NUMERIC DEFAULT 0,
  motorbike_km NUMERIC DEFAULT 0,
  transit_km NUMERIC DEFAULT 0,
  bicycle_km NUMERIC DEFAULT 0,
  walking_km NUMERIC DEFAULT 0,
  electricity_kwh NUMERIC DEFAULT 0,
  diet_type TEXT DEFAULT 'mixed' CHECK (diet_type IN ('vegan', 'vegetarian', 'mixed')),
  transport_emissions NUMERIC NOT NULL DEFAULT 0,
  electricity_emissions NUMERIC NOT NULL DEFAULT 0,
  food_emissions NUMERIC NOT NULL DEFAULT 0,
  total_emissions NUMERIC NOT NULL DEFAULT 0,
  ai_recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CIVIC REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.civic_reports (
  id TEXT PRIMARY KEY, -- e.g. REP-83742
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  suggested_department TEXT,
  status TEXT DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Resolved')),
  generated_complaint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLANT ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.plant_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plant_name TEXT,
  health_status TEXT,
  symptoms JSONB DEFAULT '[]'::jsonb,
  possible_causes JSONB DEFAULT '[]'::jsonb,
  recommended_treatment TEXT,
  home_care TEXT,
  prevention_tips TEXT,
  confidence_score NUMERIC DEFAULT 85,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GREEN SCORES TABLE
CREATE TABLE IF NOT EXISTS public.green_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 50,
  carbon_score INTEGER DEFAULT 20,
  civic_score INTEGER DEFAULT 15,
  plant_score INTEGER DEFAULT 15,
  level_name TEXT DEFAULT 'Green Beginner',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GREEN CHALLENGES TABLE (Catalog)
CREATE TABLE IF NOT EXISTS public.green_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 50,
  difficulty TEXT DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER CHALLENGES TABLE (Progress)
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.green_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- 8. USER ACTIVITIES TABLE (Ledger)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('carbon', 'civic', 'plant', 'challenge')),
  description TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notif_reports BOOLEAN DEFAULT TRUE,
  notif_challenges BOOLEAN DEFAULT TRUE,
  notif_digest BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select, update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Carbon Records: private to user
CREATE POLICY "Users view own carbon records" ON public.carbon_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own carbon records" ON public.carbon_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Civic Reports: user can view/manage own reports; public can view aggregated statistics
CREATE POLICY "Users view own civic reports" ON public.civic_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own civic reports" ON public.civic_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own civic reports" ON public.civic_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own civic reports" ON public.civic_reports FOR DELETE USING (auth.uid() = user_id);

-- Plant Analyses: private to user
CREATE POLICY "Users view own plant analyses" ON public.plant_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own plant analyses" ON public.plant_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Green Scores: private to user
CREATE POLICY "Users view own green scores" ON public.green_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own green scores" ON public.green_scores FOR ALL USING (auth.uid() = user_id);

-- Green Challenges: readable by all authenticated users
CREATE POLICY "Anyone can view active green challenges" ON public.green_challenges FOR SELECT USING (is_active = TRUE);

-- User Challenges: private to user
CREATE POLICY "Users view own challenge progress" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own challenge progress" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

-- User Activities: private to user
CREATE POLICY "Users view own activity history" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activity records" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Preferences: private to user
CREATE POLICY "Users manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Seed initial weekly challenges
INSERT INTO public.green_challenges (id, title, description, category, points, difficulty, icon)
VALUES
  ('CH-01', 'Public Transit Commute', 'Take a bus, metro, or train instead of driving your personal car for 3 days this week.', 'transport', 60, 'Medium', 'Bus'),
  ('CH-02', 'Zero Single-Use Plastic', 'Carry a reusable canvas bag, water flask, and refuse plastic straws for 7 days.', 'waste', 40, 'Easy', 'ShoppingBag'),
  ('CH-03', 'Home Energy Audit', 'Switch off vampire electronics, turn off unnecessary lights, and reduce AC usage by 1 hour daily.', 'energy', 50, 'Easy', 'Zap'),
  ('CH-04', 'Urban Flora Caretaker', 'Inspect and water at least 2 indoor or balcony plants; check their leaves with Plant Health Checker.', 'flora', 50, 'Easy', 'Sprout'),
  ('CH-05', 'Civic Hazard Sentinel', 'Report a pothole, open garbage dump, or broken streetlight in your neighbourhood.', 'civic', 75, 'Medium', 'AlertTriangle')
ON CONFLICT (id) DO NOTHING;
