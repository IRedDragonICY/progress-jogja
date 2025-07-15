'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { CartItem, UserWithProfile, Address } from '@/types/supabase';
import {
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon,
  StarIcon as StarSolidIcon,
  UserIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

interface CheckoutData {
  nama: string;
  telepon: string;
  alamat: string;
  metodePembayaran: string;
  catatan: string;
  selectedAddressId: string;
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
    selectedAddressId: '',
  });

  const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => total + ((item.products?.price || 0) * item.quantity), 0);
    const ppn = subtotal * 0.1; // PPN 10%
    const total = subtotal + ppn;
    return { subtotal, ppn, total };
  };
  
  const { subtotal, ppn, total } = calculateTotals();

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('rumah')) return HomeIcon;
    if (l.includes('kantor') || l.includes('kerja')) return BuildingOfficeIcon;
    return MapIcon;
  };

  const getSelectedAddress = () => {
    if (!userProfile?.profile?.addresses) return null;
    return userProfile.profile.addresses.find(addr => addr.id === checkoutData.selectedAddressId) || null;
  };

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
        // Set user profile with fetched data
        setUserProfile({
          user: { id: userId, email: profile.email || '' } as any,
          profile: profile
        });
        
        const primaryAddress = profile.addresses?.find((a: any) => a.is_primary) || profile.addresses?.[0];
        if (primaryAddress) {
          setCheckoutData(prev => ({
            ...prev,
            nama: primaryAddress.recipient_name || profile.full_name || '',
            alamat: primaryAddress.full_address || '',
            telepon: primaryAddress.recipient_phone || '',
            selectedAddressId: primaryAddress.id,
          }));
        } else {
          setCheckoutData(prev => ({
            ...prev,
            nama: profile.full_name || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
      const apiUrl = new URL('/api/payment/create', window.location.origin);
      const res = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, checkoutData }),
      });

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

  const selectedAddress = getSelectedAddress();

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-10">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="md:col-span-2 space-y-6">
            {/* Address Section - Tokopedia Style */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Alamat Pengirimanmu</h2>
              
              {selectedAddress ? (
                <Link 
                  href="/profile/address?from=checkout"
                  className="block border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                      {React.createElement(getAddressIcon(selectedAddress.label), {
                        className: "w-6 h-6 text-gray-600 group-hover:text-red-600"
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{selectedAddress.label}</h3>
                        <span className="text-gray-600">•</span>
                        <span className="font-medium text-gray-900">{selectedAddress.recipient_name}</span>
                        {selectedAddress.is_primary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                            <StarSolidIcon className="w-3 h-3" />
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedAddress.full_address}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedAddress.recipient_phone}
                      </p>
                    </div>
                    <div className="flex items-center text-red-600 group-hover:text-red-700">
                      <span className="text-sm font-medium mr-2">Ubah</span>
                      <ChevronRightIcon className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/profile/address?from=checkout"
                  className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 hover:bg-red-50 transition-all"
                >
                  <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Tambah Alamat Pengiriman</h3>
                  <p className="text-gray-600 text-sm">Klik untuk menambah alamat pengiriman pertama Anda</p>
                </Link>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Pesanan</h3>
              <div>
                <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-2">Catatan untuk Penjual (Opsional)</label>
                <textarea 
                  id="catatan" 
                  value={checkoutData.catatan} 
                  onChange={(e) => setCheckoutData({...checkoutData, catatan: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none" 
                  rows={2}
                  placeholder="Contoh: Mohon dikemas dengan bubble wrap"
                />
              </div>
            </div>


          </div>

          {/* Order Summary */}
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
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    PPN 10%
                    <div className="group relative">
                      <svg className="w-3 h-3 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Pajak Pertambahan Nilai
                      </div>
                    </div>
                  </span>
                  <span className="font-medium">{formatRupiah(ppn)}</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-red-600">{formatRupiah(total)}</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isProcessing} 
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                 {isProcessing && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                {isProcessing ? "Memproses..." : "Lanjut ke Pembayaran"}
              </button>
            </div>
          </div>
        </form>
      </div>



       
    </div>
  );
}