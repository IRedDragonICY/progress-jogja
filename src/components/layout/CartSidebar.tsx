'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCartIcon, TrashIcon, MinusIcon, PlusIcon, HeartIcon, CreditCardIcon,
  TruckIcon, ShieldCheckIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import type { User } from '@supabase/supabase-js';
import type { CartItem } from '@/types/supabase';
import Sidebar from '@/components/layout/Sidebar';

interface CartSidebarProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function CartSidebar({ isOpen, onCloseAction }: CartSidebarProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [updateLoading, setUpdateLoading] = useState<Set<string>>(new Set());
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchCart = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`id, product_id, quantity, created_at, products (*)`)
      .eq('user_id', userId).order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      setCartItems((data as any[] as CartItem[]) || []);
      setSelectedItems(new Set(data?.map(item => item.id) || []));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchCart(currentUser.id);
      } else {
        setCartItems([]);
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchUserAndData();
    }
  }, [isOpen, supabase, fetchCart]);

  useEffect(() => {
    const handleStorageChange = async () => {
      if (user?.id) await fetchCart(user.id);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, fetchCart]);

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdateLoading(prev => new Set(prev).add(cartId));
    const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartId);
    if (!error) {
      setCartItems(items => items.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item));
    }
    setUpdateLoading(prev => { const newSet = new Set(prev); newSet.delete(cartId); return newSet; });
  };

  const removeFromCart = async (cartId: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartId);
    if (!error) {
      setCartItems(items => items.filter(item => item.id !== cartId));
      setSelectedItems(prev => { const newSet = new Set(prev); newSet.delete(cartId); return newSet; });
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    setSelectedItems(newSelected);
  };

  const removeSelectedItems = async () => {
    if (selectedItems.size === 0) return;
    const { error } = await supabase.from('cart_items').delete().in('id', Array.from(selectedItems));
    if (!error) {
      setCartItems(items => items.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
       window.dispatchEvent(new Event('storage'));
    }
  };

  const calculateTotals = () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
    const ppn = subtotal * 0.1; // PPN 10%
    const total = subtotal + ppn;
    return { subtotal, ppn, total, itemCount: selectedCartItems.length };
  };

  const { subtotal, ppn, total, itemCount } = calculateTotals();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Masuk untuk Melihat Keranjang</h3>
              <p className="text-gray-600 text-sm mb-4">Silakan masuk untuk menambahkan produk ke keranjang Anda.</p>
              <Link href="/login" onClick={onCloseAction} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm">
                Masuk
              </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keranjang Anda Kosong</h3>
          <p className="text-gray-600 text-sm mb-4">Sepertinya Anda belum menambahkan produk apapun.</p>
          <Link href="/produk" onClick={onCloseAction} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm">
            <ShoppingCartIcon className="w-4 h-4" />
            Mulai Belanja
          </Link>
        </div>
      );
    }

    return (
      <div className="p-4">
        {selectedItems.size > 0 && (
          <div className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800">{selectedItems.size} item terpilih</span>
              <button onClick={removeSelectedItems} className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-100/80 rounded-md transition-colors text-sm">
                <TrashIcon className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 hover:bg-white/80 transition-all duration-200 border border-white/20 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleSelectItem(item.id)} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 mt-1"/>
                <div className="flex-shrink-0">
                  <Image src={item.products.image_urls[0]} alt={item.products.name} width={60} height={60} className="w-15 h-15 object-cover rounded-lg shadow-sm"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.products.name}</h4>
                  <div className="text-base font-bold text-red-600 mt-1">Rp {(item.products.price * item.quantity).toLocaleString('id-ID')}</div>
                  <div className="text-xs text-gray-500 mt-1">Rp {item.products.price.toLocaleString('id-ID')} / item</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                 <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-600 hover:bg-red-100/80 rounded-md transition-colors backdrop-blur-sm flex items-center gap-1 text-xs">
                    <TrashIcon className="w-4 h-4" />
                    Hapus
                </button>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-white/30 shadow-sm">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || updateLoading.has(item.id)} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><MinusIcon className="w-3 h-3" /></button>
                  <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={updateLoading.has(item.id)} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><PlusIcon className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (!user || cartItems.length === 0) return null;
    return (
      <div className="p-4 space-y-4 bg-gradient-to-br from-white to-gray-50 border-t border-gray-200">
        {/* Price Breakdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Rincian Pembayaran</div>
          
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Subtotal ({itemCount} item)</span>
            <span className="font-medium text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          
          {/* PPN */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm flex items-center gap-1">
              PPN 10%
              <div className="group relative">
                <ShieldCheckIcon className="w-3 h-3 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Pajak Pertambahan Nilai
                </div>
              </div>
            </span>
            <span className="font-medium text-gray-900">Rp {ppn.toLocaleString('id-ID')}</span>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>
          
          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-red-600">Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Link
          href="/checkout"
          onClick={itemCount === 0 ? (e) => e.preventDefault() : onCloseAction}
          className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${itemCount === 0 ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''}`}
          aria-disabled={itemCount === 0}
        >
          <CreditCardIcon className="w-5 h-5" />
          Checkout ({itemCount} item)
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Link>
        
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheckIcon className="w-4 h-4 text-green-500" />
          <span>Transaksi aman dengan enkripsi SSL</span>
        </div>
      </div>
    );
  };

  return (
    <Sidebar isOpen={isOpen} onClose={onCloseAction} title="Keranjang" icon={<ShoppingCartIcon className="w-6 h-6 text-red-500" />} badge={cartItems.length} footer={renderFooter()}>
      {renderContent()}
    </Sidebar>
  );
}