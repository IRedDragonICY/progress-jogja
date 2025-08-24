import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateSEOMetadata, generateProductSchema } from '@/lib/seo';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  store_links: { name: string; url: string; }[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  product_types?: {
    name: string;
  };
}

interface PageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string): Promise<Product | null> {
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

  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_types(name)')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error || !product) {
    return null;
  }

  return product as unknown as Product;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return generateSEOMetadata({
      title: 'Produk Tidak Ditemukan',
      description: 'Produk yang Anda cari tidak tersedia.',
      noIndex: true,
    });
  }

  const productImage = product.image_urls?.[0] || undefined;
  const categoryName = product.product_types?.name;
  
  return generateSEOMetadata({
    title: product.name,
    description: product.description,
    keywords: [
      product.name,
      categoryName || '',
      'produk herbal',
      'Progress Jogja',
      'kesehatan alami',
      'minuman tradisional',
    ].filter(Boolean),
    image: productImage,
    type: 'article',
    publishedTime: product.created_at,
    modifiedTime: product.updated_at,
    section: categoryName,
  });
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const productSchema = generateProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image_urls?.[0],
    category: product.product_types?.name,
    brand: 'Progress Jogja',
    availability: 'InStock',
    condition: 'New',
    currency: 'IDR',
  });

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-red-600 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/produk" className="hover:text-red-600 transition-colors">
                  Produk
                </Link>
              </li>
              {product.product_types?.name && (
                <>
                  <li>/</li>
                  <li>
                    <span className="text-gray-400">{product.product_types.name}</span>
                  </li>
                </>
              )}
              <li>/</li>
              <li>
                <span className="text-gray-900 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div className="space-y-4">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={product.image_urls[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-gray-400 text-lg">Tidak ada gambar</span>
                  </div>
                )}
                
                {/* Additional Images */}
                {product.image_urls && product.image_urls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.image_urls.slice(1, 5).map((imageUrl, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={imageUrl}
                          alt={`${product.name} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 12.5vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Category Badge */}
                {product.product_types?.name && (
                  <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.product_types.name}
                  </span>
                )}

                {/* Product Name */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="text-3xl font-bold text-red-600">
                  {formatRupiah(product.price)}
                </div>

                {/* Description */}
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Deskripsi Produk</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>

                {/* Store Links */}
                {product.store_links && product.store_links.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Beli di:</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.store_links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          {link.name}
                          <svg
                            className="ml-2 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact CTA */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Butuh informasi lebih lanjut?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Hubungi kami untuk konsultasi dan informasi detail tentang produk ini.
                  </p>
                  <Link
                    href="/#kontak"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produk Lainnya</h2>
            <div className="text-center py-12">
              <Link
                href="/produk"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Lihat Semua Produk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}