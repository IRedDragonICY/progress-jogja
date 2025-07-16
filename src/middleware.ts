import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Utility function untuk membersihkan cookies yang invalid
 */
function clearInvalidCookies(response: NextResponse, request: NextRequest) {
  // Ambil semua cookies yang ada
  const cookies = request.cookies.getAll()
  
  // Hapus semua cookies yang berkaitan dengan Supabase
  cookies.forEach(cookie => {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set({
        name: cookie.name,
        value: '',
        expires: new Date(0),
        path: '/',
        domain: request.nextUrl.hostname,
        secure: request.nextUrl.protocol === 'https:',
        httpOnly: true,
        sameSite: 'lax'
      })
    }
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware untuk static files dan API routes yang tidak memerlukan auth
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Buat response kosong yang akan kita modifikasi
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Buat Supabase client di sisi server
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Middleware ini akan mengatur cookie di response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Middleware ini akan menghapus cookie di response
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  let user = null
  let authError = null

  try {
    // Coba ambil user dengan error handling yang robust
    const { data: { user: currentUser }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.warn('Auth error in middleware:', error.message)
      authError = error
      
      // Jika error disebabkan oleh cookies yang invalid, bersihkan cookies
      if (error.message.includes('invalid') || error.message.includes('expired') || error.message.includes('malformed')) {
        clearInvalidCookies(response, request)
      }
    } else {
      user = currentUser
    }
  } catch (error) {
    console.error('Unexpected error in middleware auth check:', error)
    authError = error
    clearInvalidCookies(response, request)
  }

  const authRoutes = ['/login', '/register']
  const protectedRoutes = ['/admin', '/profile', '/checkout']

  // Jika user sudah login dan valid
  if (user && !authError) {
    // dan mencoba mengakses halaman login/register, redirect ke home
    if (authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Jika user mencoba mengakses /admin, cek role
    if (pathname.startsWith('/admin')) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || profile?.role !== 'admin') {
          console.warn('Admin access denied for user:', user.id)
          return NextResponse.redirect(new URL('/', request.url))
        }
      } catch (error) {
        console.error('Error checking admin role:', error)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }
  // Jika user belum login atau ada error auth
  else {
    // Skip auth redirect untuk auth callback route
    if (pathname.startsWith('/auth/callback')) {
      return response
    }

    // dan mencoba mengakses route yang dilindungi, redirect ke login
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect_to', pathname)
      
      // Jika ada error auth, tambahkan message
      if (authError) {
        redirectUrl.searchParams.set('message', 'Session expired. Please log in again.')
      }
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Kembalikan response yang sudah diperbarui dengan cookie yang fresh
  return response
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua request path kecuali untuk:
     * - api (API routes) -- Kita ingin middleware berjalan SEBELUM API route, jadi jangan dikecualikan
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - file dengan ekstensi (e.g. .png)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}