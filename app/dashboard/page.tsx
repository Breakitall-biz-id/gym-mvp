import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Clock, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  UserCheck,
  Plus
} from 'lucide-react'
import { DashboardStats } from '@/lib/types'
import Link from 'next/link'

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-muted rounded w-48 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="h-10 bg-muted rounded w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-8 bg-muted rounded w-16" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function getDashboardStats(): Promise<DashboardStats & { 
  totalRevenue: number, 
  newMembers: number,
  totalMembers: number,
  growthRate: number 
}> {
  const supabase = createClient()
  
  // Get active members count
  const { count: activeMembers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString().split('T')[0])

  // Get total members count
  const { count: totalMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // Get expiring soon count (next 7 days)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const { count: expiringSoon } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString().split('T')[0])
    .lte('end_date', nextWeek.toISOString().split('T')[0])

  // Get today's check-ins
  const today = new Date().toISOString().split('T')[0]
  const { count: todaysCheckins } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .gte('checked_in_at', `${today}T00:00:00`)
    .lt('checked_in_at', `${today}T23:59:59`)

  // Get this month's revenue
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const { data: thisMonthPayments } = await supabase
    .from('payments')
    .select('amount_cents')
    .eq('status', 'paid')
    .gte('paid_at', firstOfMonth.toISOString())

  const totalRevenue = thisMonthPayments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0

  // Get new members this month
  const { count: newMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstOfMonth.toISOString())

  // Get last month's members for growth calculation
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const { count: lastMonthMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstOfLastMonth.toISOString())
    .lte('created_at', lastOfLastMonth.toISOString())

  const growthRate = lastMonthMembers && lastMonthMembers > 0 
    ? ((newMembers || 0) - lastMonthMembers) / lastMonthMembers * 100 
    : 0

  // Get check-in chart data (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  
  const { data: checkinData } = await supabase
    .from('attendance')
    .select('checked_in_at')
    .gte('checked_in_at', thirtyDaysAgo.toISOString())
    .order('checked_in_at', { ascending: true })

  // Process check-in data by date
  const checkinsByDate: { [key: string]: number } = {}
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toISOString().split('T')[0]
    checkinsByDate[dateStr] = 0
  }

  checkinData?.forEach(checkin => {
    const date = checkin.checked_in_at.split('T')[0]
    if (checkinsByDate[date] !== undefined) {
      checkinsByDate[date]++
    }
  })

  const checkinChartData = Object.entries(checkinsByDate).map(([date, checkins]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    checkins
  }))

  return {
    active_members: activeMembers || 0,
    expiring_soon: expiringSoon || 0,
    todays_checkins: todaysCheckins || 0,
    checkin_chart_data: checkinChartData,
    totalRevenue: totalRevenue / 100,
    newMembers: newMembers || 0,
    totalMembers: totalMembers || 0,
    growthRate
  }
}

async function getRecentMembers() {
  const supabase = createClient()
  
  const { data: recentMembers } = await supabase
    .from('members')
    .select(`
      id,
      full_name,
      phone,
      email,
      created_at,
      subscriptions:subscriptions(
        id,
        status,
        end_date,
        membership_plan:membership_plans(name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return recentMembers?.map(member => ({
    ...member,
    active_subscription: member.subscriptions?.find((sub: any) => 
      sub.status === 'active' && new Date(sub.end_date) >= new Date()
    ) || null
  })) || []
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const stats = await getDashboardStats()
  const recentMembers = await getRecentMembers()

  const maxCheckins = Math.max(...stats.checkin_chart_data.map(d => d.checkins), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your gym.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Quick Create
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">+12.5%</span>
              <span className="ml-1">Trending up this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newMembers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              <span className="text-red-500">-20%</span>
              <span className="ml-1">Down 20% this period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_members}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">+{stats.growthRate.toFixed(1)}%</span>
              <span className="ml-1">Strong member retention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growthRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">+4.5%</span>
              <span className="ml-1">Steady performance increase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Member Check-ins</CardTitle>
              <CardDescription>Total for the last 30 days</CardDescription>
            </div>
            <Tabs defaultValue="30days" className="w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="7days">Last 7 days</TabsTrigger>
                <TabsTrigger value="30days">Last 30 days</TabsTrigger>
                <TabsTrigger value="3months">Last 3 months</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {/* Simple area chart representation */}
            <div className="relative h-full w-full bg-gradient-to-t from-primary/20 to-primary/5 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                {stats.checkin_chart_data.slice(-30).map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center"
                    style={{ width: `${100 / 30}%` }}
                  >
                    <div
                      className="w-1 bg-primary rounded-t-sm mb-1"
                      style={{
                        height: `${(day.checkins / maxCheckins) * 200}px`,
                        minHeight: '2px'
                      }}
                    />
                    {index % 5 === 0 && (
                      <span className="text-xs text-muted-foreground transform -rotate-45 origin-left">
                        {day.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Tooltip simulation */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg p-2 shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium">Check-ins: {stats.todays_checkins}</span>
                </div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
            <CardDescription>Latest member registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent members</p>
              ) : (
                recentMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {member.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={member.active_subscription ? "default" : "secondary"}>
                      {member.active_subscription ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/members/new">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Member
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/checkin">
                  <Activity className="h-4 w-4 mr-2" />
                  Member Check-in
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/payments">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Payment
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/plans">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Plans
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}