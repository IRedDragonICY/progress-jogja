'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import type { UserWithProfile } from '@/types/supabase';

export default function Navbar() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile({ user, profile });
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'SIGNED_OUT') {
           setUserProfile(null);
       } else if (session?.user) {
            fetchUser();
       }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-[#800000] text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="text-2xl font-bold">
        <Link href="/" className="hover:text-red-300 transition-colors">Progress Jogja</Link>
      </div>
      <div className="flex items-center space-x-4">
        <a href="/" className="hidden sm:inline hover:text-red-300 transition-colors">Beranda</a>
        <a href="/#visimisi" className="hidden sm:inline hover:text-red-300 transition-colors">Visi Misi</a>
        <Link href="/produk" className="hover:text-red-300 transition-colors">Produk</Link>
        <a href="/#kontak" className="hidden sm:inline hover:text-red-300 transition-colors">Kontak</a>
        
        {userProfile ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-800/50 hover:bg-red-800/80 rounded-full transition-colors outline-none">
                <span className="font-medium text-sm">{userProfile.profile?.full_name || userProfile.user.email}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="mt-2 w-56 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl p-2 z-[60] animate-in fade-in-0 zoom-in-95" sideOffset={5}>
                <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-slate-400">Akun Saya</DropdownMenu.Label>
                <DropdownMenu.Item asChild>
                    <Link href="/profile" className="flex items-center gap-2 w-full px-2 py-2 text-sm text-slate-200 rounded-md hover:bg-slate-700/50 hover:text-white outline-none cursor-pointer">
                        <UserCircleIcon className="w-4 h-4"/> Profil
                    </Link>
                </DropdownMenu.Item>
                {userProfile.profile?.role === 'admin' && (
                  <DropdownMenu.Item asChild>
                     <Link href="/admin" className="flex items-center gap-2 w-full px-2 py-2 text-sm text-slate-200 rounded-md hover:bg-slate-700/50 hover:text-white outline-none cursor-pointer">
                        <Cog6ToothIcon className="w-4 h-4"/> Dasbor Admin
                    </Link>
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Separator className="h-px bg-slate-700/50 my-1" />
                <DropdownMenu.Item onSelect={handleLogout} className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-300 rounded-md hover:bg-red-500/20 hover:text-red-200 outline-none cursor-pointer">
                    <ArrowLeftOnRectangleIcon className="w-4 h-4"/> Keluar
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-full text-sm font-medium transition-colors">
              Masuk
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}