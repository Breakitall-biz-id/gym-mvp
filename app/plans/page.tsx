import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { PlansClient } from './plans-client'
import { MembershipPlan } from '@/lib/types'

async function getPlans(): Promise<MembershipPlan[]> {
  const supabase = createClient()
  
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('*')
    .order('duration_days', { ascending: true })

  return plans || []
}

export default async function PlansPage() {
  const plans = await getPlans()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground">Manage your gym's membership plans and pricing</p>
        </div>
        <Button asChild>
          <Link href="/plans/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-primary">
                    ${(plan.price_cents / 100).toFixed(2)}
                  </CardDescription>
                </div>
                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {plan.duration_days} days duration
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  ${((plan.price_cents / 100) / plan.duration_days).toFixed(2)} per day
                </div>

                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/plans/${plan.id}/edit`}>
                      Edit Plan
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No membership plans</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first membership plan to get started
                </p>
                <Button asChild>
                  <Link href="/plans/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PlansClient />
      </Suspense>
    </div>
  )
}