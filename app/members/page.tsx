import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Search, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { MembersClient } from './members-client'
import { Member } from '@/lib/types'

async function getMembers(): Promise<Member[]> {
  const supabase = createClient()
  
  const { data: members } = await supabase
    .from('members')
    .select(`
      *,
      subscriptions:subscriptions(
        id,
        start_date,
        end_date,
        status,
        membership_plan:membership_plans(name, duration_days)
      )
    `)
    .order('created_at', { ascending: false })

  return members?.map(member => ({
    ...member,
    active_subscription: member.subscriptions?.find((sub: any) => 
      sub.status === 'active' && 
      new Date(sub.end_date) >= new Date()
    ) || null
  })) || []
}

function MembersLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function MembersPage() {
  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage gym members and their subscriptions</p>
        </div>
        <Button asChild>
          <Link href="/members/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Link>
        </Button>
      </div>

      <Suspense fallback={<MembersLoading />}>
        <MembersClient members={members} />
      </Suspense>
    </div>
  )
}