-- =============================================================================
-- EcoCity Hub – Complete Database Architecture & Row Level Security (RLS)
-- =============================================================================

-- UUID Generation: Uses PostgreSQL native gen_random_uuid() (standard in Supabase / PostgreSQL 13+)

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.green_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- 8. USER ACTIVITIES TABLE (Ledger)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('carbon', 'civic', 'plant', 'challenge')),
  description TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE POLICY "Users delete own carbon records" ON public.carbon_records FOR DELETE USING (auth.uid() = user_id);

-- Civic Reports: user can view/manage own reports; public can view aggregated statistics
CREATE POLICY "Users view own civic reports" ON public.civic_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own civic reports" ON public.civic_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own civic reports" ON public.civic_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own civic reports" ON public.civic_reports FOR DELETE USING (auth.uid() = user_id);

-- Plant Analyses: private to user
CREATE POLICY "Users view own plant analyses" ON public.plant_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own plant analyses" ON public.plant_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own plant analyses" ON public.plant_analyses FOR DELETE USING (auth.uid() = user_id);

-- Green Scores: user can only view their own score (updates are handled exclusively server-side)
CREATE POLICY "Users view own green scores" ON public.green_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users delete own green scores" ON public.green_scores FOR DELETE USING (auth.uid() = user_id);

-- Green Challenges: readable by all authenticated users
CREATE POLICY "Anyone can view active green challenges" ON public.green_challenges FOR SELECT USING (is_active = TRUE);

-- User Challenges: private to user
CREATE POLICY "Users view own challenge progress" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own challenge progress" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

-- User Activities: user can view and clean up own activity history (inserts logged via server-side functions / triggers)
CREATE POLICY "Users view own activity history" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users delete own activity records" ON public.user_activities FOR DELETE USING (auth.uid() = user_id);

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

-- =============================================================================
-- 10. SERVER-SIDE GREEN SCORE RECALCULATION & VERIFIED ACTIVITY ENGINE
-- =============================================================================

