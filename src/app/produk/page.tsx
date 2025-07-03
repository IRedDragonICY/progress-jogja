'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  hargaFormat: string;
  deskripsi: string;
  gambar: string;
  manfaat: string[];
  bahan: string[];
}

interface CartItem {
  produk: Produk;
  quantity: number;
}

interface CheckoutData {
  nama: string;
  telepon: string;
  alamat: string;
  metodePembayaran: 'cod' | 'qris';
  catatan: string;
}

const produkData: Produk[] = [
  {
    id: 1,
    nama: "Wedang Uwuh",
    kategori: "Minuman Tradisional",
    harga: 15000,
    hargaFormat: "Rp 15.000",
    deskripsi: "Minuman rempah tradisional Yogyakarta dengan campuran kayu manis, cengkeh, dan rempah pilihan. Berkhasiat menghangatkan tubuh dan meningkatkan imunitas.",
    gambar: "/produk1.webp",
    manfaat: ["Menghangatkan tubuh", "Meningkatkan imunitas", "Antioksidan tinggi"],
    bahan: ["Kayu manis", "Cengkeh", "Kapulaga", "Jahe"]
  },
  {
    id: 2,
    nama: "Wedang Telang",
    kategori: "Minuman Herbal",
    harga: 18000,
    hargaFormat: "Rp 18.000",
    deskripsi: "Minuman dari bunga telang yang kaya antioksidan. Memiliki warna biru alami yang unik dan rasanya yang menyegarkan.",
    gambar: "/produk2.webp",
    manfaat: ["Antioksidan tinggi", "Menjaga kesehatan mata", "Meningkatkan kognitif"],
    bahan: ["Bunga telang", "Madu", "Lemon", "Daun mint"]
  },
  {
    id: 3,
    nama: "Jakencruk",
    kategori: "Minuman Fusion",
    harga: 20000,
    hargaFormat: "Rp 20.000",
    deskripsi: "Inovasi minuman modern dengan sentuhan tradisional. Perpaduan rempah nusantara dengan teknik penyajian contemporary.",
    gambar: "/produk3.webp",
    manfaat: ["Energi alami", "Detoksifikasi", "Melancarkan pencernaan"],
    bahan: ["Jahe merah", "Kunyit", "Temulawak", "Madu"]
  },
  {
    id: 4,
    nama: "Wedang Ronde",
    kategori: "Minuman Tradisional",
    harga: 12000,
    hargaFormat: "Rp 12.000",
    deskripsi: "Minuman hangat dengan bola-bola tepung ketan berisi kacang tanah, disajikan dengan kuah jahe yang harum.",
    gambar: "/produk1.webp",
    manfaat: ["Menghangatkan tubuh", "Sumber energi", "Melancarkan pencernaan"],
    bahan: ["Tepung ketan", "Kacang tanah", "Jahe", "Gula aren"]
  },
  {
    id: 5,
    nama: "Wedang Secang",
    kategori: "Minuman Herbal",
    harga: 16000,
    hargaFormat: "Rp 16.000",
    deskripsi: "Minuman dari kayu secang yang memberikan warna merah alami. Kaya akan antioksidan dan memiliki rasa yang khas.",
    gambar: "/produk2.webp",
    manfaat: ["Antioksidan", "Melancarkan peredaran darah", "Anti-inflamasi"],
    bahan: ["Kayu secang", "Serai", "Daun pandan", "Gula batu"]
  },
  {
    id: 6,
    nama: "Wedang Bajigur",
    kategori: "Minuman Tradisional",
    harga: 14000,
    hargaFormat: "Rp 14.000",
    deskripsi: "Minuman hangat dengan santan dan gula aren, ditambah potongan kolang-kaling yang kenyal.",
    gambar: "/produk3.webp",
    manfaat: ["Menghangatkan tubuh", "Sumber energi", "Kaya lemak sehat"],
    bahan: ["Santan", "Gula aren", "Kolang-kaling", "Jahe"]
  }
];

const kategoriFIlter = ["Semua", "Minuman Tradisional", "Minuman Herbal", "Minuman Fusion"];

