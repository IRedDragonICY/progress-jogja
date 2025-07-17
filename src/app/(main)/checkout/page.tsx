'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { CartItem, UserWithProfile } from '@/types/supabase';
import {
  MapPinIcon,
  ChevronRightIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon,
  StarIcon as StarSolidIcon,
  ArrowPathIcon,
  TruckIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';

interface CheckoutData {
  nama: string;
  telepon: string;
  alamat: string;
  metodePembayaran: string;
  catatan: string;
  selectedAddressId: string;
  shipping_service?: string;
  shipping_etd?: string;
  shipping_cost?: number;
}

interface ShippingOption {
  service: string;
  price: number;
  etd: string;
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

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [isFetchingShipping, setIsFetchingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const { subtotal, ppn, total, shippingCost, weightInKg } = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => total + ((item.products?.price || 0) * item.quantity), 0);
    const totalWeight = cartItems.reduce((total, item) => total + ((item.products?.weight || 100) * item.quantity), 0);
    const weightInKg = Math.max(1, Math.ceil(totalWeight / 1000));
    const shippingCost = selectedShippingOption?.price || 0;
    const ppn = subtotal * 0.1;
    const total = subtotal + ppn + shippingCost;
    return { subtotal, ppn, total, shippingCost, weightInKg };
  }, [cartItems, selectedShippingOption]);

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('rumah')) return HomeIcon;
    if (l.includes('kantor') || l.includes('kerja')) return BuildingOfficeIcon;
    return MapIcon;
  };

  const selectedAddress = useMemo(() => {
    if (!userProfile?.profile?.addresses) return null;
    return userProfile.profile.addresses.find(addr => addr.id === checkoutData.selectedAddressId) || null;
  }, [userProfile, checkoutData.selectedAddressId]);

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

  useEffect(() => {
    const fetchShippingOptions = async () => {
      if (selectedAddress?.full_address && weightInKg > 0) {
        setIsFetchingShipping(true);
        setShippingOptions([]);
        setSelectedShippingOption(null);
        setShippingError(null);
        try {
          const res = await fetch(`/api/shipping/jne?address=${encodeURIComponent(selectedAddress.full_address)}&weight=${weightInKg}`);
          if (res.ok) {
            const data = await res.json();
            if (data.error) {
              setShippingError(data.error);
              setShippingOptions([]);
            } else {
              setShippingOptions(data || []);
              if (!data || data.length === 0) {
                setShippingError('Tidak ada layanan pengiriman yang tersedia untuk tujuan ini.');
              }
            }
          } else {
            const errorData = await res.json();
            setShippingError(errorData.error || 'Gagal memuat opsi pengiriman.');
          }
        } catch (error) {
          console.error('Error fetching shipping options:', error);
          setShippingError('Terjadi kesalahan saat mengambil data pengiriman.');
        } finally {
          setIsFetchingShipping(false);
        }
      }
    };
    fetchShippingOptions();
  }, [selectedAddress, weightInKg]);

  useEffect(() => {
    setCheckoutData(prev => ({
      ...prev,
      shipping_service: selectedShippingOption?.service,
      shipping_etd: selectedShippingOption?.etd,
      shipping_cost: selectedShippingOption?.price,
    }));
  }, [selectedShippingOption]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShippingOption) {
      alert('Silakan pilih metode pengiriman terlebih dahulu.');
      return;
    }
    setIsProcessing(true);

    try {
      const apiUrl = new URL('/api/payment/create', window.location.origin);
      const res = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, checkoutData }),
      });

      if (!res.ok) {
          const errorBody = await res.json();
          throw new Error(errorBody.details || `Failed to create transaction`);
      }
      const transaction = await res.json();
      if (!transaction.token) throw new Error("Midtrans token not received.");
      (window as any).snap.pay(transaction.token, {
        onSuccess: function(){ window.dispatchEvent(new Event('storage')); router.push(`/profile`); },
        onPending: function(){ window.dispatchEvent(new Event('storage')); router.push(`/profile`); },
        onError: function(){ alert('Payment failed!'); },
        onClose: function(){}
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
    <div className="min-h-screen bg-gray-100 pt-20 pb-10">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Alamat Pengirimanmu</h2>
              {selectedAddress ? (
                <Link href="/profile/address?from=checkout" className="block border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">{React.createElement(getAddressIcon(selectedAddress.label), { className: "w-6 h-6 text-gray-600 group-hover:text-red-600" })}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2"><h3 className="font-bold text-gray-900">{selectedAddress.label}</h3><span className="text-gray-600">•</span><span className="font-medium text-gray-900">{selectedAddress.recipient_name}</span>{selectedAddress.is_primary && (<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"><StarSolidIcon className="w-3 h-3" />Utama</span>)}</div>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedAddress.full_address}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedAddress.recipient_phone}</p>
                    </div>
                    <div className="flex items-center text-red-600 group-hover:text-red-700"><span className="text-sm font-medium mr-2">Ubah</span><ChevronRightIcon className="w-5 h-5" /></div>
                  </div>
                </Link>
              ) : (
                <Link href="/profile/address?from=checkout" className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 hover:bg-red-50 transition-all"><MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" /><h3 className="font-semibold text-gray-900 mb-2">Tambah Alamat Pengiriman</h3><p className="text-gray-600 text-sm">Klik untuk menambah alamat pengiriman pertama Anda</p></Link>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                      <Image src="https://www.jne.co.id/cfind/source/images/logo.svg" alt="JNE Logo" width={100} height={28} className="h-7 w-auto"/>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Pilih Pengiriman</h2>
                        <p className="text-sm text-gray-500">Pilih layanan pengiriman yang sesuai.</p>
                      </div>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                          <TruckIcon className="w-4 h-4" />
                          <span>Kurir: JNE</span>
                      </div>
                  </div>
              </div>

              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border">
                          <p className="text-xs text-gray-500 mb-1">Origin</p>
                          <p className="font-semibold text-gray-800">Yogyakarta</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border">
                          <p className="text-xs text-gray-500 mb-1">Berat</p>
                          <p className="font-semibold text-gray-800">{weightInKg} kg</p>
                      </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">Saat ini, kami hanya mendukung pengiriman menggunakan JNE. Opsi kurir lain akan segera tersedia.</p>
                  </div>

                  {isFetchingShipping && (<div className="flex items-center justify-center gap-2 py-8"><ArrowPathIcon className="w-6 h-6 text-gray-500 animate-spin" /><span className="text-gray-600 font-medium">Mencari layanan pengiriman...</span></div>)}
                  {shippingError && !isFetchingShipping && (<div className="flex flex-col items-center text-center gap-2 py-8 px-4 bg-red-50/50 rounded-xl border border-red-100"><ExclamationCircleIcon className="w-8 h-8 text-red-400 mb-2" /><p className="font-semibold text-red-800">Gagal Memuat Opsi</p><p className="text-sm text-red-700">{shippingError}</p></div>)}

                  {!isFetchingShipping && shippingOptions.length > 0 && (
                  <div className="space-y-3 pt-2">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Pilih Layanan Pengiriman</h3>
                      {shippingOptions.map(opt => (
                      <label key={opt.service} className="block group">
                          <input type="radio" name="shipping_option" checked={selectedShippingOption?.service === opt.service} onChange={() => setSelectedShippingOption(opt)} className="hidden peer" />
                          <div className="p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-4 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:shadow-md hover:border-red-300 bg-gray-50 border-gray-200">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 peer-checked:bg-red-100 peer-checked:text-red-600 transition-colors">
                                  <TruckIcon className="w-5 h-5"/>
                              </div>
                              <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{opt.service}</p>
                                  <p className="text-sm text-gray-500">Estimasi Tiba: {opt.etd}</p>
                              </div>
                              <p className="font-bold text-gray-800 text-lg">{formatRupiah(opt.price)}</p>
                          </div>
                      </label>
                      ))}
                  </div>
                  )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Pesanan</h3>
              <div><label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-2">Catatan untuk Penjual (Opsional)</label><textarea id="catatan" value={checkoutData.catatan} onChange={(e) => setCheckoutData({...checkoutData, catatan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none" rows={2} placeholder="Contoh: Mohon dikemas dengan bubble wrap" /></div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">Ringkasan Pesanan</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">{cartItems.map(item => (<div key={item.id} className="flex items-center gap-4"><Image src={item.products.image_urls[0]} alt={item.products.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1"><p className="text-sm font-medium text-gray-800 line-clamp-1">{item.products.name}</p><p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.products.price)}</p></div><p className="text-sm font-semibold">{formatRupiah(item.products.price * item.quantity)}</p></div>))}</div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatRupiah(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600 flex items-center gap-1">PPN 10%</span><span className="font-medium">{formatRupiah(ppn)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Biaya Pengiriman</span><span className="font-medium">{formatRupiah(shippingCost)}</span></div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-red-600">{formatRupiah(total)}</span></div>
              </div>
              <button type="submit" disabled={isProcessing || !selectedShippingOption} className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><CreditCardIcon className="w-5 h-5"/>{isProcessing ? "Memproses..." : "Lanjut ke Pembayaran"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}