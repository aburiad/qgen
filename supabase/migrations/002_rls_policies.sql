-- Migration: 002_rls_policies.sql
-- Enables RLS and creates policies for questions and paper_versions

-- Enable RLS on questions and allow owners to manage their rows
ALTER TABLE IF EXISTS public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own questions" ON public.questions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on paper_versions and allow owners to manage their rows
ALTER TABLE IF EXISTS public.paper_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own paper_versions" ON public.paper_versions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optional: ensure papers has RLS enabled (if not already)
ALTER TABLE IF EXISTS public.papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own papers" ON public.papers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
