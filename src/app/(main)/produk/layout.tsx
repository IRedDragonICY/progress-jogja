import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Produk Kami',
  description: 'Jelajahi koleksi lengkap produk herbal dan minuman tradisional berkualitas tinggi dari Progress Jogja. Temukan produk kesehatan alami terbaik untuk gaya hidup sehat Anda.',
  keywords: [
    'produk herbal',
    'minuman tradisional',
    'jamu Indonesia',
    'produk kesehatan alami',
    'herbal Yogyakarta',
    'minuman herbal',
    'suplemen alami',
    'Progress Jogja produk',
    'katalog produk herbal',
    'toko online herbal'
  ],
  type: 'website',
});

export default function ProdukLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}