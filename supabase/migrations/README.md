Supabase migrations for xmpaper-generator-app

Run these SQL files in the Supabase SQL editor (in order) to create required tables and RLS policies used by the app:

- `001_create_tables.sql` — creates `questions`, `paper_versions`, adds `created_by_email`, triggers, and indexes.
- `002_rls_policies.sql` — enables Row Level Security (RLS) and creates owner policies for `papers`, `questions`, and `paper_versions`.

Usage:
1. Open Supabase project → SQL Editor.
2. Paste the contents of `001_create_tables.sql` and run.
3. Paste the contents of `002_rls_policies.sql` and run.
4. In Supabase Table editor click Refresh if needed.

Notes:
- These migrations are safe to re-run (use IF NOT EXISTS checks).
- Keep service-side secrets secure when running server-side migrations.
