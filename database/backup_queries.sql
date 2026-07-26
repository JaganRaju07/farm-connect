-- database/backup_queries.sql — Operational queries for production management

-- ─── Manual Backup (run before major changes) ─────────────────────────────────
-- From terminal: pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M).sql

-- ─── Check database size ──────────────────────────────────────────────────────
SELECT
  pg_database.datname AS database,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();

-- ─── Check table sizes and row counts ────────────────────────────────────────
SELECT
  relname AS table_name,
  n_live_tup AS row_count,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- ─── Check index usage (verify your Week 4 indexes are being used) ────────────
SELECT
  indexrelname AS index_name,
  idx_scan AS times_used,
  idx_tup_read AS rows_read,
  idx_tup_fetch AS rows_fetched
FROM pg_stat_user_indexes
WHERE idx_scan > 0
ORDER BY idx_scan DESC;

-- ─── Check slow queries (after running demo) ─────────────────────────────────
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- ─── Reset test data (for clean demo) ────────────────────────────────────────
-- WARNING: Only run this in development Docker, NEVER in production
-- TRUNCATE orders, otp_store, notifications RESTART IDENTITY CASCADE;

-- ─── Admin account setup (production) ────────────────────────────────────────
-- Run this ONCE after production database is set up
-- Generate bcrypt hash: node -e "const b=require('bcrypt');b.hash('FarmConnect@2026',10).then(console.log)"

INSERT INTO admins (name, email, phone, password_hash, role)
SELECT
  'Farm Connect Admin',
  'admin@farmconnect.in',
  '9999000001',
  'PASTE_BCRYPT_HASH_HERE',
  'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@farmconnect.in');
