import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Define the base URL - you should replace this with your actual domain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://progressjogja.vercel.app';

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface Product {
  id: string;
  name: string;
  updated_at: string;
  is_published: boolean;
  product_types?: {
    name: string;
  }[] | null;
}

interface ProductType {
  id: string;
  name: string;
}

// Create Supabase client for server-side operations
async function createSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient(
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
}

// Static routes with their priorities and update frequencies
const staticRoutes: Omit<SitemapEntry, 'url'>[] = [
  // High priority pages
  { changeFrequency: 'daily', priority: 1.0 }, // Home page
  { changeFrequency: 'weekly', priority: 0.9 }, // Products page
  
  // Medium priority pages
  { changeFrequency: 'monthly', priority: 0.7 }, // Privacy policy
  { changeFrequency: 'monthly', priority: 0.7 }, // Kebijakan privasi
  
  // Lower priority pages (auth pages should be lower priority for SEO)
  { changeFrequency: 'yearly', priority: 0.3 }, // Login
  { changeFrequency: 'yearly', priority: 0.3 }, // Register
  { changeFrequency: 'monthly', priority: 0.5 }, // Checkout
];

const staticPaths = [
  '/',
  '/produk',
  '/privacy-policy',
  '/kebijakan-privasi',
  '/login',
  '/register',
  '/checkout',
];

async function getProductsForSitemap(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, updated_at, is_published, product_types(name)')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching products for sitemap:', error);
      return [];
    }

    return (products || []) as unknown as Product[];
  } catch (error) {
    console.error('Error in getProductsForSitemap:', error);
    return [];
  }
}

async function getProductTypesForSitemap(): Promise<ProductType[]> {
  try {
    const supabase = await createSupabaseServer();
    
    const { data: productTypes, error } = await supabase
      .from('product_types')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching product types for sitemap:', error);
      return [];
    }

    return (productTypes || []) as ProductType[];
  } catch (error) {
    console.error('Error in getProductTypesForSitemap:', error);
    return [];
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

async function generateSitemap(): Promise<NextResponse> {
  try {
    const sitemap: SitemapEntry[] = [];
    
    // Add static routes
    staticPaths.forEach((path, index) => {
      sitemap.push({
        url: `${BASE_URL}${path}`,
        lastModified: new Date().toISOString(),
        ...staticRoutes[index],
      });
    });

    // Fetch and add product pages
    const products = await getProductsForSitemap();
    products.forEach((product) => {
      const productSlug = slugify(product.name);
      sitemap.push({
        url: `${BASE_URL}/produk/${product.id}/${productSlug}`,
        lastModified: product.updated_at,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Fetch and add product category pages
    const productTypes = await getProductTypesForSitemap();
    productTypes.forEach((type) => {
      const categorySlug = slugify(type.name);
      sitemap.push({
        url: `${BASE_URL}/produk/kategori/${categorySlug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    // Generate XML sitemap
    const xmlSitemap = generateXMLSitemap(sitemap);

    return new NextResponse(xmlSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}`,
        'CDN-Cache-Control': `public, max-age=${CACHE_DURATION}`,
        'Vercel-CDN-Cache-Control': `public, max-age=${CACHE_DURATION}`,
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap in case of error
    const basicSitemap = generateXMLSitemap([
      {
        url: BASE_URL,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ]);

    return new NextResponse(basicSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=300`, // Shorter cache for error case
      },
    });
  }
}

function generateXMLSitemap(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const sitemapOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">';
  const sitemapClose = '</urlset>';

  const urls = entries
    .map((entry) => {
      const lastMod = entry.lastModified
        ? new Date(entry.lastModified).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${entry.changeFrequency || 'weekly'}</changefreq>
    <priority>${entry.priority || 0.5}</priority>
  </url>`;
    })
    .join('\n');

  return `${xmlHeader}
${sitemapOpen}
${urls}
${sitemapClose}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Main GET handler
export async function GET(): Promise<NextResponse> {
  return await generateSitemap();
}