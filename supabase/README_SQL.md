# Supabase SQL Files Organization

This directory contains all SQL scripts used for the Islamvy app, organized by functional area.

## Directory Structure

- **`/community`**: Posts, interactions, hatims, and community-specific RPCs.
- **`/core`**: Core system tables (profiles, auth, avatars) and master schema fixes.
- **`/init`**: Initial setup scripts (referrals, etc.).
- **`/shop`**: Shop products, analytics, and notifications.
- **`/notifications`**: Push notification triggers and webhook setups.
- **`/security`**: Security hardening, RLS fixes, and edge function safety scripts.
- **`/performance`**: Database indexing and optimization scripts.
- **`/utils`**: Utility scripts (daily quotes, etc.).
- **`/fixes`**: IncrementalNumbered fix files and hotfixes.
- **`/migrations`**: Versioned database migrations.

## Key Files
- `community/20260203_optimized_community_rpcs.sql`: Latest optimized feed logic.
- `core/master_schema_fix.sql`: Comprehensive schema alignment script.
- `security/edge_functions_hardening.sql`: Security rules for Edge Functions.
