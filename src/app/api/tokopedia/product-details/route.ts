import {NextRequest, NextResponse} from 'next/server';
import {JSDOM} from 'jsdom';
import puppeteer, { Browser, Page } from 'puppeteer';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore, { Browser as PuppeteerCoreBrowser, Page as PuppeteerCorePage } from 'puppeteer-core';

interface RatingBreakdown {
    star: number;
    count: number;
    percentage: number;
}

interface IndividualReview {
    reviewerName: string | null;
    reviewerAvatarUrl: string | null;
    rating: number | null;
    comment: string | null;
    date: string | null;
}

export interface ScrapedProductData {
    product: {
        title: string | null;
        imageUrls: string[];
        soldCount: number | null;
        stock: number | null;
        price: number | null;
    };
    store: {
        name: string | null;
        location: string | null;
        rating: number | null;
        avatarUrl: string | null;
    };
    reviews: {
        overallRating: number | null;
        totalRatings: number | null;
        totalReviews: number | null;
        satisfactionPercentage: number | null;
        ratingBreakdown: RatingBreakdown[];
        individualReviews: IndividualReview[];
    };
}

function safeQuerySelector<T extends Element>(
    doc: Document | Element,
    selector: string
): T | null {
    try {
        return doc.querySelector<T>(selector);
    } catch {
        return null;
    }
}

function safeQuerySelectorAllStrict<T extends Element>(
    doc: Document | Element,
    selector: string
): NodeListOf<T> {
     try {
         return doc.querySelectorAll<T>(selector);
    } catch {
        if (doc instanceof Document) {
           return doc.createDocumentFragment().querySelectorAll<T>(selector);
        } else if (doc instanceof Element && doc.ownerDocument) {
           return doc.ownerDocument.createDocumentFragment().querySelectorAll<T>(selector);
        }
        const fragment = new JSDOM('').window.document.createDocumentFragment();
        return fragment.querySelectorAll<T>(selector);
    }
}

function extractNumber(text: string | null | undefined): number | null {
    if (!text) return null;
    const cleanedText = text.replace(/[Rp().,]/g, '').trim();
    const match = cleanedText.match(/\d+/);
    if (!match) return null;
    const num = parseInt(match[0], 10);
    return isNaN(num) ? null : num;
}