export default function ProdukPage() {
  const [kategoriAktif, setKategoriAktif] = useState<string>("Semua");
  const [produkTerpilih, setProdukTerpilih] = useState<Produk | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    nama: '',
    telepon: '',
    alamat: '',
    metodePembayaran: 'cod',
    catatan: ''
  });
  const [orderSuccess, setOrderSuccess] = useState(false);

  const produkTerfilter = kategoriAktif === "Semua" 
    ? produkData 
    : produkData.filter(produk => produk.kategori === kategoriAktif);

  const addToCart = (produk: Produk) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.produk.id === produk.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.produk.id === produk.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { produk, quantity: 1 }];
      }
    });
    setProdukTerpilih(null);
  };

  const updateQuantity = (produkId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.produk.id !== produkId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.produk.id === produkId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.produk.harga * item.quantity), 0);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi submit order
    setOrderSuccess(true);
    setShowCheckout(false);
    setCart([]);
    setCheckoutData({
      nama: '',
      telepon: '',
      alamat: '',
      metodePembayaran: 'cod',
      catatan: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/tampilan" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Progres Jogja</h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <Link href="/tampilan" className="text-gray-600 hover:text-red-600 transition">
                  Beranda
                </Link>
                <Link href="/produk" className="text-red-600 font-semibold">
                  Produk
                </Link>
                <Link href="/tampilan#tentang" className="text-gray-600 hover:text-red-600 transition">
                  Tentang
                </Link>
                <Link href="/tampilan#kontak" className="text-gray-600 hover:text-red-600 transition">
                  Kontak
                </Link>
              </nav>
              
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Koleksi Produk Kami
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Temukan berbagai minuman tradisional dan herbal berkualitas tinggi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/tampilan#kontak" 
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Hubungi Kami
            </Link>
            <Link 
              href="/tampilan" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>

      {/* Filter Kategori */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {kategoriFIlter.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setKategoriAktif(kategori)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  kategoriAktif === kategori
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Produk */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {produkTerfilter.map((produk) => (
              <div
                key={produk.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-64">
                  <Image
                    src={produk.gambar}
                    alt={produk.nama}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {produk.kategori}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{produk.nama}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{produk.deskripsi}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-red-600">{produk.hargaFormat}</span>
                    <button
                      onClick={() => setProdukTerpilih(produk)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Detail Produk */}
      {produkTerpilih && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-gray-800">{produkTerpilih.nama}</h2>
                <button
                  onClick={() => setProdukTerpilih(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="relative h-64 mb-6">
                <Image
                  src={produkTerpilih.gambar}
                  alt={produkTerpilih.nama}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi</h3>
                  <p className="text-gray-600">{produkTerpilih.deskripsi}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Manfaat</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {produkTerpilih.manfaat.map((manfaat, index) => (
                      <li key={index}>{manfaat}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Bahan Utama</h3>
                  <div className="flex flex-wrap gap-2">
                    {produkTerpilih.bahan.map((bahan, index) => (
                      <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {bahan}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-3xl font-bold text-red-600">{produkTerpilih.hargaFormat}</span>
                  <button
                    onClick={() => addToCart(produkTerpilih)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Keranjang */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-gray-800">Keranjang Belanja</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">Keranjang masih kosong</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.produk.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16">
                            <Image
                              src={item.produk.gambar}
                              alt={item.produk.nama}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{item.produk.nama}</h4>
                            <p className="text-red-600 font-medium">{item.produk.hargaFormat}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.produk.id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="mx-2 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.produk.id, item.quantity + 1)}
                            className="bg-red-600 text-white w-8 h-8 rounded-full hover:bg-red-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-red-600">{formatRupiah(getTotalPrice())}</span>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Lanjut ke Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-gray-800">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={submitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutData.nama}
                    onChange={(e) => setCheckoutData({...checkoutData, nama: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={checkoutData.telepon}
                    onChange={(e) => setCheckoutData({...checkoutData, telepon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    required
                    value={checkoutData.alamat}
                    onChange={(e) => setCheckoutData({...checkoutData, alamat: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Masukkan alamat lengkap untuk pengiriman"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="metodePembayaran"
                        value="cod"
                        checked={checkoutData.metodePembayaran === 'cod'}
                        onChange={(e) => setCheckoutData({...checkoutData, metodePembayaran: e.target.value as 'cod' | 'qris'})}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium">Cash on Delivery (COD)</span>
                        <p className="text-sm text-gray-500">Bayar saat barang sampai</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="metodePembayaran"
                        value="qris"
                        checked={checkoutData.metodePembayaran === 'qris'}
                        onChange={(e) => setCheckoutData({...checkoutData, metodePembayaran: e.target.value as 'cod' | 'qris'})}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium">QRIS (Semua Bank)</span>
                        <p className="text-sm text-gray-500">Bayar dengan scan QR code</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={checkoutData.catatan}
                    onChange={(e) => setCheckoutData({...checkoutData, catatan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={2}
                    placeholder="Catatan untuk pesanan (opsional)"
                  />
                </div>
                
                <div className="border-t pt-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Ringkasan Pesanan:</h3>
                    {cart.map((item) => (
                      <div key={item.produk.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.produk.nama} x {item.quantity}</span>
                        <span>{formatRupiah(item.produk.harga * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-gray-800">
                      <span>Total:</span>
                      <span className="text-red-600">{formatRupiah(getTotalPrice())}</span>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Konfirmasi Pesanan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Order Success */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h3>
            <p className="text-gray-600 mb-6">
              Terima kasih! Pesanan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda untuk konfirmasi.
            </p>
            <button
              onClick={() => setOrderSuccess(false)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Tertarik dengan Produk Kami?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Hubungi kami sekarang untuk informasi lebih lanjut dan pemesanan
          </p>
          <Link
            href="/tampilan#kontak"
            className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            Hubungi Kami Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h3 className="text-2xl font-bold">Progres Jogja</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Menyajikan minuman tradisional dan herbal berkualitas tinggi untuk kesehatan dan kenikmatan Anda
          </p>
          <p className="text-sm text-gray-500">
            © 2024 Progres Jogja. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}