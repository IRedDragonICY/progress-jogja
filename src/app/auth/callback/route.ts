import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('Auth callback called with:', { code: !!code, next, error, errorDescription })

  // Jika ada error dari Supabase, redirect ke login dengan error message
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', error)
    loginUrl.searchParams.set('message', errorDescription || 'Authentication failed')
    return NextResponse.redirect(loginUrl)
  }

  // Jika tidak ada code, redirect ke login
  if (!code) {
    console.warn('No auth code provided in callback')
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('message', 'No authentication code provided')
    return NextResponse.redirect(loginUrl)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    // Exchange code for session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      
      // Clear any existing invalid cookies
      const allCookies = cookieStore.getAll()
      allCookies.forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
          cookieStore.set({ name: cookie.name, value: '', maxAge: 0 })
        }
      })

      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('error', 'auth_error')
      loginUrl.searchParams.set('message', 'Failed to confirm email. Please try again.')
      return NextResponse.redirect(loginUrl)
    }

    if (!session) {
      console.warn('No session created after code exchange')
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('message', 'Unable to create session. Please try logging in again.')
      return NextResponse.redirect(loginUrl)
    }

    // Verify user exists and is valid
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error getting user after session creation:', userError)
      
      // Sign out to clear any invalid session
      await supabase.auth.signOut()
      
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('message', 'Session verification failed. Please try logging in again.')
      return NextResponse.redirect(loginUrl)
    }

    // Check if user email is confirmed
    if (!user.email_confirmed_at) {
      console.warn('User email not confirmed after callback')
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('message', 'Email not confirmed. Please check your email and try again.')
      return NextResponse.redirect(loginUrl)
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError)
      // Continue anyway, profile might be created by trigger
    }

    console.log('Auth callback successful for user:', user.id)

    // Success - redirect to intended destination
    const redirectUrl = new URL(next, origin)
    
    // Add success message for email confirmation
    if (searchParams.get('type') === 'signup') {
      redirectUrl.searchParams.set('message', 'Email confirmed successfully! Welcome to Progress Jogja.')
    }

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    
    // Clear any potentially corrupted cookies
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        cookieStore.set({ name: cookie.name, value: '', maxAge: 0 })
      }
    })

    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'unexpected_error')
    loginUrl.searchParams.set('message', 'An unexpected error occurred. Please try logging in again.')
    return NextResponse.redirect(loginUrl)
  }
} 