import React from 'react';
import { Metadata } from 'next';
import AppLayout from './AppLayout';
import { generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Beranda',
  description: 'Progress Jogja - Menyajikan produk herbal dan minuman tradisional berkualitas tinggi dari Yogyakarta. Temukan kesehatan alami dengan cita rasa autentik Indonesia.',
  keywords: [
    'Progress Jogja',
    'produk herbal Yogyakarta',
    'minuman tradisional Indonesia',
    'jamu tradisional',
    'kesehatan alami',
    'UMKM Yogyakarta',
    'produk organik Indonesia',
    'herbal berkualitas',
    'minuman kesehatan',
    'produk lokal Indonesia'
  ],
  type: 'website',
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}