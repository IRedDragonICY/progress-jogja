'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ChevronDownIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon,
  Bars3Icon, XMarkIcon, HomeIcon, EyeIcon, ShoppingBagIcon, PhoneIcon,
  ShoppingCartIcon, HeartIcon
} from '@heroicons/react/24/outline';
import type { UserWithProfile } from '@/types/supabase';

interface TopbarProps {
  onCartToggle: () => void;
  onWishlistToggle: () => void;
}

export default function Topbar({ onCartToggle, onWishlistToggle }: TopbarProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const fetchCounts = async (userId: string) => {
    const { count: cartItems } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    const { count: wishlistItems } = await supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    setCartCount(cartItems || 0);
    setWishlistCount(wishlistItems || 0);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile({ user, profile });
        await fetchCounts(user.id);
      } else {
        setUserProfile(null); setCartCount(0); setWishlistCount(0);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
       if (event === 'SIGNED_IN') { 
         const { data: { user } } = await supabase.auth.getUser();
         if (user) { fetchUser(); }
       }
       else if (event === 'SIGNED_OUT') { setUserProfile(null); setCartCount(0); setWishlistCount(0); }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (userProfile?.user?.id) fetchCounts(userProfile.user.id);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userProfile, supabase]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const navItems = [
    { href: '/', label: 'Beranda', icon: HomeIcon },
    { href: '/#visimisi', label: 'Visi Misi', icon: EyeIcon },
    { href: '/produk', label: 'Produk', icon: ShoppingBagIcon },
    { href: '/#kontak', label: 'Kontak', icon: PhoneIcon },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 text-gray-900' 
        : 'bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tight hover:scale-105 transition-transform duration-200">
              Progress Jogja
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`group relative px-4 py-2 rounded-lg transition-all duration-200 ${ isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white hover:text-red-200 hover:bg-red-700/50'}`}>
                <span className="flex items-center gap-2"><item.icon className="w-4 h-4" />{item.label}</span>
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-200 group-hover:w-full ${ isScrolled ? 'bg-red-600' : 'bg-white'}`} />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {userProfile && (
              <div className="flex items-center gap-2">
                <button onClick={onWishlistToggle} className={`relative p-2 rounded-full transition-all duration-200 ${ isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white hover:text-red-200 hover:bg-red-700/50'}`}>
                  <HeartIcon className="w-6 h-6" />
                  {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">{wishlistCount > 99 ? '99+' : wishlistCount}</span>}
                </button>
                <button onClick={onCartToggle} className={`relative p-2 rounded-full transition-all duration-200 ${ isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white hover:text-red-200 hover:bg-red-700/50'}`}>
                  <ShoppingCartIcon className="w-6 h-6" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">{cartCount > 99 ? '99+' : cartCount}</span>}
                </button>
              </div>
            )}
            {userProfile ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 outline-none ${ isScrolled ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-red-600/50 hover:bg-red-600/80 text-white'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                      {userProfile.profile?.full_name?.[0] || userProfile.user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-sm max-w-32 truncate">{userProfile.profile?.full_name || userProfile.user.email}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/50 shadow-2xl p-2 z-[60] animate-in fade-in-0 zoom-in-95" sideOffset={5}>
                    <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Akun Saya</DropdownMenu.Label>
                    <DropdownMenu.Item asChild><Link href="/profile" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 outline-none cursor-pointer transition-colors"><UserCircleIcon className="w-4 h-4" />Profil Saya</Link></DropdownMenu.Item>
                    {userProfile.profile?.role === 'admin' && (<DropdownMenu.Item asChild><Link href="/admin" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 outline-none cursor-pointer transition-colors"><Cog6ToothIcon className="w-4 h-4" />Dasbor Admin</Link></DropdownMenu.Item>)}
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
                    <DropdownMenu.Item onSelect={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 outline-none cursor-pointer transition-colors"><ArrowLeftOnRectangleIcon className="w-4 h-4" />Keluar</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <Link href="/login" className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${ isScrolled ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg' : 'bg-white text-red-700 hover:bg-red-50 shadow-md hover:shadow-lg'}`}>Masuk</Link>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${ isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-red-700/50'}`}>
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/20 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (<Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"><item.icon className="w-5 h-5" />{item.label}</Link>))}
            {userProfile && (
              <>
                <div className="h-px bg-gray-200 my-2" />
                <button onClick={() => { onWishlistToggle(); setIsMobileMenuOpen(false); }} className="flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"><div className="flex items-center gap-3"><HeartIcon className="w-5 h-5" />Wishlist</div>{wishlistCount > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">{wishlistCount > 99 ? '99+' : wishlistCount}</span>}</button>
                <button onClick={() => { onCartToggle(); setIsMobileMenuOpen(false); }} className="flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"><div className="flex items-center gap-3"><ShoppingCartIcon className="w-5 h-5" />Keranjang</div>{cartCount > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">{cartCount > 99 ? '99+' : cartCount}</span>}</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}