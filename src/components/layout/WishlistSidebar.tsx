'use client';
import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  StarIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import type { User } from '@supabase/supabase-js';
import Sidebar from '@/components/layout/Sidebar';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description: string;
    category: string;
    rating: number;
    stock: number;
  };
}

// Define the Supabase response type to fix TypeScript issues
interface SupabaseWishlistResponse {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description: string;
    category: string;
    rating: number;
    stock: number;
  }[];
}

interface WishlistSidebarProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function WishlistSidebar({ isOpen, onCloseAction }: WishlistSidebarProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchWishlist = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        product_id,
        created_at,
        products (
          id,
          name,
          price,
          image_url,
          description,
          category,
          rating,
          stock
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      // Transform Supabase response to match our interface
      const transformedData: WishlistItem[] = (data as SupabaseWishlistResponse[])?.map(item => ({
        ...item,
        products: item.products[0] // Take first (and only) product from array
      })) || [];
      setWishlistItems(transformedData);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchWishlist(currentUser.id);
      }
    };

    if (isOpen) {
      fetchUser();
    }
  }, [isOpen, supabase, fetchWishlist]);

  const removeFromWishlist = async (wishlistId: string) => {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId);

    if (!error) {
      setWishlistItems(items => items.filter(item => item.id !== wishlistId));
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1
      });

    if (!error) {
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[60] animate-in slide-in-from-right';
      notification.textContent = 'Produk berhasil ditambahkan ke keranjang!';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const removeSelectedItems = async () => {
    if (selectedItems.size === 0) return;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .in('id', Array.from(selectedItems));

    if (!error) {
      setWishlistItems(items => items.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (wishlistItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <HeartIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wishlist Kosong
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Belum ada produk yang disimpan
          </p>
          <Link
            href="/produk"
            onClick={onCloseAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            Mulai Belanja
          </Link>
        </div>
      );
    }

    return (
      <div className="p-4">
        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800">
                {selectedItems.size} item terpilih
              </span>
              <button
                onClick={removeSelectedItems}
                className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-100/80 rounded-md transition-colors text-sm"
              >
                <TrashIcon className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/60 backdrop-blur-sm rounded-lg p-4 hover:bg-white/80 transition-all duration-200 border border-white/20 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 mt-1"
                />

                <div className="flex-shrink-0">
                  <Image
                    src={item.products.image_url}
                    alt={item.products.name}
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover rounded-lg shadow-sm"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {item.products.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{item.products.rating}</span>
                  </div>
                  <div className="text-base font-bold text-red-600 mt-1">
                    Rp {item.products.price.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Stock: {item.products.stock}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Link
                  href={`/produk/${item.products.id}`}
                  onClick={onCloseAction}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200/80 text-gray-700 rounded-md hover:bg-gray-300/80 transition-colors text-sm backdrop-blur-sm"
                >
                  <EyeIcon className="w-4 h-4" />
                  Lihat
                </Link>
                <button
                  onClick={() => addToCart(item.products.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/90 text-white rounded-md hover:bg-red-700 transition-colors text-sm backdrop-blur-sm"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  Keranjang
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="p-2 text-red-600 hover:bg-red-100/80 rounded-md transition-colors backdrop-blur-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (wishlistItems.length === 0) return null;

    return (
      <div className="p-4">
        <Link
          href="/produk"
          onClick={onCloseAction}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100/80 text-gray-700 rounded-lg hover:bg-gray-200/80 transition-colors font-medium backdrop-blur-sm"
        >
          Lanjut Belanja
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    );
  };

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onCloseAction}
      title="Wishlist"
      icon={<HeartSolidIcon className="w-6 h-6 text-red-500" />}
      badge={wishlistItems.length}
      footer={renderFooter()}
    >
      {renderContent()}
    </Sidebar>
  );
}
