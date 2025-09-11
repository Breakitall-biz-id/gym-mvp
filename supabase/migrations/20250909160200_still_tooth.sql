/*
  # Gym Management System Database Schema

  1. New Tables
    - `profiles` - User profiles linked to auth.users
    - `members` - Gym members (can be linked to user profiles)
    - `membership_plans` - Available membership plans
    - `subscriptions` - Member subscriptions to plans
    - `attendance` - Check-in records
    - `qr_tokens` - QR codes for member check-ins
    - `payments` - Payment records

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - ADMIN/STAFF: full access to all data
    - MEMBER: access to own data only
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text CHECK (role IN ('ADMIN', 'STAFF', 'MEMBER')) NOT NULL DEFAULT 'MEMBER',
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create membership_plans table
CREATE TABLE IF NOT EXISTS membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  duration_days int NOT NULL CHECK (duration_days > 0),
  price_cents bigint NOT NULL CHECK (price_cents >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES membership_plans(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text CHECK (status IN ('active', 'expired', 'cancelled')) NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  checked_in_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create qr_tokens table
CREATE TABLE IF NOT EXISTS qr_tokens (
  token text PRIMARY KEY,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL,
  method text CHECK (method IN ('cash', 'transfer', 'ewallet')),
  status text CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) NOT NULL,
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin/Staff can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Members policies
CREATE POLICY "Admin/Staff can manage members" ON members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

CREATE POLICY "Members can view own data" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND member_id = members.id
    )
  );

-- Membership plans policies
CREATE POLICY "Admin can manage plans" ON membership_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Staff/Members can view active plans" ON membership_plans
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF', 'MEMBER')
    )
  );

-- Subscriptions policies
CREATE POLICY "Admin/Staff can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

CREATE POLICY "Members can view own subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND member_id = subscriptions.member_id
    )
  );

-- Attendance policies
CREATE POLICY "Admin/Staff can manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

CREATE POLICY "Members can view own attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND member_id = attendance.member_id
    )
  );

-- QR tokens policies
CREATE POLICY "Admin/Staff can manage QR tokens" ON qr_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

CREATE POLICY "Members can view own active tokens" ON qr_tokens
  FOR SELECT USING (
    expires_at > now() AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND member_id = qr_tokens.member_id
    )
  );

-- Payments policies
CREATE POLICY "Admin/Staff can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
    )
  );

CREATE POLICY "Members can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND member_id = payments.member_id
    )
  );

-- Add foreign key constraint after members table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_member_id_fkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_member_id_fkey
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_end_date ON subscriptions(status, end_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id_date ON attendance(member_id, checked_in_at);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_expires_at ON qr_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_paid_at ON payments(status, paid_at);