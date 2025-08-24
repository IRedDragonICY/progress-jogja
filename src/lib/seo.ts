import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://progressjogja.vercel.app';
const SITE_NAME = 'Progress Jogja';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  section,
  tags,
  noIndex = false,
  noFollow = false,
}: SEOConfig = {}): Metadata {
  const metaTitle = title 
    ? `${title} | ${SITE_NAME}` 
    : `${SITE_NAME} - Produk Herbal dan Tradisional Berkualitas`;
  
  const metaDescription = description || 
    'Temukan produk herbal dan minuman tradisional berkualitas tinggi dari Progress Jogja. Menghadirkan kesehatan alami dengan cita rasa autentik Indonesia.';
  
  const metaImage = image || `${BASE_URL}/progressjogja-logo.webp`;
  const metaUrl = url || BASE_URL;
  
  const allKeywords = [
    ...keywords,
    'Progress Jogja',
    'produk herbal',
    'minuman tradisional',
    'kesehatan alami',
    'jamu tradisional',
    'Yogyakarta',
    'UMKM Indonesia'
  ];

  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    keywords: allKeywords,
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      locale: 'id_ID',
      url: metaUrl,
      siteName: SITE_NAME,
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
          type: 'image/webp',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@progressjogja',
      site: '@progressjogja',
    },
    alternates: {
      canonical: metaUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
      nocache: false,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime || authors || section || tags)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: authors?.map(author => `${BASE_URL}/author/${author.toLowerCase().replace(/\s+/g, '-')}`),
      section,
      tags,
    };
  }

  return metadata;
}

export function generateProductSchema(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'New' | 'Used' | 'Refurbished';
  currency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/produk/${product.id}`,
    name: product.name,
    description: product.description,
    image: product.image || `${BASE_URL}/progressjogja-logo.webp`,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: product.currency || 'IDR',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      itemCondition: `https://schema.org/${product.condition || 'New'}Condition`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
      },
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

export function generateOrganizationSchema(organization: {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  socialMedia?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name || SITE_NAME,
    description: organization.description || 'Produk herbal dan minuman tradisional berkualitas tinggi dari Yogyakarta',
    url: organization.url || BASE_URL,
    logo: organization.logo || `${BASE_URL}/progressjogja-logo.webp`,
    email: organization.email,
    telephone: organization.phone,
    address: organization.address ? {
      '@type': 'PostalAddress',
      streetAddress: organization.address.streetAddress,
      addressLocality: organization.address.addressLocality || 'Yogyakarta',
      addressRegion: organization.address.addressRegion || 'Daerah Istimewa Yogyakarta',
      postalCode: organization.address.postalCode,
      addressCountry: organization.address.addressCountry || 'Indonesia',
    } : undefined,
    sameAs: organization.socialMedia || [],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/produk?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export const defaultKeywords = [
  'Progress Jogja',
  'produk herbal',
  'minuman tradisional',
  'herbal Indonesia',
  'kesehatan alami',
  'jamu tradisional',
  'produk organik',
  'Yogyakarta',
  'UMKM Indonesia',
  'minuman kesehatan',
  'produk lokal',
  'tradisional Indonesia',
];

export const categoryKeywords = {
  herbal: ['jamu', 'herbal', 'obat tradisional', 'kesehatan alami', 'ramuan herbal'],
  minuman: ['minuman tradisional', 'minuman herbal', 'minuman kesehatan', 'minuman alami'],
  makanan: ['makanan tradisional', 'makanan sehat', 'makanan organik', 'kuliner tradisional'],
  suplemen: ['suplemen herbal', 'suplemen alami', 'vitamin herbal', 'nutrisi alami'],
};