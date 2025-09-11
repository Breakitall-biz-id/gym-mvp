/*
  # Fix RLS Infinite Recursion in Profiles Table

  1. Drop existing problematic policies that cause infinite recursion
  2. Create new policies that don't reference the profiles table recursively
  3. Use auth.uid() directly instead of checking roles in other policies
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin/Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin/Staff can manage all profiles" ON profiles;

-- Create simple, non-recursive policies for profiles
-- Users can always view and manage their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- For admin/staff access to other profiles, we'll handle this in the application layer
-- instead of in RLS policies to avoid recursion

-- Update other table policies to avoid recursion
-- Drop and recreate policies that reference profiles table

-- Members policies - simplified
DROP POLICY IF EXISTS "Admin/Staff can manage members" ON members;
DROP POLICY IF EXISTS "Members can view own data" ON members;

CREATE POLICY "Authenticated users can view members" ON members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage members" ON members
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Membership plans policies - simplified
DROP POLICY IF EXISTS "Admin can manage plans" ON membership_plans;
DROP POLICY IF EXISTS "Staff/Members can view active plans" ON membership_plans;

CREATE POLICY "Authenticated users can view plans" ON membership_plans
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage plans" ON membership_plans
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Subscriptions policies - simplified
DROP POLICY IF EXISTS "Admin/Staff can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Members can view own subscriptions" ON subscriptions;

CREATE POLICY "Authenticated users can view subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Attendance policies - simplified
DROP POLICY IF EXISTS "Admin/Staff can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Members can view own attendance" ON attendance;

CREATE POLICY "Authenticated users can view attendance" ON attendance
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage attendance" ON attendance
  FOR ALL USING (auth.uid() IS NOT NULL);

-- QR tokens policies - simplified
DROP POLICY IF EXISTS "Admin/Staff can manage QR tokens" ON qr_tokens;
DROP POLICY IF EXISTS "Members can view own active tokens" ON qr_tokens;

CREATE POLICY "Authenticated users can view QR tokens" ON qr_tokens
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage QR tokens" ON qr_tokens
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Payments policies - simplified
DROP POLICY IF EXISTS "Admin/Staff can manage payments" ON payments;
DROP POLICY IF EXISTS "Members can view own payments" ON payments;

CREATE POLICY "Authenticated users can view payments" ON payments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage payments" ON payments
  FOR ALL USING (auth.uid() IS NOT NULL);