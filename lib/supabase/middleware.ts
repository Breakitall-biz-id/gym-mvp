import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: You have to use the same variable name for the user object.
  // This is because Next.js will throw a "Server Component" error if you don't.
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#using-requestcookies-in-middleware
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('Middleware - Path:', request.nextUrl.pathname)
  console.log('Middleware - User exists:', !!user)
  if (user) {
    console.log('Middleware - User ID:', user.id)
  }

  let userProfile = null
  if (user) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, member_id')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.log('Middleware - Profile query error:', error)
      }
      if (profile) {
        console.log('Middleware - Profile data:', profile)
      }
      userProfile = profile
    } catch (error) {
      console.log('Middleware - Profile fetch error:', error)
    }
  }

  // Define protected routes
  const adminStaffRoutes = ['/dashboard', '/members', '/checkin', '/plans', '/payments']
  const memberRoutes = ['/app']
  
  const isAdminStaffRoute = adminStaffRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isMemberRoute = memberRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isRootPath = request.nextUrl.pathname === '/'
  const isLoginPath = request.nextUrl.pathname === '/login'

  // Redirect logic
  if (!user && (isAdminStaffRoute || isMemberRoute)) {
    console.log('No user, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Handle root path redirects based on authentication
  if (isRootPath) {
    if (!user) {
      console.log('Middleware - No user at root, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (user && userProfile) {
      if (userProfile.role === 'MEMBER') {
        console.log('Middleware - Member at root, redirecting to app')
        return NextResponse.redirect(new URL('/app', request.url))
      } else if (userProfile.role === 'ADMIN' || userProfile.role === 'STAFF') {
        console.log('Middleware - Admin/Staff at root, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // If user exists but no profile, redirect to login
    if (user && !userProfile) {
      console.log('Middleware - User exists but no profile, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (user && userProfile) {
    // Redirect from login page if already authenticated
    if (isLoginPath) {
      console.log('Middleware - Authenticated user at login, redirecting based on role:', userProfile.role)
      const redirectUrl = userProfile.role === 'MEMBER' ? '/app' : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Check role permissions
    if (isAdminStaffRoute && userProfile.role === 'MEMBER') {
      console.log('Middleware - Member trying to access admin route, redirecting to app')
      return NextResponse.redirect(new URL('/app', request.url))
    }

    if (isMemberRoute && userProfile.role !== 'MEMBER') {
      console.log('Middleware - Admin/Staff trying to access member route, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}