import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const memberSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

export const membershipPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day'),
  price_cents: z.number().min(0, 'Price cannot be negative'),
  is_active: z.boolean().default(true),
})

export const subscriptionSchema = z.object({
  member_id: z.string().min(1, 'Member is required'),
  plan_id: z.string().min(1, 'Plan is required'),
  start_date: z.string().min(1, 'Start date is required'),
})

export const paymentSchema = z.object({
  member_id: z.string().min(1, 'Member is required'),
  subscription_id: z.string().optional(),
  amount_cents: z.number().min(1, 'Amount must be greater than 0'),
  method: z.enum(['cash', 'transfer', 'ewallet']),
  status: z.enum(['pending', 'paid']).default('paid'),
  paid_at: z.string().optional(),
  notes: z.string().optional(),
})

export const checkinSchema = z.object({
  token: z.string().min(1, 'QR token is required'),
})