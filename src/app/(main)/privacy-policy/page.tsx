'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldCheckIcon, EyeIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/solid';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/checkout"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-red-600" />
              Kebijakan Privasi
            </h1>
            <p className="text-gray-600 mt-1">Pengaturan Alamat - Progress Jogja</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Introduction */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <EyeIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Transparansi Data</h3>
                  <p className="text-sm text-red-700">
                    Progress Jogja berkomitmen melindungi privasi dan keamanan informasi alamat Anda. 
                    Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data alamat pengiriman Anda.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-red-600" />
              Informasi Yang Kami Kumpulkan
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Dalam rangka memberikan layanan pengiriman yang optimal, kami mengumpulkan informasi berikut:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Nama Penerima:</strong> Untuk memastikan barang sampai ke orang yang tepat</li>
                <li><strong>Nomor Telepon:</strong> Untuk koordinasi pengiriman dan konfirmasi</li>
                <li><strong>Alamat Lengkap:</strong> Termasuk jalan, nomor rumah, RT/RW, kelurahan, kecamatan, dan kota</li>
                <li><strong>Kode Pos:</strong> Untuk memperlancar proses pengiriman</li>
                <li><strong>Koordinat Lokasi:</strong> (Opsional) Untuk memudahkan kurir menemukan lokasi</li>
                <li><strong>Label Alamat:</strong> Kategori alamat (Rumah, Kantor, Lainnya)</li>
                <li><strong>Catatan Kurir:</strong> Informasi tambahan untuk membantu pengiriman</li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LockClosedIcon className="w-6 h-6 text-red-600" />
              Penggunaan Informasi
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Informasi alamat yang Anda berikan akan digunakan untuk:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Pengiriman Produk</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Mengirim pesanan ke alamat yang tepat</li>
                    <li>Koordinasi dengan layanan kurir</li>
                    <li>Tracking dan notifikasi pengiriman</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Layanan Pelanggan</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Konfirmasi pesanan dan pengiriman</li>
                    <li>Menyelesaikan masalah pengiriman</li>
                    <li>Memberikan update status pesanan</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Kemudahan Berbelanja</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Menyimpan alamat untuk pemesanan berikutnya</li>
                    <li>Rekomendasi area pengiriman</li>
                    <li>Estimasi biaya dan waktu pengiriman</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Analisis Internal</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Meningkatkan layanan pengiriman</li>
                    <li>Analisis area jangkauan</li>
                    <li>Optimalisasi rute pengiriman</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Perlindungan Data</h2>
            <div className="space-y-4 text-gray-700">
              <p>Kami menerapkan langkah-langkah keamanan yang ketat untuk melindungi informasi Anda:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Enkripsi Data:</strong> Semua data alamat dienkripsi saat disimpan dan ditransmisikan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Akses Terbatas:</strong> Hanya staff yang berwenang yang dapat mengakses data alamat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Monitoring Keamanan:</strong> Sistem pemantauan 24/7 untuk mendeteksi aktivitas mencurigakan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Backup Aman:</strong> Data dicadangkan secara teratur dengan enkripsi penuh</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Berbagi Informasi</h2>
            <div className="space-y-4 text-gray-700">
              <p>Kami hanya membagikan informasi alamat Anda dalam situasi berikut:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <p><strong>Partner Kurir Terpercaya:</strong></p>
                    <p className="text-sm text-gray-600 mt-1">Hanya informasi yang diperlukan untuk pengiriman (nama, telepon, alamat) dibagikan ke kurir resmi kami.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <p><strong>Kewajiban Hukum:</strong></p>
                    <p className="text-sm text-gray-600 mt-1">Jika diwajibkan oleh hukum atau otoritas yang berwenang.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0 mt-0.5">✗</span>
                  <div>
                    <p><strong>Pihak Ketiga Komersial:</strong></p>
                    <p className="text-sm text-gray-600 mt-1">Kami TIDAK PERNAH menjual atau membagikan data alamat Anda untuk tujuan pemasaran pihak ketiga.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hak Anda</h2>
            <div className="space-y-4 text-gray-700">
              <p>Sebagai pengguna, Anda memiliki hak untuk:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Mengelola Data</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Melihat semua alamat tersimpan</li>
                    <li>Mengubah atau memperbarui alamat</li>
                    <li>Menghapus alamat yang tidak diperlukan</li>
                    <li>Mengatur alamat utama</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Kontrol Privasi</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Meminta penghapusan data alamat</li>
                    <li>Menolak penggunaan untuk analisis</li>
                    <li>Mendapat salinan data yang kami simpan</li>
                    <li>Mengajukan keluhan terkait privasi</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 mb-4">
                Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan privasi ini, 
                silakan hubungi kami melalui:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@progressjogja.com</p>
                <p><strong>Telepon:</strong> (0274) 123-4567</p>
                <p><strong>Alamat:</strong> Jl. Malioboro No. 123, Yogyakarta 55213</p>
                <p><strong>Waktu Layanan:</strong> Senin - Jumat, 09:00 - 17:00 WIB</p>
              </div>
            </div>
          </section>

          {/* Agreement */}
          <section>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-red-800 mb-3">Persetujuan</h3>
              <p className="text-red-700 text-sm leading-relaxed">
                Dengan menggunakan fitur alamat di Progress Jogja dan mencentang kotak persetujuan, 
                Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui kebijakan privasi ini. 
                Kebijakan ini dapat diperbarui sewaktu-waktu, dan kami akan memberitahukan perubahan 
                penting melalui email atau notifikasi di platform kami.
              </p>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Link
            href="/checkout"
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Kembali ke Checkout
          </Link>
        </div>
      </div>
    </div>
  );
} 