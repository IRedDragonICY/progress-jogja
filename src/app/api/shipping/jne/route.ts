import { type NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

function extractCityFromAddress(address: string): string | null {
  const parts = address.split(',').map(p => p.trim());
  if (parts.length === 0) return null;

  for (const part of parts) {
    const lowerPart = part.toLowerCase();
    if (lowerPart.startsWith('kota ') || lowerPart.startsWith('kabupaten ') || lowerPart.startsWith('kab. ')) {
      return part.replace(/^(kota|kabupaten|kab.)\s*/i, '').trim();
    }
  }

  const nonCityKeywords = [
    'indonesia', 'java', 'jawa', 'sumatera', 'sumatra', 'kalimantan', 'borneo',
    'sulawesi', 'celebes', 'papua', 'provinsi', 'province', 'daerah istimewa',
    'special region', 'daerah khusus ibukota', 'special capital region',
  ];

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const lowerPart = part.toLowerCase();

    if (!part || /^\d{5}$/.test(part)) continue;

    const isNonCity = nonCityKeywords.some(keyword => lowerPart.includes(keyword));
    if (!isNonCity) {
      return part;
    }
  }

  return null;
}


async function getDestinationCode(cityName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.jne.co.id/api-origin?search=${encodeURIComponent(cityName)}`);
    if (!response.ok) {
      throw new Error(`JNE API search failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data.status && data.data && data.data.length > 0) {
      return data.data[0].code;
    }
    return null;
  } catch (error) {
    console.error('Error fetching JNE destination code:', error);
    return null;
  }
}

async function calculateShippingFee(destinationCode: string, weight: string) {
  const origin = 'JOG10000'; // Yogyakarta
  const url = `https://www.jne.co.id/shipping-fee?origin=${origin}&destination=${destinationCode}&weight=${weight}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`JNE shipping fee page failed with status ${response.status}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const shippingOptions: { service: string; price: number; etd: string; }[] = [];
    const rows = document.querySelectorAll('div.wrap-table table tbody tr');

    rows.forEach(row => {
      const columns = row.querySelectorAll('td');
      if (columns.length >= 4) {
        const service = columns[0].textContent?.trim() ?? '';
        const priceText = columns[2].textContent?.trim() ?? '';
        const etd = columns[3].textContent?.trim() ?? '';
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
        if (service && !isNaN(price) && etd) {
          shippingOptions.push({ service, price, etd });
        }
      }
    });
    return shippingOptions;
  } catch (error) {
    console.error('Error scraping JNE shipping fee:', error);
    throw new Error('Failed to calculate shipping fee.');
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const weight = searchParams.get('weight');

  if (!address || !weight) {
    return NextResponse.json({ error: 'Missing address or weight parameter' }, { status: 400 });
  }

  const cityName = extractCityFromAddress(address);

  if (!cityName) {
    return NextResponse.json({ error: 'Could not determine city from the provided address.' }, { status: 400 });
  }

  const destinationCode = await getDestinationCode(cityName);

  if (!destinationCode) {
    return NextResponse.json({ error: `Destination not found for the city: ${cityName}` }, { status: 404 });
  }

  try {
    const shippingOptions = await calculateShippingFee(destinationCode, weight);
    return NextResponse.json(shippingOptions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}