'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { CartItem, UserWithProfile } from '@/types/supabase';
import Topbar from '@/components/tampilan/Topbar';
import Footer from '@/components/tampilan/Footer';

interface CheckoutData {
  nama: string;
  telepon: string;
  alamat: string;
  metodePembayaran: string;
  catatan: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    nama: '',
    telepon: '',
    alamat: '',
    metodePembayaran: 'midtrans',
    catatan: '',
  });

  const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const getTotalPrice = () => cartItems.reduce((total, item) => total + ((item.products?.price || 0) * item.quantity), 0);

  const fetchCartAndProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [cartRes, profileRes] = await Promise.all([
        supabase.from('cart_items').select('*, products(*)').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single()
      ]);

      if (cartRes.error) throw cartRes.error;
      if (profileRes.error) throw profileRes.error;

      const fetchedCartItems = (cartRes.data as any[] as CartItem[]) || [];
      if (fetchedCartItems.length === 0) {
        router.push('/produk');
        return;
      }
      setCartItems(fetchedCartItems);

      const profile = profileRes.data;
      if (profile) {
        setCheckoutData(prev => ({
          ...prev,
          nama: profile.full_name || '',
          alamat: profile.addresses?.find(a => a.is_primary)?.full_address || profile.addresses?.[0]?.full_address || '',
          telepon: profile.addresses?.find(a => a.is_primary)?.recipient_phone || profile.addresses?.[0]?.recipient_phone || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;
      if (user) {
        setUserProfile({ user, profile: null });
        await fetchCartAndProfile(user.id);
      } else {
        router.replace('/login?redirect_to=/checkout');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [fetchCartAndProfile, router]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // --- THIS IS THE FIX ---
      const apiUrl = new URL('/api/payment/create', window.location.origin);
      const res = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, checkoutData }),
      });
      // --- END OF FIX ---

      if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(`Failed to create transaction: ${errorBody}`);
      }

      const transaction = await res.json();

      if (!transaction.token) {
          throw new Error("Midtrans token not received.");
      }

      // @ts-ignore
      window.snap.pay(transaction.token, {
        onSuccess: function(result: any){
          console.log('success', result);
          window.dispatchEvent(new Event('storage'));
          router.push(`/profile`);
        },
        onPending: function(result: any){
          console.log('pending', result);
          window.dispatchEvent(new Event('storage'));
          router.push(`/profile`);
        },
        onError: function(result: any){
          console.error('error', result);
          alert('Payment failed!');
        },
        onClose: function(){
          console.log('customer closed the popup without finishing the payment');
        }
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Checkout failed: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Topbar />
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 mt-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="md:col-span-2 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700">Detail Pengiriman</h2>
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
              <input type="text" id="nama" required value={checkoutData.nama} onChange={(e) => setCheckoutData({...checkoutData, nama: e.target.value})} className="input-field w-full" />
            </div>
            <div>
              <label htmlFor="telepon" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label>
              <input type="tel" id="telepon" required value={checkoutData.telepon} onChange={(e) => setCheckoutData({...checkoutData, telepon: e.target.value})} className="input-field w-full" />
            </div>
            <div>
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
              <textarea id="alamat" required value={checkoutData.alamat} onChange={(e) => setCheckoutData({...checkoutData, alamat: e.target.value})} className="input-field w-full" rows={4} />
               <Link href="/profile" className="text-xs text-red-600 hover:underline mt-1">Ubah alamat di profil</Link>
            </div>
            <div>
              <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
              <textarea id="catatan" value={checkoutData.catatan} onChange={(e) => setCheckoutData({...checkoutData, catatan: e.target.value})} className="input-field w-full" rows={2} />
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">Ringkasan Pesanan</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image src={item.products.image_urls[0]} alt={item.products.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.products.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.products.price)}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatRupiah(item.products.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatRupiah(getTotalPrice())}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-red-600">{formatRupiah(getTotalPrice())}</span>
                </div>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center">
                 {isProcessing && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                {isProcessing ? "Memproses..." : "Lanjut ke Pembayaran"}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}