import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateSEOMetadata, categoryKeywords } from '@/lib/seo';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  product_types?: {
    name: string;
  };
}

interface ProductType {
  id: string;
  name: string;
  slug: string;
}

interface PageProps {
  params: {
    slug: string;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getCategoryBySlug(slug: string): Promise<ProductType | null> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: categories, error } = await supabase
    .from('product_types')
    .select('*');

  if (error || !categories) {
    return null;
  }

  const category = categories.find(cat => slugify(cat.name) === slug);
  if (!category) {
    return null;
  }

  return {
    ...category,
    slug: slugify(category.name),
  };
}

async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: products, error } = await supabase
    .from('products')
    .select('*, product_types(name)')
    .eq('product_type_id', categoryId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error || !products) {
    return [];
  }

  return products as unknown as Product[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    return generateSEOMetadata({
      title: 'Kategori Tidak Ditemukan',
      description: 'Kategori produk yang Anda cari tidak tersedia.',
      noIndex: true,
    });
  }

  const categoryName = category.name;
  const categorySpecificKeywords = categoryKeywords[categoryName.toLowerCase() as keyof typeof categoryKeywords] || [];
  
  return generateSEOMetadata({
    title: `Produk ${categoryName}`,
    description: `Temukan berbagai produk ${categoryName.toLowerCase()} berkualitas tinggi dari Progress Jogja. Produk herbal dan tradisional terbaik untuk kesehatan Anda.`,
    keywords: [
      `produk ${categoryName.toLowerCase()}`,
      categoryName,
      ...categorySpecificKeywords,
      'Progress Jogja',
      'produk herbal',
      'kesehatan alami',
    ],
    type: 'website',
  });
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/produk" className="hover:text-white transition-colors">
                  Produk
                </Link>
              </li>
              <li>/</li>
              <li>
                <span className="text-white font-medium">{category.name}</span>
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Produk {category.name}
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Temukan berbagai produk {category.name.toLowerCase()} berkualitas tinggi
            </p>
            <p className="text-lg opacity-80">
              {products.length} produk tersedia dalam kategori ini
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Belum Ada Produk
              </h2>
              <p className="text-gray-600 mb-8">
                Produk dalam kategori {category.name} akan segera hadir.
              </p>
              <Link
                href="/produk"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Lihat Semua Produk
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-64">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <Image
                        src={product.image_urls[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                        <span className="text-gray-400">Tidak ada gambar</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-red-600">
                        {formatRupiah(product.price)}
                      </span>
                      <Link
                        href={`/produk/${product.id}/${slugify(product.name)}`}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Tertarik dengan Produk {category.name}?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Hubungi kami sekarang untuk informasi lebih lanjut dan konsultasi produk
          </p>
          <Link
            href="/#kontak"
            className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            Hubungi Kami Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}