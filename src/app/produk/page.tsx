'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { debounce } from 'lodash';
import { supabase, updateUserProfile } from '@/lib/supabase';
import type { Product as Produk, CartItem, WishlistItem, UserWithProfile } from '@/types/supabase';
import { HeartIcon as HeartSolidIcon, TrashIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import Topbar from '@/components/tampilan/Topbar';
import Footer from '@/components/tampilan/Footer';

interface CheckoutData {
  nama: string;
  telepon: string;
  alamat: string;
  metodePembayaran: 'cod' | 'qris';
  catatan: string;
}

export default function ProdukPage() {
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState<string>("Semua");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({ nama: '', telepon: '', alamat: '', metodePembayaran: 'cod', catatan: '' });
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_types (
              id,
              name
            )
          `)
          .eq('is_published', true);

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setProducts(data || []);

        // Extract unique categories
        const categories = ['Semua', ...new Set(data?.map(p => p.product_types?.name).filter(Boolean) || [])];
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const debouncedSave = useMemo(() =>
    debounce((userId: string, dataToSave: { cart: CartItem[]; wishlist: WishlistItem[] }) => {
      updateUserProfile(userId, dataToSave).catch(err => console.error("Failed to save profile:", err));
    }, 1500), []
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          const userData = { user: session.user, profile };
          setUserProfile(userData);

          const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
          const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]') as WishlistItem[];

          const remoteCart = profile.cart || [];
          const mergedCart = [...remoteCart];
          localCart.forEach(localItem => {
            const existingItemIndex = mergedCart.findIndex(item => item.product_id === localItem.product_id);
            if (existingItemIndex > -1) {
              mergedCart[existingItemIndex].quantity += localItem.quantity;
            } else {
              mergedCart.push(localItem);
            }
          });

          const remoteWishlistIds = new Set((profile.wishlist || []).map((item: WishlistItem) => item.product_id));
          const mergedWishlist = [...(profile.wishlist || []), ...localWishlist.filter(item => !remoteWishlistIds.has(item.product_id))];

          setCart(mergedCart);
          setWishlist(mergedWishlist);
          debouncedSave(session.user.id, { cart: mergedCart, wishlist: mergedWishlist });

          localStorage.removeItem('cart');
          localStorage.removeItem('wishlist');
        }
      } else {
        setUserProfile(null);
        setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
        setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
        setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
      }
    });

    return () => subscription.unsubscribe();
  }, [debouncedSave]);

  useEffect(() => {
    if (userProfile?.user) {
      debouncedSave(userProfile.user.id, { cart, wishlist });
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    window.dispatchEvent(new Event('storage'));
  }, [cart, wishlist, userProfile, debouncedSave]);

  useEffect(() => {
    if (window.location.hash === '#keranjang') setShowCart(true);
    if (window.location.hash === '#wishlist') setShowWishlist(true);
  }, []);

  const produkTerfilter = kategoriAktif === "Semua" ? products : products.filter(p => p.product_types?.name === kategoriAktif);

  const addToCart = (produkId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === produkId);
      if (existing) return prev.map(item => item.product_id === produkId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product_id: produkId, quantity: 1 }];
    });
  };
  const updateQuantity = (produkId: string, newQuantity: number) => {
    if (newQuantity <= 0) setCart(prev => prev.filter(item => item.product_id !== produkId));
    else setCart(prev => prev.map(item => item.product_id === produkId ? { ...item, quantity: newQuantity } : item));
  };
  const toggleWishlist = (produkId: string) => {
    setWishlist(prev => {
      const isWishlisted = prev.some(item => item.product_id === produkId);
      if (isWishlisted) return prev.filter(item => item.product_id !== produkId);
      return [...prev, { product_id: produkId }];
    });
  };
  const isProductInWishlist = (produkId: string) => wishlist.some(item => item.product_id === produkId);
  const getTotalPrice = () => cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.product_id);
    return total + ((product?.price || 0) * item.quantity);
  }, 0);
  const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const handleCheckout = () => { setShowCart(false); setShowCheckout(true); };
  const submitOrder = (e: React.FormEvent) => { e.preventDefault(); setOrderSuccess(true); setShowCheckout(false); setCart([]); setCheckoutData({ nama: '', telepon: '', alamat: '', metodePembayaran: 'cod', catatan: '' }); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Koleksi Produk Kami</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">Temukan berbagai minuman tradisional dan herbal berkualitas tinggi</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center"><Link href="/#kontak" className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Hubungi Kami</Link><Link href="/" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition">Kembali ke Beranda</Link></div>
        </div>
      </section>

      <section className="py-8 bg-white border-b sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4"><div className="flex flex-wrap justify-center gap-4">{availableCategories.map((k) => <button key={k} onClick={() => setKategoriAktif(k)} className={`px-6 py-2 rounded-full font-medium transition ${kategoriAktif === k ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{k}</button>)}</div></div>
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
                    <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {p.product_types?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-red-500 hover:bg-white transition-transform hover:scale-110"
                    >
                      {isProductInWishlist(p.id) ? <HeartSolidIcon className="w-6 h-6" /> : <HeartOutlineIcon className="w-6 h-6" />}
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{p.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{p.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-red-600">{formatRupiah(p.price || 0)}</span>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      >
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

      {(showCart || showWishlist) && <div onClick={() => { setShowCart(false); setShowWishlist(false) }} className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>}
      <div id="keranjang" className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Keranjang Belanja</h2><button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button></div>
        <div className="flex-grow overflow-y-auto p-6">{cart.length === 0 ? <div className="text-center py-8"><p className="text-gray-500 text-lg">Keranjang masih kosong</p></div> : <div className="space-y-4">{cart.map(item => { const p = products.find(prod => prod.id === item.product_id); if (!p) return null; return <div key={item.product_id} className="flex items-center justify-between border-b pb-4"><div className="flex items-center space-x-4"><div className="relative w-16 h-16"><Image src={p.image_urls[0]} alt={p.name} fill className="object-cover rounded-lg" /></div><div><h4 className="font-semibold text-gray-800">{p.name}</h4><p className="text-red-600 font-medium">{formatRupiah(p.price || 0)}</p></div></div><div className="flex items-center space-x-2"><button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300">-</button><span className="mx-2 font-medium">{item.quantity}</span><button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="bg-red-600 text-white w-8 h-8 rounded-full hover:bg-red-700">+</button></div></div>})}</div>}</div>
        {cart.length > 0 && <div className="p-6 border-t mt-auto"><div className="flex justify-between items-center mb-4"><span className="text-xl font-bold text-gray-800">Total:</span><span className="text-2xl font-bold text-red-600">{formatRupiah(getTotalPrice())}</span></div><button onClick={handleCheckout} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition">Lanjut ke Checkout</button></div>}
      </div>

      <div id="wishlist" className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${showWishlist ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Wishlist</h2><button onClick={() => setShowWishlist(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button></div>
        <div className="flex-grow overflow-y-auto p-6">{wishlist.length === 0 ? <div className="text-center py-8"><p className="text-gray-500 text-lg">Wishlist masih kosong</p></div> : <div className="space-y-4">{wishlist.map(item => { const p = products.find(prod => prod.id === item.product_id); if (!p) return null; return <div key={item.product_id} className="flex items-center justify-between border-b pb-4"><div className="flex items-center space-x-4"><div className="relative w-16 h-16"><Image src={p.image_urls[0]} alt={p.name} fill className="object-cover rounded-lg" /></div><div><h4 className="font-semibold text-gray-800">{p.name}</h4><p className="text-red-600 font-medium">{formatRupiah(p.price || 0)}</p></div></div><div className="flex items-center gap-2"><button onClick={() => toggleWishlist(item.product_id)} className="text-red-500 p-2 rounded-full hover:bg-red-100"><TrashIcon className="w-5 h-5"/></button><button onClick={() => { addToCart(item.product_id); toggleWishlist(item.product_id);}} className="bg-red-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-red-700">Pindah ke Keranjang</button></div></div>})}</div>}</div>
      </div>

      {showCheckout && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"><div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="p-6"><div className="flex justify-between items-start mb-4"><h2 className="text-3xl font-bold text-gray-800">Checkout</h2><button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button></div><form onSubmit={submitOrder} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label><input type="text" required value={checkoutData.nama} onChange={(e) => setCheckoutData({...checkoutData, nama: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Masukkan nama lengkap" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label><input type="tel" required value={checkoutData.telepon} onChange={(e) => setCheckoutData({...checkoutData, telepon: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Masukkan nomor telepon" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label><textarea required value={checkoutData.alamat} onChange={(e) => setCheckoutData({...checkoutData, alamat: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" rows={3} placeholder="Masukkan alamat lengkap untuk pengiriman" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran *</label><div className="space-y-2"><label className="flex items-center"><input type="radio" name="metodePembayaran" value="cod" checked={checkoutData.metodePembayaran === 'cod'} onChange={(e) => setCheckoutData({...checkoutData, metodePembayaran: e.target.value as 'cod' | 'qris'})} className="mr-3" /><div><span className="font-medium">Cash on Delivery (COD)</span><p className="text-sm text-gray-500">Bayar saat barang sampai</p></div></label><label className="flex items-center"><input type="radio" name="metodePembayaran" value="qris" checked={checkoutData.metodePembayaran === 'qris'} onChange={(e) => setCheckoutData({...checkoutData, metodePembayaran: e.target.value as 'cod' | 'qris'})} className="mr-3" /><div><span className="font-medium">QRIS (Semua Bank)</span><p className="text-sm text-gray-500">Bayar dengan scan QR code</p></div></label></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label><textarea value={checkoutData.catatan} onChange={(e) => setCheckoutData({...checkoutData, catatan: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} placeholder="Catatan untuk pesanan (opsional)" /></div><div className="border-t pt-4"><div className="bg-gray-50 p-4 rounded-lg mb-4"><h3 className="font-semibold text-gray-800 mb-2">Ringkasan Pesanan:</h3>
                    {cart.map((item) => {
                      const p = products.find(prod => prod.id === item.product_id);
                      return (
                        <div key={item.product_id} className="flex justify-between text-sm text-gray-600">
                          <span>{p?.name} x {item.quantity}</span>
                          <span>{formatRupiah((p?.price || 0) * item.quantity)}</span>
                        </div>
                      );
                    })} <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-gray-800"><span>Total:</span><span className="text-red-600">{formatRupiah(getTotalPrice())}</span></div></div><button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition">Konfirmasi Pesanan</button></div></form></div></div></div>}
      {orderSuccess && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl max-w-md w-full p-6 text-center"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><h3 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h3><p className="text-gray-600 mb-6">Terima kasih! Pesanan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda untuk konfirmasi.</p><button onClick={() => setOrderSuccess(false)} className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">Tutup</button></div></div>}

      <section className="py-16 bg-red-600 text-white text-center"><div className="max-w-4xl mx-auto px-4"><h2 className="text-3xl md:text-4xl font-bold mb-6">Tertarik dengan Produk Kami?</h2><p className="text-xl mb-8 opacity-90">Hubungi kami sekarang untuk informasi lebih lanjut dan pemesanan</p><Link href="/#kontak" className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105">Hubungi Kami Sekarang</Link></div></section>
      <Footer />
    </div>
  );
}