function extractFloatNumber(text: string | null | undefined): number | null {
    if (!text) return null;
    const match = text.match(/[\d.,]+/);
    if (!match) return null;

    const matchedText = match[0];
    let cleaned = matchedText.replace(/\./g, '').replace(',', '.');

    const parts = cleaned.split('.');
    if (parts.length > 2) {
       cleaned = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

// const remoteExecutablePath = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

export async function GET(
    req: NextRequest
): Promise<NextResponse<ScrapedProductData | { error: string }>> {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL query parameter is required' }, { status: 400 });
    }

    let browser: Browser | PuppeteerCoreBrowser | null = null;

    try {
        if (process.env.NODE_ENV === "production") {
            browser = await puppeteerCore.launch({
                args: [...chromium.args, '--ignore-certificate-errors'],
                executablePath: await chromium.executablePath(),
                headless: chromium.headless, // Use chromium.headless for production
            });
        } else {
            // Keep existing local development launch options
            browser = await puppeteer.launch({
              headless: true, // Or false for local debugging
              args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-accelerated-2d-canvas',
                  '--no-first-run',
                  '--no-zygote',
                  '--disable-gpu',
                  '--disable-extensions',
                  '--mute-audio',
                  '--disable-background-networking',
                  '--disable-sync'
              ],
              defaultViewport: { width: 1366, height: 768 }
            });
        }
        const page: Page | PuppeteerCorePage = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
        });

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if(['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())){
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        await page.waitForSelector('body', { timeout: 10000 });

        try {
             const reviewSectionSelector = '#pdp_comp-review';
             await page.waitForSelector(reviewSectionSelector, { timeout: 15000 });

             const scrollIntoViewInPage = (selector: string): void => {
                 const el = document.querySelector(selector);
                 el?.scrollIntoView({ behavior: 'auto', block: 'center' });
             };

             await (page as Page).evaluate(scrollIntoViewInPage, reviewSectionSelector);

             await page.waitForSelector('#review-feed article.css-15m2bcr', { timeout: 15000, visible: true });
        } catch (reviewWaitError) {
             console.warn("Review section or feed articles did not fully appear after scroll/wait:", reviewWaitError instanceof Error ? reviewWaitError.message : reviewWaitError);
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        const html = await page.content();

        await page.close();
        await browser.close();
        browser = null;

        const dom = new JSDOM(html);
        const document = dom.window.document;

        const data: ScrapedProductData = {
            product: {
                title: null,
                imageUrls: [],
                soldCount: null,
                stock: null,
                price: null,
            },
            store: {
                name: null,
                location: null,
                rating: null,
                avatarUrl: null,
            },
            reviews: {
                overallRating: null,
                totalRatings: null,
                totalReviews: null,
                satisfactionPercentage: null,
                ratingBreakdown: [],
                individualReviews: [],
            },
        };

        data.product.title = safeQuerySelector<HTMLHeadingElement>(document, 'h1[data-testid="lblPDPDetailProductName"]')?.textContent?.trim() ?? null;

        const mainImageElement = safeQuerySelector<HTMLImageElement>(document, 'img[data-testid="PDPMainImage"]');
        if(mainImageElement?.src && !mainImageElement.src.startsWith('data:image')) {
             data.product.imageUrls.push(mainImageElement.src);
        }

        const thumbnailImageElements = safeQuerySelectorAllStrict<HTMLImageElement>(document, 'button[data-testid="PDPImageThumbnail"] img');
         thumbnailImageElements.forEach(img => {
            const imgSrc = img.getAttribute('src') || img.getAttribute('data-src');
            if (imgSrc && !imgSrc.startsWith('data:image') && !imgSrc.includes('kratos/85cc883d.svg')) {
                 const baseSrc = imgSrc.split('?')[0];
                 if (!data.product.imageUrls.some(existingUrl => existingUrl.split('?')[0] === baseSrc)) {
                     const mainBaseSrc = mainImageElement?.src?.split('?')[0];
                     if (baseSrc !== mainBaseSrc) {
                        data.product.imageUrls.push(imgSrc);
                     }
                 }
            }
         });
         data.product.imageUrls = [...new Set(data.product.imageUrls)];


        const soldCountText = safeQuerySelector(document, 'p[data-testid="lblPDPDetailProductSoldCounter"]')?.textContent;
        data.product.soldCount = extractNumber(soldCountText);

        const stockElement = safeQuerySelector(document, '[data-testid="lblPDPDetailProductStock"] b, [data-testid="stock-label"] b');
        data.product.stock = extractNumber(stockElement?.textContent);
        if (data.product.stock === null) {
           const infoStockElement = safeQuerySelector(document, '[data-testid="lblPDPInfoStock"]');
           if (infoStockElement?.textContent?.toLowerCase().includes('tersedia')) {
               const stockMatch = infoStockElement.textContent.match(/(\d+)/);
               data.product.stock = stockMatch ? parseInt(stockMatch[1], 10) : 1;
           } else if(infoStockElement?.textContent?.toLowerCase().includes('stok habis')){
               data.product.stock = 0;
           }
        }

        const priceText = safeQuerySelector(document, '.price[data-testid="lblPDPDetailProductPrice"]')?.textContent;
        data.product.price = extractNumber(priceText);

        const shopCredibilitySection = safeQuerySelector(document, '#pdp_comp-shop_credibility, [data-testid="shop-card"]');
        if(shopCredibilitySection) {
            data.store.name = safeQuerySelector<HTMLHeadingElement>(shopCredibilitySection, '[data-testid="llbPDPFooterShopName"] h2, [data-testid="shopName"]')?.textContent?.trim() ?? null;
            data.store.avatarUrl = safeQuerySelector<HTMLImageElement>(shopCredibilitySection, 'img[data-testid="imgPDPFooterShopBadge"], img[data-testid="shopAvatar"]')?.src ?? null;

            const storeRatingParent = safeQuerySelector(shopCredibilitySection, '.css-b6ktge .css-1aa4ga7-unf-grid-row:first-child .css-e39d2g, [data-testid="shopInfo"] [data-testid="shopRating"]');
            if (storeRatingParent) {
                const storeRatingText = safeQuerySelector<HTMLSpanElement>(storeRatingParent, 'p > span:first-child, span:first-of-type')?.textContent;
                data.store.rating = extractFloatNumber(storeRatingText);
            } else {
                 const altStoreRatingText = safeQuerySelector(shopCredibilitySection, '[data-testid="lblShopRating"]')?.textContent;
                 data.store.rating = extractFloatNumber(altStoreRatingText?.split('/')[0]);
            }
        }

        const shipmentSection = safeQuerySelector(document, '#pdp_comp-shipment_v4, [data-testid="compShipment"]');
        if(shipmentSection){
            const locationElement = safeQuerySelector<HTMLElement>(shipmentSection, 'h2.css-g78l6p-unf-heading b, [data-testid="lblPDPShipmentOrigin"] b');
            data.store.location = locationElement?.textContent?.trim() ?? null;
        }

        const reviewSection = safeQuerySelector(document, '#pdp_comp-review');
        if (reviewSection) {
            const overallRatingElement = safeQuerySelector(reviewSection, '[data-testid="lblOverallRating"], .css-p20wo7 .css-dn7ef3');
            data.reviews.overallRating = extractFloatNumber(overallRatingElement?.textContent);

            const ratingReviewText = safeQuerySelector(reviewSection, '[data-testid="lblRatingAndReview"], .css-p20wo7 .css-scw5ei-unf-heading')?.textContent;
            if (ratingReviewText) {
                const parts = ratingReviewText.split('•').map(s => s.trim());
                if (parts[0]) data.reviews.totalRatings = extractNumber(parts[0]);
                 if (parts.length > 1 && parts[1]) {
                    data.reviews.totalReviews = extractNumber(parts[1]);
                 } else {
                    const reviewCountSubtitle = safeQuerySelector(reviewSection, '[data-testid="reviewSortingSubtitle"]');
                    if (reviewCountSubtitle?.textContent) {
                        const match = reviewCountSubtitle.textContent.match(/dari ([\d.,]+) ulasan/);
                        if(match && match[1]){
                            data.reviews.totalReviews = extractNumber(match[1]);
                        }
                    }
                     if (data.reviews.totalReviews === null && data.reviews.totalRatings !== null && data.reviews.totalRatings > 0) {
                        data.reviews.totalReviews = 0;
                     }
                 }
            }

            const satisfactionText = safeQuerySelector(reviewSection, '[data-testid="lblSatisfactionPercentage"], .css-p20wo7 .css-143g15z-unf-heading')?.textContent;
            data.reviews.satisfactionPercentage = extractNumber(satisfactionText);

            const breakdownContainer = safeQuerySelector(reviewSection, '.css-1t9sxbc');
            if (breakdownContainer) {
                const breakdownElements = safeQuerySelectorAllStrict(breakdownContainer, '.css-10emkyv');
                breakdownElements.forEach(el => {
                     const starText = safeQuerySelector(el, '.css-199yh9f')?.textContent;
                     const countText = safeQuerySelector(el, '.css-myjxhx')?.textContent;
                     const progressBar = safeQuerySelector<HTMLDivElement>(el, '[role="progressbar"]');
                     let percentage: number | null = null;

                     if (progressBar) {
                         const ariaValue = progressBar.getAttribute('aria-valuenow');
                         if (ariaValue) {
                            percentage = extractFloatNumber(ariaValue);
                         }
                     }

                     if (percentage === null) {
                         const percentageText = safeQuerySelector(el, '.css-1ngblhr')?.textContent;
                         percentage = extractFloatNumber(percentageText?.replace('%', ''));
                     }

                     const star = extractNumber(starText);
                     const count = extractNumber(countText);

                    if (star !== null && count !== null && percentage !== null) {
                        data.reviews.ratingBreakdown.push({ star, count, percentage });
                    }
                });
            }

            const reviewFeed = safeQuerySelector(reviewSection, '#review-feed');
            if(reviewFeed) {
                 const reviewArticles = safeQuerySelectorAllStrict<HTMLElement>(reviewFeed, 'article.css-15m2bcr');
                 reviewArticles.forEach((article, index) => {
                     const reviewerNameElement = safeQuerySelector(article, '.css-k4rf3m span.name');
                     const reviewerName = reviewerNameElement?.textContent?.trim() ?? null;

                     const reviewerAvatarElement = safeQuerySelector<HTMLImageElement>(article, '.css-k4rf3m img[alt="foto profil"]');
                     let reviewerAvatarUrl : string | null = reviewerAvatarElement?.src ?? null;
                     if (reviewerAvatarUrl && reviewerAvatarUrl.startsWith('data:image/svg+xml')) {
                         const lazySrc = reviewerAvatarElement?.getAttribute('data-src') || reviewerAvatarElement?.getAttribute('data-li-lazy-src');
                         reviewerAvatarUrl = lazySrc ?? null;
                     }

                     const ratingContainer = safeQuerySelector(article, 'div[data-testid="icnStarRating"]');
                     let rating : number | null = null;
                     if (ratingContainer) {
                         const ratingSvgs = safeQuerySelectorAllStrict(ratingContainer, 'svg');
                         rating = ratingSvgs.length > 0 ? ratingSvgs.length : null;
                     }

                     const commentElement = safeQuerySelector(article, 'span[data-testid="lblItemUlasan"]');
                     const comment = commentElement?.textContent?.trim() ?? null;

                     const dateElement = safeQuerySelector(article, '.css-1w6pe1p p.css-vqrjg4-unf-heading');
                     const date = dateElement?.textContent?.trim() ?? null;

                     if (reviewerName || comment || rating) {
                         data.reviews.individualReviews.push({
                             reviewerName,
                             reviewerAvatarUrl,
                             rating,
                             comment,
                             date
                         });
                     } else {
                         console.warn(`Skipping review article index ${index} due to missing essential data.`);
                     }
                 });

                 if (data.reviews.individualReviews.length > 0 && data.reviews.totalReviews === 0 && data.reviews.totalRatings !== null && data.reviews.totalRatings > 0) {
                    const reviewCountSubtitle = safeQuerySelector(reviewSection, '[data-testid="reviewSortingSubtitle"]');
                    if (reviewCountSubtitle?.textContent) {
                        const match = reviewCountSubtitle.textContent.match(/dari ([\d.,]+) ulasan/);
                        if(match && match[1]){
                            data.reviews.totalReviews = extractNumber(match[1]);
                        } else {
                             data.reviews.totalReviews = data.reviews.individualReviews.length;
                        }
                    } else {
                         data.reviews.totalReviews = data.reviews.individualReviews.length;
                    }
                 }
            }
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Scraping error:', error);

        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during scraping';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}