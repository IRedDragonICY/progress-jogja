'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Product as Produk, WishlistItem, UserWithProfile } from '@/types/supabase';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';

export default function ProdukPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState<string>("Semua");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [wishlistItemIds, setWishlistItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { data: productsData, error: productsError } = await supabase.from('products').select('*, product_types(id, name)').eq('is_published', true);
        if (productsError) throw productsError;
        setProducts(productsData || []);
        const categories = ['Semua', ...new Set(productsData?.map(p => p.product_types?.name).filter(Boolean) as string[] || [])];
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile({ user, profile });
        const { data: wishlistData } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id);
        setWishlistItemIds(new Set(wishlistData?.map(item => item.product_id) || []));
      } else {
        setUserProfile(null);
        setWishlistItemIds(new Set());
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const produkTerfilter = useMemo(() =>
    kategoriAktif === "Semua" ? products : products.filter(p => p.product_types?.name === kategoriAktif),
    [products, kategoriAktif]
  );

  const addToCart = async (produkId: string) => {
    if (!userProfile) { router.push('/login'); return; }
    const { data: existing } = await supabase.from('cart_items').select('id, quantity').eq('user_id', userProfile.user.id).eq('product_id', produkId).single();
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: userProfile.user.id, product_id: produkId, quantity: 1 });
    }
    window.dispatchEvent(new Event('storage'));
  };

  const toggleWishlist = async (produkId: string) => {
    if (!userProfile) { router.push('/login'); return; }
    const isWishlisted = wishlistItemIds.has(produkId);
    if (isWishlisted) {
      await supabase.from('wishlists').delete().match({ user_id: userProfile.user.id, product_id: produkId });
      setWishlistItemIds(prev => { const next = new Set(prev); next.delete(produkId); return next; });
    } else {
      await supabase.from('wishlists').insert({ user_id: userProfile.user.id, product_id: produkId });
      setWishlistItemIds(prev => new Set(prev).add(produkId));
    }
    window.dispatchEvent(new Event('storage'));
  };

  const isProductInWishlist = (produkId: string) => wishlistItemIds.has(produkId);
  const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <>
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Koleksi Produk Kami</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">Temukan berbagai minuman tradisional dan herbal berkualitas tinggi</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#kontak" className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Hubungi Kami</Link>
            <Link href="/" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition">Kembali ke Beranda</Link>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {availableCategories.map((k) => (
              <button key={k} onClick={() => setKategoriAktif(k)} className={`px-6 py-2 rounded-full font-medium transition ${kategoriAktif === k ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {k}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600">Memuat produk...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {produkTerfilter.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative h-64">
                    {p.image_urls && p.image_urls.length > 0 ? (
                        <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover" />
                    ) : (
                        <div className="bg-gray-200 h-full w-full"></div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {p.product_types?.name || 'Tanpa Kategori'}
                      </span>
                    </div>
                    <button onClick={() => toggleWishlist(p.id)} className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-red-500 hover:bg-white transition-transform hover:scale-110">
                      {isProductInWishlist(p.id) ? <HeartSolidIcon className="w-6 h-6" /> : <HeartOutlineIcon className="w-6 h-6" />}
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{p.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{p.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-red-600">{formatRupiah(p.price || 0)}</span>
                      <button onClick={() => addToCart(p.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                        Tambah ke Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-red-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Tertarik dengan Produk Kami?</h2>
          <p className="text-xl mb-8 opacity-90">Hubungi kami sekarang untuk informasi lebih lanjut dan pemesanan</p>
          <Link href="/#kontak" className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105">Hubungi Kami Sekarang</Link>
        </div>
      </section>
    </>
  );
}