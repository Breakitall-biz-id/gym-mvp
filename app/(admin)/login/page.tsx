'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Dumbbell } from 'lucide-react'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    
    try {
      
      const { error } = await supabase.auth.signInWithPassword(data)
      
      if (error) {
        console.error('❌ Login error:', error.message)
        console.error('❌ Full error:', error)
        toast.error(error.message)
      } else {
        toast.success('Logged in successfully')
        
        // Get user profile to determine redirect
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (currentUser) {
          
          // Wait a bit longer for session to be established
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()
          
          
          // Redirect based on role
          if (profile?.role === 'MEMBER') {
            console.log('Login - Member role, redirecting to app')
            window.location.href = '/app'
          } else if (profile?.role === 'ADMIN' || profile?.role === 'STAFF') {
            console.log('Login - Admin/Staff role, redirecting to dashboard')
            window.location.href = '/dashboard'
          } else {
            console.log('Login - No valid role found, redirecting to home')
            // Create a basic profile if none exists
            console.log('🔧 Creating basic profile...')
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: currentUser.id,
                full_name: currentUser.email?.split('@')[0] || 'User',
                role: 'ADMIN' // Default to ADMIN for now
              })
            
            if (insertError) {
              console.error('❌ Profile creation error:', insertError)
              toast.error('Failed to create user profile')
            } else {
              console.log('✅ Profile created, redirecting to dashboard')
              window.location.replace('/dashboard')
            }
          }
        } else {
          console.log('Login - No current user found, redirecting to home')
          toast.error('Authentication failed - no user found')
          window.location.href = '/'
        }
      }
    } catch (error) {
      console.error('❌ Login catch error:', error)
      if (error instanceof Error) {
        toast.error(`Connection error: ${error.message}`)
      } else {
        toast.error('Network connection failed - check your Supabase setup')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">FitPro Gym</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register('email')}
                type="email"
                placeholder="admin@example.com"
                className="bg-muted border-border"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register('password')}
                type="password"
                placeholder="Enter your password"
                className="bg-muted border-border"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo accounts:</p>
            <p>Admin: admin@example.com / Admin123!</p>
            <p>Staff: staff@example.com / Staff123!</p>
            <p>Member: member@example.com / Member123!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}