import { NextRequest } from 'next/server';
import { GET } from './route';
import type { ScrapedProductData } from './route';

describe('Tokopedia Scraper API Handler - Integration Test', () => {

    const liveTestUrl = 'https://www.tokopedia.com/xiaomi/poco-x7-pro-5g-dimensity-8400-ultra-6000mah-90w-hypercharge-crystalres-1-5k-amoled-official-store-1731560055098738201';

    it('should fetch and scrape data from the live Tokopedia URL', async () => {

        const req = new NextRequest(
            new URL(`http://localhost/api/product-details?url=${encodeURIComponent(liveTestUrl)}`)
        );

        const response = await GET(req);

        expect(response.status).toBe(200);

        const responseData = await response.json() as ScrapedProductData;

        // Use JSON.stringify for complete output
        console.log('Response Data:', JSON.stringify(responseData, null, 2));

        // Basic checks (can be expanded)
        expect(responseData.product.title).toBeDefined();
        expect(responseData.product.title).not.toBeNull();
        expect(responseData.product.imageUrls.length).toBeGreaterThan(0);
        expect(responseData.product.price).toBeGreaterThan(0);
        expect(responseData.store.name).toBeDefined();
        expect(responseData.store.name).not.toBeNull();
        expect(responseData.reviews.overallRating).toBeDefined();
        expect(responseData.reviews.ratingBreakdown).toBeDefined();
        // Check if ratingBreakdown is an array (it might be empty if no reviews, but should exist)
        expect(Array.isArray(responseData.reviews.ratingBreakdown)).toBe(true);

        // If reviews exist, check the structure of the first breakdown item
        if (responseData.reviews.ratingBreakdown.length > 0) {
            expect(responseData.reviews.ratingBreakdown[0]).toHaveProperty('star');
            expect(responseData.reviews.ratingBreakdown[0]).toHaveProperty('count');
            expect(responseData.reviews.ratingBreakdown[0]).toHaveProperty('percentage');
            expect(typeof responseData.reviews.ratingBreakdown[0].star).toBe('number');
            expect(typeof responseData.reviews.ratingBreakdown[0].count).toBe('number');
            expect(typeof responseData.reviews.ratingBreakdown[0].percentage).toBe('number');
        }


    }, 45000);

});
