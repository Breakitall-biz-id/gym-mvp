import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkinSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = checkinSchema.parse(body)

    const supabase = createClient()

    // Verify QR token
    const { data: qrToken, error: tokenError } = await supabase
      .from('qr_tokens')
      .select(`
        member_id,
        expires_at,
        member:members(
          id,
          full_name,
          photo_url
        )
      `)
      .eq('token', token)
      .single()

    if (tokenError || !qrToken) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired QR code'
      }, { status: 400 })
    }

    // Check if token is expired
    if (new Date(qrToken.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'QR code has expired'
      }, { status: 400 })
    }

    // Check member's subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('member_id', qrToken.member_id)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('end_date', { ascending: false })
      .limit(1)
      .single()

    const status = subscription ? 'active' : 'expired'

    // Check if member is already checked-in (no checked_out_at today)
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_id', qrToken.member_id)
      .gte('checked_in_at', `${today}T00:00:00`)
      .lt('checked_in_at', `${today}T23:59:59`)
      .is('checked_out_at', null)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single();

    if (existingAttendance) {
      // Do check-out: update checked_out_at
      const { data: updated, error: updateError } = await supabase
        .from('attendance')
        .update({ checked_out_at: new Date().toISOString() })
        .eq('id', existingAttendance.id)
        .select()
        .single();
      if (updateError) {
        return NextResponse.json({
          success: false,
          message: 'Failed to record check-out'
        }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        member: qrToken.member,
        status,
        checked_in_at: updated.checked_in_at,
        checked_out_at: updated.checked_out_at,
        message: 'Check-out successful'
      });
    } else {
      // Do check-in: create new attendance record
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          member_id: qrToken.member_id,
          checked_in_at: new Date().toISOString()
        })
        .select()
        .single();
      if (attendanceError) {
        return NextResponse.json({
          success: false,
          message: 'Failed to record attendance'
        }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        member: qrToken.member,
        status,
        checked_in_at: attendance.checked_in_at,
        message: status === 'expired' ? 'Member checked in but subscription is expired' : 'Check-in successful'
      });
    }

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}