'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrCode, Keyboard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { QRScanner } from './qr-scanner'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface CheckinResult {
  success: boolean
  member?: {
    id: string
    full_name: string
    photo_url?: string
  }
  status?: 'active' | 'expired'
  checked_in_at?: string
  message?: string
}

export default function CheckinPage() {
  const [loading, setLoading] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null)
  const [todaysCheckins, setTodaysCheckins] = useState<any[]>([])

  const supabase = createClient()

  const handleCheckin = async (token: string) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()
      
      if (result.success) {
        setCheckinResult(result)
        toast.success(`${result.member.full_name} checked in successfully!`)
        loadTodaysCheckins()
      } else {
        setCheckinResult(result)
        toast.error(result.message || 'Check-in failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
      setManualToken('')
    }
  }

  const loadTodaysCheckins = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: checkins } = await supabase
      .from('attendance')
      .select(`
        id,
        checked_in_at,
        member:members(
          id,
          full_name,
          photo_url
        )
      `)
      .gte('checked_in_at', `${today}T00:00:00`)
      .lt('checked_in_at', `${today}T23:59:59`)
      .order('checked_in_at', { ascending: false })

    setTodaysCheckins(checkins || [])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Member Check-in</h1>
        <p className="text-muted-foreground">Scan QR codes or enter tokens manually</p>
      </div>

      {/* Check-in Result */}
      {checkinResult && (
        <Card className={`border-2 ${checkinResult.success ? 'border-green-500' : 'border-red-500'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {checkinResult.success ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
              
              <div className="flex-1">
                {checkinResult.member ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={checkinResult.member.photo_url || ''} />
                      <AvatarFallback className="text-lg">
                        {checkinResult.member.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{checkinResult.member.full_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={checkinResult.status === 'active' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                          }
                        >
                          {checkinResult.status === 'active' ? 'Active Member' : 'Expired'}
                        </Badge>
                        {checkinResult.checked_in_at && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {new Date(checkinResult.checked_in_at).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-red-500">Check-in Failed</h3>
                    <p className="text-muted-foreground">{checkinResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Methods</CardTitle>
          <CardDescription>Choose your preferred check-in method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scanner" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Scanner
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="scanner" className="mt-4">
              <QRScanner
                onScan={handleCheckin}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">QR Token</label>
                  <Input
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter QR token manually"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={() => handleCheckin(manualToken)}
                  disabled={!manualToken || loading}
                  className="w-full"
                >
                  {loading ? 'Checking in...' : 'Check In'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Today's Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Check-ins</CardTitle>
          <CardDescription>Recent member check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          {todaysCheckins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No check-ins today</p>
              <Button 
                variant="outline" 
                onClick={loadTodaysCheckins}
                className="mt-2"
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysCheckins.map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={checkin.member?.photo_url || ''} />
                      <AvatarFallback>
                        {checkin.member?.full_name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{checkin.member?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(checkin.checked_in_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}