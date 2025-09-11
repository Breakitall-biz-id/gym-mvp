/*
  # Seed Demo Data for Gym Management System

  1. Create demo users and profiles
  2. Create membership plans
  3. Create demo members
  4. Create subscriptions
  5. Create demo attendance records
  6. Create QR tokens
  7. Create payment records
*/

-- Insert demo membership plans
INSERT INTO membership_plans (name, duration_days, price_cents, is_active) VALUES
  ('Monthly', 30, 4999, true),
  ('Quarterly', 90, 12999, true),
  ('Annual', 365, 49999, true),
  ('Weekly Trial', 7, 999, true);

-- Insert demo members
INSERT INTO members (id, full_name, phone, email, photo_url) VALUES
  (gen_random_uuid(), 'John Smith', '+1234567890', 'john.smith@example.com', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=200&h=200&fit=crop&crop=face'),
  (gen_random_uuid(), 'Sarah Johnson', '+1234567891', 'sarah.johnson@example.com', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200&h=200&fit=crop&crop=face'),
  (gen_random_uuid(), 'Mike Chen', '+1234567892', 'mike.chen@example.com', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=200&h=200&fit=crop&crop=face'),
  (gen_random_uuid(), 'Emily Davis', '+1234567893', 'emily.davis@example.com', 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=200&h=200&fit=crop&crop=face'),
  (gen_random_uuid(), 'David Wilson', '+1234567894', 'david.wilson@example.com', null),
  (gen_random_uuid(), 'Lisa Brown', '+1234567895', 'lisa.brown@example.com', null),
  (gen_random_uuid(), 'Tom Anderson', '+1234567896', 'tom.anderson@example.com', null),
  (gen_random_uuid(), 'Anna Garcia', '+1234567897', 'anna.garcia@example.com', null),
  (gen_random_uuid(), 'Chris Taylor', '+1234567898', 'chris.taylor@example.com', null),
  (gen_random_uuid(), 'Jessica Martinez', '+1234567899', 'jessica.martinez@example.com', null);

-- Insert demo subscriptions (mix of active and expired)
WITH member_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM members LIMIT 10
),
plan_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY duration_days) as rn FROM membership_plans
)
INSERT INTO subscriptions (member_id, plan_id, start_date, end_date, status)
SELECT 
  m.id,
  p.id,
  CASE 
    WHEN m.rn <= 7 THEN (CURRENT_DATE - INTERVAL '15 days')::date -- Active members
    ELSE (CURRENT_DATE - INTERVAL '45 days')::date -- Expired members
  END as start_date,
  CASE 
    WHEN m.rn <= 7 THEN (CURRENT_DATE + INTERVAL '15 days')::date -- Active until 15 days from now
    ELSE (CURRENT_DATE - INTERVAL '15 days')::date -- Expired 15 days ago
  END as end_date,
  CASE 
    WHEN m.rn <= 7 THEN 'active'
    ELSE 'expired'
  END as status
FROM member_ids m
JOIN plan_ids p ON (m.rn - 1) % 4 + 1 = p.rn; -- Cycle through plans

-- Insert demo attendance records (last 14 days)
WITH member_ids AS (
  SELECT id FROM members ORDER BY created_at LIMIT 7 -- Only active members
),
dates AS (
  SELECT (CURRENT_DATE - INTERVAL '13 days' + (i || ' days')::INTERVAL)::date as check_date
  FROM generate_series(0, 13) i
)
INSERT INTO attendance (member_id, checked_in_at)
SELECT 
  m.id,
  (d.check_date + (EXTRACT(hour from NOW()) || ' hours')::INTERVAL + 
   (random() * 120 - 60 || ' minutes')::INTERVAL) as checked_in_at
FROM member_ids m
CROSS JOIN dates d
WHERE random() > 0.3; -- 70% chance of attendance each day

-- Insert QR tokens for active members (7 day expiry)
INSERT INTO qr_tokens (token, member_id, expires_at)
SELECT 
  'qr_' || encode(gen_random_bytes(16), 'hex') as token,
  s.member_id,
  (NOW() + INTERVAL '7 days') as expires_at
FROM subscriptions s
WHERE s.status = 'active' AND s.end_date >= CURRENT_DATE;

-- Insert demo payment records
WITH active_subscriptions AS (
  SELECT s.id as subscription_id, s.member_id, mp.price_cents
  FROM subscriptions s
  JOIN membership_plans mp ON s.plan_id = mp.id
  WHERE s.status = 'active'
)
INSERT INTO payments (member_id, subscription_id, amount_cents, method, status, paid_at, notes)
SELECT 
  as_sub.member_id,
  as_sub.subscription_id,
  as_sub.price_cents,
  CASE (random() * 3)::int
    WHEN 0 THEN 'cash'
    WHEN 1 THEN 'transfer'
    ELSE 'ewallet'
  END as method,
  'paid' as status,
  (NOW() - INTERVAL '5 days' + (random() * INTERVAL '5 days')) as paid_at,
  'Membership payment' as notes
FROM active_subscriptions as_sub;

-- Insert some additional manual payments
INSERT INTO payments (member_id, amount_cents, method, status, paid_at, notes)
SELECT 
  m.id,
  (random() * 2000 + 1000)::int as amount_cents, -- $10-30
  'cash' as method,
  'paid' as status,
  (NOW() - INTERVAL '2 days' + (random() * INTERVAL '2 days')) as paid_at,
  'Personal training session' as notes
FROM members m
ORDER BY random()
LIMIT 3;