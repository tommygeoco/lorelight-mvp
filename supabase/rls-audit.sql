-- RLS Policy Audit Script
-- Run this to verify all tables have proper Row Level Security

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify critical tables have RLS
SELECT 
  t.tablename,
  t.rowsecurity as has_rls,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'campaigns',
    'sessions',
    'scenes',
    'session_scenes',
    'audio_files',
    'audio_folders',
    'audio_playlists',
    'playlist_audio',
    'light_configs',
    'hue_settings',
    'scene_blocks',
    'scene_npcs'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- Expected result: All tables should have rls_enabled=true and policy_count > 0

