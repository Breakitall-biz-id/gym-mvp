'use client'

import { useState, useMemo } from 'react'
import { Member } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MoreHorizontal, Phone, Mail, QrCode, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface MembersClientProps {
  members: Member[]
}

export function MembersClient({ members }: MembersClientProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          member.phone?.toLowerCase().includes(search.toLowerCase()) ||
                          member.email?.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter === 'active') {
        return member.active_subscription !== null
      } else if (statusFilter === 'expired') {
        return member.active_subscription === null
      } else if (statusFilter === 'expiring') {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        return member.active_subscription && 
               new Date(member.active_subscription.end_date) <= nextWeek &&
               new Date(member.active_subscription.end_date) >= new Date()
      }

      return true
    })
  }, [members, search, statusFilter])

  const getStatusBadge = (member: Member) => {
    if (!member.active_subscription) {
      return <Badge variant="secondary">Expired</Badge>
    }

    const endDate = new Date(member.active_subscription.end_date)
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    if (endDate < today) {
      return <Badge variant="secondary">Expired</Badge>
    } else if (endDate <= nextWeek) {
      return <Badge variant="outline" className="text-orange-500 border-orange-500">Expiring</Badge>
    } else {
      return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No members found matching your criteria.</p>
            <Button asChild className="mt-4">
              <Link href="/members/new">Add First Member</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.photo_url || ''} />
                      <AvatarFallback>
                        {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{member.full_name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/members/${member.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/members/${member.id}/qr`}>
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate QR
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2">
                  {getStatusBadge(member)}
                  
                  {member.active_subscription && (
                    <div className="text-sm text-muted-foreground">
                      <p>{member.active_subscription.membership_plan?.name}</p>
                      <p>Expires: {new Date(member.active_subscription.end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}