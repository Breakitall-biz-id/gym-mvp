export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: 'ADMIN' | 'STAFF' | 'MEMBER'
  member_id: string | null
  created_at: string
}

export interface Member {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  photo_url: string | null
  created_at: string
  subscriptions?: Subscription[]
  active_subscription?: Subscription | null
}

export interface MembershipPlan {
  id: string
  name: string
  duration_days: number
  price_cents: number
  is_active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  created_at: string
  membership_plan?: MembershipPlan
  member?: Member
}

export interface Attendance {
  id: string
  member_id: string
  checked_in_at: string
  created_at: string
  member?: Member
}

export interface QRToken {
  token: string
  member_id: string
  expires_at: string
  created_at: string
  member?: Member
}

export interface Payment {
  id: string
  member_id: string | null
  subscription_id: string | null
  amount_cents: number
  method: 'cash' | 'transfer' | 'ewallet'
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paid_at: string | null
  notes: string | null
  created_at: string
  member?: Member
  subscription?: Subscription
}

export interface DashboardStats {
  active_members: number
  expiring_soon: number
  todays_checkins: number
  checkin_chart_data: Array<{
    date: string
    checkins: number
  }>
}