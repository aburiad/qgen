# Database Migration Guide - QGen Application

## Current Database Structure (Supabase)

Your application currently uses Supabase with the following tables:

### 1. papers (Papers Table)
- **Purpose**: Stores main paper/question paper documents
- **Columns** (estimated based on context):
  - `id` (UUID) - Primary key
  - `title` (TEXT) - Paper title
  - `user_id` (TEXT/UUID) - Owner user
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - Additional metadata columns

### 2. paper_versions (Paper Versions Table)
- **Purpose**: Stores version history of papers
- **Columns**:
  - `id` (UUID) - Primary key
  - `paper_id` (UUID) - Foreign key to papers
  - `version_number` (INTEGER)
  - `content` (JSON/BLOB) - Version data
  - `created_at` (TIMESTAMPTZ)
  - `created_by` (TEXT/UUID)

### 3. questions (Questions Table)
- **Purpose**: Stores individual questions within papers
- **Columns**:
  - `id` (UUID) - Primary key
  - `paper_id` (UUID) - Foreign key to papers
  - `question_text` (TEXT)
  - `question_type` (TEXT) - MCQ, Short, Long, etc.
  - `marks` (INTEGER)
  - `options` (JSON) - For MCQ
  - `answer` (TEXT)
  - `order_index` (INTEGER)
  - `created_at` (TIMESTAMPTZ)

### 4. templates (Templates Table)
- **Purpose**: Stores reusable question templates
- **Columns**:
  - `id` (UUID) - Primary key
  - `name` (TEXT)
  - `category` (TEXT)
  - `content` (JSON)
  - `user_id` (TEXT/UUID)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

### 5. user_sessions (User Sessions Table)
- **Purpose**: Manages single-device login sessions
- **Columns**:
  - `id` (UUID) - Primary key
  - `user_email` (TEXT)
  - `session_token` (TEXT) - UNIQUE
  - `device_info` (TEXT)
  - `created_at` (TIMESTAMPTZ)
  - `last_active` (TIMESTAMPTZ)
  - `is_active` (BOOLEAN)

**Indexes**:
- `idx_user_sessions_email` on user_email
- `idx_user_sessions_token` on session_token

**RLS (Row Level Security)**: Enabled with policies for session management

**Stored Functions**:
- `deactivate_old_sessions(p_email TEXT)` - Deactivates all sessions for a user
- `create_user_session(p_email, p_token, p_device_info)` - Creates new session
- `validate_session(p_email, p_token)` - Validates session token
- `get_active_session(p_email)` - Returns active session details
- `logout_session(p_email, p_token)` - Deactivates specific session

---

## Migration Plan: Supabase to Self-Hosted VPS

If you want to host your database on a different VPS instead of Supabase, follow these steps:

### Step 1: Choose a Database Option

**Option A: PostgreSQL (Recommended)**
- Same as Supabase's underlying database
- Best compatibility
- Use: PostgreSQL 14+ on Ubuntu/Debian

**Option B: MySQL/MariaDB**
- Different syntax, requires more code changes
- Not recommended for this project

### Step 2: Set Up PostgreSQL on VPS

```bash
# Connect to your VPS via SSH
ssh your_user@your_vps_ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Access PostgreSQL CLI
sudo -u postgres psql
```

### Step 3: Create Database and User

```sql
-- In PostgreSQL CLI
CREATE DATABASE qgen_db;

CREATE USER qgen_user WITH PASSWORD 'your_secure_password';

GRANT ALL PRIVILEGES ON DATABASE qgen_db TO qgen_user;

-- Connect to the database
\c qgen_db

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO qgen_user;
```

### Step 4: Export Data from Supabase

**Method A: Using Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to Table Editor
3. For each table, click "Download CSV"

**Method B: Using pg_dump (if you have direct access)**
```bash
# You'll need your Supabase connection string
# Get it from Supabase Dashboard -> Settings -> Database
pg_dump "postgresql://user:password@host:5432/database" > backup.sql
```

### Step 5: Import Data to VPS

```bash
# Transfer the CSV files to your VPS, then import:
psql -U qgen_user -d qgen_db -c "\COPY papers FROM '/path/to/papers.csv' CSV HEADER;"
psql -U qgen_user -d qgen_db -c "\COPY paper_versions FROM '/path/to/paper_versions.csv' CSV HEADER;"
psql -U qgen_user -d qgen_db -c "\COPY questions FROM '/path/to/questions.csv' CSV HEADER;"
psql -U qgen_user -d qgen_db -c "\COPY templates FROM '/path/to/templates.csv' CSV HEADER;"
psql -U qgen_user -d qgen_db -c "\COPY user_sessions FROM '/path/to/user_sessions.csv' CSV HEADER;"
```

Or if using SQL dump file:
```bash
psql -U qgen_user -d qgen_db < backup.sql
```

### Step 6: Recreate Functions and Policies

Execute the SQL functions from the migration file:

```sql
-- Run the functions from 003_single_device_login.sql
-- See the migration file for complete SQL
```

### Step 7: Update Application Configuration

Update your environment variables:

```env
# Old (Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# New (PostgreSQL on VPS)
VITE_SUPABASE_URL=http://your-vps-ip:5432
VITE_SUPABASE_ANON_KEY=not-needed-for-direct-postgres
```

**Note**: You'll need to update the code to use a direct PostgreSQL connection instead of Supabase client. This requires:

1. Install `pg` package: `npm install pg`
2. Update connection code in `src/app/utils/supabaseClient.ts`

### Step 8: Security Considerations

1. **Enable SSL** for production
2. **Configure firewall**:
   ```bash
   sudo ufw allow 5432/tcp
   sudo ufw enable
   ```
3. **Use strong passwords**
4. **Consider using a connection pooler** like PgBouncer for better performance

### Step 9: Backup Strategy

Set up automated backups:

```bash
# Create backup script
sudo nano /opt/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U qgen_user qgen_db > /backups/qgen_$DATE.sql

# Keep only last 7 days
find /backups -type f -mtime +7 -delete

# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/backup.sh
```

---

## Alternative: Keep Supabase + External VPS

If you want to keep Supabase for auth but host data elsewhere, you can use:
- Supabase for authentication (Auth + user_sessions)
- External PostgreSQL for tables (papers, questions, templates)

This requires custom code to connect to both databases.

---

## Need Help?

If you need:
- Full SQL schema definitions
- Code changes for direct PostgreSQL connection
- Docker setup for easy deployment
- Backup automation scripts

Let me know and I can provide more specific guidance.