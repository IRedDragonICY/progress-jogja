import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { NewUserPayload } from '@/types/supabase';

// Helper untuk membaca cookies dari request
function getCookie(req: NextRequest, name: string): string | undefined {
  return req.cookies.get(name)?.value;
}

export async function POST(req: NextRequest) {
  const response = NextResponse.next();

  // 1. KLIEN UNTUK OTENTIKASI PEMANGGIL (BERBASIS COOKIE)
  // Menggunakan signature modern yang direkomendasikan
  const supabaseRequestClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookie(req, name);
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. VERIFIKASI SESI DAN PERAN ADMIN DARI PEMANGGIL
  const { data: { user: callingUser }, error: authError } = await supabaseRequestClient.auth.getUser();

  if (authError || !callingUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (callingUser.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Permission denied: Not an admin' }, { status: 403 });
  }

  // --- Otorisasi Berhasil, Lanjutkan dengan Aksi Admin ---

  // 3. KLIEN UNTUK AKSI ADMINISTRATIF (BERBASIS SERVICE KEY)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { email, password, full_name, role }: NewUserPayload = await req.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. GUNAKAN FUNGSI ADMIN.CREATEUSER() YANG AMAN
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: full_name },
      app_metadata: { role: role, provider: 'email', providers: ['email'] }
    });

    if (createError) {
      throw createError;
    }

    if (!userData.user) {
        throw new Error("User creation did not return a user object.");
    }

    // Trigger akan menangani pembuatan profil, update peran adalah jaminan tambahan
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', userData.user.id)
      .select()
      .single();

    if (profileError) {
      console.warn(`User created but failed to explicitly update role for ${userData.user.id}:`, profileError.message);
    }

    return NextResponse.json(updatedProfile || { id: userData.user.id, message: 'User created, profile sync pending.' }, { status: 201 });

  } catch (error: any) {
    console.error('Error in admin_create_user API route:', error);

    const isConflict = error.message.includes('User already exists') || (error.code && error.code === '23505');

    const errorMessage = isConflict
      ? 'Pengguna dengan email ini sudah ada.'
      : error.message || 'Gagal membuat pengguna.';

    const status = isConflict ? 409 : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}