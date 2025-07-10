import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="bg-gray-50 bg-[url('/herobg.jpg')] bg-contain bg-center bg-no-repeat h-screen flex flex-col justify-end items-center text-black relative pb-20">
        <div className="text-center">
          <p className="text-lg">Inovasi Pangan Lokal untuk Pasar Global</p>
        </div>
      </section>

      <section id="visimisi" className="py-16 px-8 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6">Visi & Misi</h2>
        <p className="max-w-3xl mx-auto mb-4">
            <strong>Visi:</strong> Menjadikan produk lokal sebagai komoditas unggulan yang berkualitas di pasar global.
        </p>
        <div className="max-w-2xl mx-auto text-left">
            <p className="mb-3"><strong>Misi:</strong></p>
            <ul className="list-disc ml-6 space-y-2">
            <li>Sebuah kelompok wirausaha muda yang mengembangkan produk lokal melalui sentuhan teknologi tepat guna.</li>
            <li>Meningkatkan kapasitas produksi dari waktu ke waktu secara bertahap dengan tetap menjaga kualitas produk yang terbaik.</li>
            <li>Memperluas jaringan pemasaran</li>
            <li>Diversifikasi produk</li>
            <li>Promosi produk Go International</li>
            </ul>
        </div>
      </section>

      <section id="penghargaan" className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Penghargaan</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Kolom Teks Penghargaan */}
            <div>
              <p className="text-lg mb-6 leading-relaxed">
                Adapun CV Progress pernah mendapatkan penghargaan dari beberapa instansi sebagai pelaku industri ketahanan pangan sebagai berikut:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#800000]">
                  <h3 className="font-bold text-[#800000] mb-1">Juara 1 Wirausaha Usaha Pangan</h3>
                  <p className="text-gray-700">Penghargaan Kementerian Pemuda dan Olahraga RI (2006)</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#800000]">
                  <h3 className="font-bold text-[#800000] mb-1">Juara 1 Industri Ketahanan Pangan</h3>
                  <p className="text-gray-700">Kabupaten Bantul (2016)</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#800000]">
                  <h3 className="font-bold text-[#800000] mb-1">Juara 1 Industri Ketahanan Pangan</h3>
                  <p className="text-gray-700">D.I. Yogyakarta (2016)</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#800000]">
                  <h3 className="font-bold text-[#800000] mb-1">Penghargaan Adikarya Pangan Nusantara</h3>
                  <p className="text-gray-700">Presiden RI (2016)</p>
                </div>
              </div>
            </div>
            
            {/* Kolom Gambar */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img 
                  src="/penghargaan1.jpg" 
                  alt="Penghargaan Progress Jogja 1" 
                  className="w-full h-64 object-cover rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600 text-center">Penyerahan penghargaan dari instansi pemerintah</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img 
                  src="/penghargaan2.jpg" 
                  alt="Penghargaan Progress Jogja 2" 
                   className="w-full h-64 object-contain rounded-lg mb-3"
                />
                <p className="text-sm text-gray-600 text-center">Dokumentasi acara penghargaan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Event Internasional */}
      <section id="event-internasional" className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Event Internasional</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Partisipasi Progress dalam berbagai event internasional untuk memperkenalkan produk lokal ke pasar global
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-singapore.jpg" 
                alt="Event Singapura" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇸🇬 Event di Singapura</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-saudi.jpg" 
                alt="Event Saudi Arabia" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇸🇦 Event di Saudi Arabia</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-azerbaijan.jpg" 
                alt="Event Azerbaijan" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇦🇿 Event di Azerbaijan</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-jepang.jpg" 
                alt="Event Jepang" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇯🇵 Event di Jepang</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-china.jpg" 
                alt="Event China" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇨🇳 Event di China</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-malaysia.jpg" 
                alt="Event Malaysia" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇲🇾 Event di Malaysia</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-australia.jpg" 
                alt="Event Australia" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇦🇺 Event di Australia</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/event-jerman.jpg" 
                alt="Event Jerman" 
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 text-center font-medium">🇩🇪 Event di Jerman</p>
            </div>
          </div>
        </div>
      </section>

      <section id="produk" className="py-16 px-8 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-10">Produk Unggulan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Wedang Uwuh", "Wedang Telang", "Jakencruk"].map((nama, i) => (
            <div key={i} className="bg-white p-6 rounded shadow hover:shadow-xl transition">
              <img
                src={`/produk${i + 1}.webp`}
                alt={nama}
                className="w-full h-48 object-contain rounded mb-4"
              />
              <h3 className="text-xl font-bold">{nama}</h3>
              <p className="text-sm text-gray-600 mt-2">
                Minuman rempah khas Yogyakarta yang tinggi antioksidan dan bermanfaat untuk kesehatan.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link 
            href="/produk"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Tampilkan Semua Produk
          </Link>
        </div>
      </section>

      {/* Section Kontak - untuk Next.js */}
      <section id="kontak" className="py-16 px-8 bg-white text-center relative z-10 min-h-[400px]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Kontak Kami</h2>
          
          <div className="space-y-6 text-lg">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-2xl">📍</span>
              <p className="text-gray-700">Jalan Mawar I/207, Condongcatur, Sleman, Yogyakarta</p>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📧</span>
              <a 
                href="mailto:progressjogjaofficial@gmail.com"
                className="text-gray-700 hover:text-amber-600 transition-colors"
              >
                progressjogjaofficial@gmail.com
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-2xl">📞</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <a 
                  href="tel:+6281215737328"
                  className="text-gray-700 hover:text-amber-600 transition-colors"
                >
                  +62 812-1573-7328
                </a>
                <span className="hidden sm:inline text-gray-400">/</span>
                <a 
                  href="tel:+6281578881432"
                  className="text-gray-700 hover:text-amber-600 transition-colors"
                >
                  +62 815-7888-1432
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📸</span>
              <a 
                href="https://instagram.com/progress.jogja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-amber-600 transition-colors"
              >
                Instagram: @progress.jogja
              </a>
            </div>
          </div>
          
          {/* Card untuk kontak yang lebih menarik */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Jam Operasional</h3>
              <p className="text-gray-600">Senin - Sabtu: 08:00 - 17:00 WIB</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Layanan</h3>
              <p className="text-gray-600">Konsultasi produk & pemesanan</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 