-- Recalculate user green score server-side from genuine database activity records
CREATE OR REPLACE FUNCTION public.recalculate_user_green_score(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_carbon_count INTEGER := 0;
  v_carbon_points INTEGER := 0;
  v_prev_emission NUMERIC;
  v_latest_emission NUMERIC;
  v_civic_count INTEGER := 0;
  v_civic_resolved_count INTEGER := 0;
  v_civic_points INTEGER := 0;
  v_plant_count INTEGER := 0;
  v_plant_points INTEGER := 0;
  v_challenge_count INTEGER := 0;
  v_challenge_bonus INTEGER := 0;
  v_total_score INTEGER := 0;
  v_level_name TEXT := 'Green Beginner';
BEGIN
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Invalid user id');
  END IF;

  -- Defense-in-depth: authenticated client roles cannot recalculate another citizen's score
  IF auth.role() = 'authenticated' AND auth.uid() IS NOT NULL AND auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot recalculate another citizen''s score.';
  END IF;

  -- 1. Carbon Points (Max 400 pts from audits + reduction bonuses)
  SELECT COUNT(*) INTO v_carbon_count FROM public.carbon_records WHERE user_id = target_user_id;
  v_carbon_points := LEAST(400, v_carbon_count * 40);

  IF v_carbon_count >= 2 THEN
    SELECT total_emissions INTO v_latest_emission 
    FROM public.carbon_records 
    WHERE user_id = target_user_id 
    ORDER BY created_at DESC LIMIT 1;

    SELECT total_emissions INTO v_prev_emission 
    FROM public.carbon_records 
    WHERE user_id = target_user_id 
    ORDER BY created_at DESC OFFSET 1 LIMIT 1;

    IF v_prev_emission > 0 AND v_latest_emission < v_prev_emission THEN
      v_carbon_points := LEAST(400, v_carbon_points + 50);
    END IF;
  END IF;

  -- 2. Civic Points (50 per report, +25 if resolved, Max 300)
  SELECT COUNT(*) INTO v_civic_count FROM public.civic_reports WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO v_civic_resolved_count FROM public.civic_reports WHERE user_id = target_user_id AND status = 'Resolved';
  v_civic_points := LEAST(300, (v_civic_count * 50) + (v_civic_resolved_count * 25));

  -- 3. Plant Points (40 per analysis, Max 300)
  SELECT COUNT(*) INTO v_plant_count FROM public.plant_analyses WHERE user_id = target_user_id;
  v_plant_points := LEAST(300, v_plant_count * 40);

  -- 4. Challenge Bonus (50 per completed challenge)
  SELECT COUNT(*) INTO v_challenge_count FROM public.user_challenges WHERE user_id = target_user_id AND completed = TRUE;
  v_challenge_bonus := v_challenge_count * 50;

  -- Total Score
  v_total_score := v_carbon_points + v_civic_points + v_plant_points + v_challenge_bonus;

  -- Determine Level Tier
  IF v_total_score >= 2001 THEN
    v_level_name := 'Planet Protector';
  ELSIF v_total_score >= 1001 THEN
    v_level_name := 'Eco Champion';
  ELSIF v_total_score >= 501 THEN
    v_level_name := 'Green Guardian';
  ELSIF v_total_score >= 201 THEN
    v_level_name := 'Eco Explorer';
  ELSE
    v_level_name := 'Green Beginner';
  END IF;

  -- Upsert score safely server-side
  INSERT INTO public.green_scores (user_id, total_score, carbon_score, civic_score, plant_score, level_name, updated_at)
  VALUES (target_user_id, v_total_score, v_carbon_points, v_civic_points, v_plant_points, v_level_name, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_score = EXCLUDED.total_score,
    carbon_score = EXCLUDED.carbon_score,
    civic_score = EXCLUDED.civic_score,
    plant_score = EXCLUDED.plant_score,
    level_name = EXCLUDED.level_name,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'total_score', v_total_score,
    'carbon_score', v_carbon_points,
    'civic_score', v_civic_points,
    'plant_score', v_plant_points,
    'challenge_bonus', v_challenge_bonus,
    'level_name', v_level_name
  );
END;
$$;

-- Restrict low-level execution: revoke from untrusted client roles
REVOKE EXECUTE ON FUNCTION public.recalculate_user_green_score(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recalculate_user_green_score(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.recalculate_user_green_score(UUID) FROM authenticated;

-- Retain execution rights exclusively for trusted server-side roles
GRANT EXECUTE ON FUNCTION public.recalculate_user_green_score(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_user_green_score(UUID) TO postgres;

-- Authenticated RPC endpoint for user client to sync score
CREATE OR REPLACE FUNCTION public.sync_my_green_score()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;
  RETURN public.recalculate_user_green_score(auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_my_green_score() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_my_green_score() TO service_role;

-- Secure activity logging RPC endpoint (prevents points manipulation)
CREATE OR REPLACE FUNCTION public.record_verified_activity(
  p_activity_type TEXT,
  p_description TEXT,
  p_points INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_capped_points INTEGER;
  v_new_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF p_activity_type NOT IN ('carbon', 'civic', 'plant', 'challenge') THEN
    RAISE EXCEPTION 'Invalid activity category.';
  END IF;

  -- Enforce strict server-side ceiling: maximum 75 points per single action
  v_capped_points := GREATEST(0, LEAST(75, COALESCE(p_points, 0)));

  INSERT INTO public.user_activities (user_id, activity_type, description, points_earned, created_at)
  VALUES (v_user_id, p_activity_type, p_description, v_capped_points, NOW())
  RETURNING id INTO v_new_id;

  -- Automatically trigger server-side score recalculation
  PERFORM public.recalculate_user_green_score(v_user_id);

  RETURN jsonb_build_object('success', true, 'id', v_new_id, 'points_awarded', v_capped_points);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_verified_activity(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_verified_activity(TEXT, TEXT, INTEGER) TO service_role;

-- Automated triggers to sync green score whenever records are created, updated, or removed
CREATE OR REPLACE FUNCTION public.trigger_recalculate_green_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_target_user UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_target_user := OLD.user_id;
  ELSE
    v_target_user := NEW.user_id;
  END IF;

  IF v_target_user IS NOT NULL THEN
    PERFORM public.recalculate_user_green_score(v_target_user);
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_carbon_recalc_score ON public.carbon_records;
CREATE TRIGGER trg_carbon_recalc_score
AFTER INSERT OR UPDATE OR DELETE ON public.carbon_records
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_green_score();

DROP TRIGGER IF EXISTS trg_civic_recalc_score ON public.civic_reports;
CREATE TRIGGER trg_civic_recalc_score
AFTER INSERT OR UPDATE OR DELETE ON public.civic_reports
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_green_score();

DROP TRIGGER IF EXISTS trg_plant_recalc_score ON public.plant_analyses;
CREATE TRIGGER trg_plant_recalc_score
AFTER INSERT OR UPDATE OR DELETE ON public.plant_analyses
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_green_score();

DROP TRIGGER IF EXISTS trg_challenge_recalc_score ON public.user_challenges;
CREATE TRIGGER trg_challenge_recalc_score
AFTER INSERT OR UPDATE OR DELETE ON public.user_challenges
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_green_score();

-- =============================================================================
-- 11. SUPABASE STORAGE BUCKETS & HARDENED RLS POLICIES
-- =============================================================================
-- - avatars: Public (Profile display), 5MB limit, images only
-- - civic-media: Private, 25MB limit, images/videos, user-scoped folder
-- - plant-media: Private, 25MB limit, images/videos, user-scoped folder

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('civic-media', 'civic-media', false, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('plant-media', 'plant-media', false, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Security Policies with strict folder isolation (<user_id>/<filename>)
DO $$
BEGIN
  -- 1. SELECT POLICIES
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read avatars'
  ) THEN
    CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT 
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner read civic-media'
  ) THEN
    CREATE POLICY "Owner read civic-media" ON storage.objects FOR SELECT 
      USING (bucket_id = 'civic-media' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner read plant-media'
  ) THEN
    CREATE POLICY "Owner read plant-media" ON storage.objects FOR SELECT 
      USING (bucket_id = 'plant-media' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- 2. INSERT (UPLOAD) POLICIES - Enforce user-specific folder prefix
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner upload avatars'
  ) THEN
    CREATE POLICY "Owner upload avatars" ON storage.objects FOR INSERT 
      WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner upload civic-media'
  ) THEN
    CREATE POLICY "Owner upload civic-media" ON storage.objects FOR INSERT 
      WITH CHECK (bucket_id = 'civic-media' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner upload plant-media'
  ) THEN
    CREATE POLICY "Owner upload plant-media" ON storage.objects FOR INSERT 
      WITH CHECK (bucket_id = 'plant-media' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- 3. UPDATE POLICIES - User can update only their own uploaded media
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner update media'
  ) THEN
    CREATE POLICY "Owner update media" ON storage.objects FOR UPDATE 
      USING (bucket_id IN ('avatars', 'civic-media', 'plant-media') AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- 4. DELETE POLICIES - User can delete only their own uploaded media
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner delete media'
  ) THEN
    CREATE POLICY "Owner delete media" ON storage.objects FOR DELETE 
      USING (bucket_id IN ('avatars', 'civic-media', 'plant-media') AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;


