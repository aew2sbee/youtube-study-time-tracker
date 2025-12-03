-- Enable Row Level Security (RLS) on all tables
ALTER TABLE "study" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Policy: Public read access for users (needed for leaderboard functionality)
CREATE POLICY "Public users can view all users"
ON "users"
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Only service role can insert users (controlled by backend)
CREATE POLICY "Service role can insert users"
ON "users"
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Only service role can update users
CREATE POLICY "Service role can update users"
ON "users"
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- No DELETE policy - prevents any deletion of user records

-- ============================================
-- STUDY TABLE POLICIES
-- ============================================

-- Policy: Public read access for study records (needed for leaderboard)
CREATE POLICY "Public can view all study records"
ON "study"
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Only service role can insert study records (controlled by backend)
CREATE POLICY "Service role can insert study records"
ON "study"
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Only service role can update study records
CREATE POLICY "Service role can update study records"
ON "study"
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- No DELETE policy - prevents any deletion of study records (audit trail)

-- ============================================
-- ADDITIONAL SECURITY RECOMMENDATIONS
-- ============================================

-- Note: Since this appears to be a YouTube study time tracker with a public leaderboard,
-- the read policies are open. However, write operations are restricted to service_role only.
-- This ensures that all data modifications go through your backend API where you can:
-- 1. Validate YouTube channel IDs
-- 2. Verify OAuth tokens
-- 3. Apply rate limiting
-- 4. Log all changes for audit purposes

-- If you need user-specific access in the future, consider:
-- 1. Adding an auth.users table reference
-- 2. Using auth.uid() in policies
-- 3. Implementing user-specific write permissions

-- Example of user-specific policy (commented out for reference):
-- CREATE POLICY "Users can update their own study records"
-- ON "study"
-- FOR UPDATE
-- TO authenticated
-- USING (user_id IN (
--   SELECT id FROM users WHERE channel_id = auth.jwt() ->> 'channel_id'
-- ))
-- WITH CHECK (user_id IN (
--   SELECT id FROM users WHERE channel_id = auth.jwt() ->> 'channel_id'
-- ));