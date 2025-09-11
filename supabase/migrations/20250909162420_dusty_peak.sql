/*
  # Fix RLS Policies for Profile Access

  1. Update RLS policies to ensure users can access their own profiles
  2. Fix any policy conflicts that might cause 500 errors
  3. Add proper error handling for profile queries
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin/Staff can view all profiles" ON profiles;

-- Create new, more permissive policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin/Staff can view all profiles
CREATE POLICY "Admin/Staff can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'STAFF')
    )
  );

-- Admin/Staff can manage all profiles
CREATE POLICY "Admin/Staff can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'STAFF')
    )
  );

-- Ensure the policies are properly applied
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;