import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Langkah PENTING: Refresh session.
  // Ini akan memperbarui cookie otentikasi jika diperlukan.
  // Tanpa ini, API Route tidak akan mendapatkan session yang valid.
  const { data: { session } } = await supabase.auth.getSession()

  // Bagian di bawah ini adalah untuk proteksi route (opsional tapi sangat direkomendasikan)
  const user = session?.user;
  const { pathname } = request.nextUrl;

  const authRoutes = ['/login', '/register'];
  const protectedRoutes = ['/admin', '/profile', '/checkout']; // Tambahkan /checkout

  // Jika user sudah login
  if (user) {
    // dan mencoba mengakses halaman login/register, redirect ke home
    if (authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Jika user bukan admin dan mencoba mengakses /admin, redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  // Jika user belum login
  else {
    // dan mencoba mengakses route yang dilindungi, redirect ke login
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect_to', pathname);
      return NextResponse.redirect(redirectUrl);
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