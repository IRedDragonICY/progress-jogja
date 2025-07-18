import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getFullExportData } from '@/lib/supabase';
import * as XLSX from 'xlsx';

function getCookie(req: NextRequest, name: string): string | undefined {
  return req.cookies.get(name)?.value;
}

export async function GET(req: NextRequest) {
  const response = NextResponse.next();
  const supabaseRequestClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return getCookie(req, name); },
        set(name: string, value: string, options: CookieOptions) { response.cookies.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { response.cookies.set({ name, value: '', ...options }); },
      },
    }
  );

  const { data: { user } } = await supabaseRequestClient.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get('reportType') as 'financial' | 'users' | 'products' | 'organization_profile' | null;

  if (!reportType) {
    return NextResponse.json({ error: 'Missing reportType parameter' }, { status: 400 });
  }

  try {
    const data = await getFullExportData(reportType);

    if (!data || (Array.isArray(data) && data.length === 0) || (reportType === 'organization_profile' && Object.keys(data).length === 0)) {
        return NextResponse.json({ error: 'No data available for this report' }, { status: 404 });
    }

    const wb = XLSX.utils.book_new();
    let ws;

    if (reportType === 'organization_profile' && typeof data === 'object' && !Array.isArray(data)) {
        const flattenedData = [
            { key: 'Slogan', value: data.slogan },
            { key: 'Email', value: data.email },
            { key: 'Visi', value: data.vision },
            { key: 'Misi', value: data.mission },
            ...(data.addresses || []).map((a: any, i: number) => ({ key: `Alamat ${i+1}`, value: a.text })),
            ...(data.phone_numbers || []).map((p: any, i: number) => ({ key: `Telepon ${i+1}`, value: `${p.label}: ${p.number}` })),
            ...(data.social_media_links || []).map((s: any, i: number) => ({ key: `Sosmed ${i+1}`, value: `${s.platform}: ${s.url}` })),
            ...(data.organizational_structure || []).map((m: any, i: number) => ({ key: `Struktur Organisasi ${i+1}`, value: `${m.position}: ${m.name}`})),
            ...(data.partnerships || []).map((p: any, i: number) => ({ key: `Kemitraan ${i+1}`, value: `${p.name} (${p.category})`})),
            ...(data.achievements || []).map((a: any, i: number) => ({ key: `Penghargaan ${i+1}`, value: `${a.title} (${a.year}) - ${a.issuer}`})),
            ...(data.international_events || []).map((e: any, i: number) => ({ key: `Event Internasional ${i+1}`, value: `${e.country} (${e.country_code})`})),
        ];
        ws = XLSX.utils.json_to_sheet(flattenedData, { skipHeader: true });
    } else {
        ws = XLSX.utils.json_to_sheet(data);
    }

    XLSX.utils.book_append_sheet(wb, ws, reportType);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const today = new Date().toISOString().slice(0, 10);
    const filename = `progress_jogja_${reportType}_report_${today}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error(`Error generating report for ${reportType}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    return NextResponse.json({ error: 'Failed to generate report', details: errorMessage }, { status: 500 });
  }
}