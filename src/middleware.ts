import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/admin', '/profile'];
const authRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;
  const user = session?.user;

  if (user) {
    // Membaca 'role' langsung dari JWT, bukan dari database
    const isAdmin = user.app_metadata?.role === 'admin';
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    if (isAuthRoute) {
      const redirectPath = isAdmin ? '/admin' : '/';
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    if (!isAdmin && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } else {
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (isProtectedRoute) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect_to', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\..*).*)',
  ],
};