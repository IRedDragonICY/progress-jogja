import { NextResponse } from 'next/server';
import { getOrganizationProfile } from '@/lib/supabase';

export async function GET() {
  try {
    const organizationProfile = await getOrganizationProfile();
    
    if (!organizationProfile) {
      return NextResponse.json({ 
        vision: null,
        mission: null,
        achievements: [], 
        international_events: [],
        addresses: []
      });
    }

    return NextResponse.json({
      vision: organizationProfile.vision || null,
      mission: organizationProfile.mission || null,
      achievements: organizationProfile.achievements || [],
      international_events: organizationProfile.international_events || [],
      addresses: organizationProfile.addresses || []
    });
  } catch (error) {
    console.error('Error fetching organization data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization data' },
      { status: 500 }
    );
  }
} 