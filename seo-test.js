#!/usr/bin/env node

/**
 * SEO Testing Script for Progress Jogja
 * 
 * This script tests the sitemap generation and basic SEO functionality.
 * Run with: node seo-test.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log('🔍 Testing SEO Implementation for Progress Jogja');
console.log('================================================');
console.log(`Testing URL: ${BASE_URL}`);
console.log('');

// Test URLs to check
const testUrls = [
  '/',
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.json',
  '/produk',
  '/privacy-policy',
];

function testUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = `${BASE_URL}${url}`;
    const module = fullUrl.startsWith('https:') ? https : http;
    
    const req = module.get(fullUrl, (res) => {
      const { statusCode, headers } = res;
      
      console.log(`✅ ${url}`);
      console.log(`   Status: ${statusCode}`);
      console.log(`   Content-Type: ${headers['content-type'] || 'Not specified'}`);
      
      if (url === '/sitemap.xml') {
        console.log(`   Cache-Control: ${headers['cache-control'] || 'Not specified'}`);
      }
      
      console.log('');
      resolve({ url, statusCode, headers });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      resolve({ url, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${url}`);
      console.log(`   Timeout: Request took too long`);
      console.log('');
      req.destroy();
      resolve({ url, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('Testing core SEO endpoints...');
  console.log('');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
  
  console.log('🎉 SEO Testing Complete!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Verify sitemap.xml contains your products');
  console.log('2. Check robots.txt allows search engine crawling');
  console.log('3. Test structured data with Google Rich Results Test');
  console.log('4. Submit sitemap to Google Search Console');
  console.log('');
  console.log('🔗 Useful Tools:');
  console.log('- Google Rich Results Test: https://search.google.com/test/rich-results');
  console.log('- Google Search Console: https://search.google.com/search-console');
  console.log('- PageSpeed Insights: https://pagespeed.web.dev/');
}

// Run the tests
runTests().catch(console.error);