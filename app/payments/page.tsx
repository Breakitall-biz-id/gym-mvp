import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DollarSign, TrendingUp, Calendar, Plus } from 'lucide-react'
import { Payment } from '@/lib/types'

async function getPaymentStats() {
  const supabase = createClient()
  
  // Get this month's payments
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const { data: thisMonthPayments } = await supabase
    .from('payments')
    .select('amount_cents')
    .eq('status', 'paid')
    .gte('paid_at', firstOfMonth.toISOString())
    .lte('paid_at', lastOfMonth.toISOString())

  const thisMonthTotal = thisMonthPayments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0

  // Get last month's total for comparison
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const { data: lastMonthPayments } = await supabase
    .from('payments')
    .select('amount_cents')
    .eq('status', 'paid')
    .gte('paid_at', firstOfLastMonth.toISOString())
    .lte('paid_at', lastOfLastMonth.toISOString())

  const lastMonthTotal = lastMonthPayments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0

  return {
    thisMonthTotal: thisMonthTotal / 100,
    lastMonthTotal: lastMonthTotal / 100,
    growth: lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0
  }
}

async function getRecentPayments(): Promise<Payment[]> {
  const supabase = createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      member:members(
        id,
        full_name,
        photo_url
      ),
      subscription:subscriptions(
        id,
        membership_plan:membership_plans(name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return payments || []
}

export default async function PaymentsPage() {
  const stats = await getPaymentStats()
  const payments = await getRecentPayments()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline">Cash</Badge>
      case 'transfer':
        return <Badge variant="outline">Transfer</Badge>
      case 'ewallet':
        return <Badge variant="outline">E-Wallet</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track and manage member payments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats.thisMonthTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.lastMonthTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Previous month total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={payment.member?.photo_url || ''} />
                      <AvatarFallback>
                        {payment.member?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium">{payment.member?.full_name || 'Unknown Member'}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{payment.subscription?.membership_plan?.name || 'Manual Payment'}</span>
                        {payment.notes && (
                          <>
                            <span>•</span>
                            <span>{payment.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${(payment.amount_cents / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(payment.status)}
                      {getMethodBadge(payment.method)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}