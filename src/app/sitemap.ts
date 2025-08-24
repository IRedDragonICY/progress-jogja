import { MetadataRoute } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Define the base URL - you should replace this with your actual domain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://progressjogja.vercel.app';

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const sitemap: MetadataRoute.Sitemap = [];
    
    // Add static routes with proper SEO priorities
    sitemap.push(
      {
        url: `${BASE_URL}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/produk`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/kebijakan-privasi`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/checkout`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      // Auth pages with lower priority for SEO
      {
        url: `${BASE_URL}/login`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${BASE_URL}/register`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      }
    );

    // Fetch and add product pages
    const products = await getProductsForSitemap();
    products.forEach((product) => {
      const productSlug = slugify(product.name);
      sitemap.push({
        url: `${BASE_URL}/produk/${product.id}/${productSlug}`,
        lastModified: new Date(product.updated_at),
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
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap in case of error
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}