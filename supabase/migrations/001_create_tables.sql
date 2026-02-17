-- Migration: 001_create_tables.sql
-- Creates questions and paper_versions tables, adds created_by_email, triggers and indexes

-- 1) Ensure uuid generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Add created_by_email to papers (safe if already present)
ALTER TABLE IF EXISTS public.papers
ADD COLUMN IF NOT EXISTS created_by_email text;

-- 3) Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  parent_question_id uuid NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  number integer,
  type text,
  title text,
  blocks jsonb DEFAULT '[]'::jsonb,
  marks numeric,
  optional boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Create paper_versions table
CREATE TABLE IF NOT EXISTS public.paper_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  change_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5) Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6) Attach trigger to questions (and papers)
DROP TRIGGER IF EXISTS set_updated_at_trigger_questions ON public.questions;
CREATE TRIGGER set_updated_at_trigger_questions
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_trigger ON public.papers;
CREATE TRIGGER set_updated_at_trigger
BEFORE UPDATE ON public.papers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 7) Indexes
CREATE INDEX IF NOT EXISTS idx_questions_paper_id ON public.questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_versions_paper_id ON public.paper_versions(paper_id);
