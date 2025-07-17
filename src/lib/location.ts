import { LatLngTuple } from 'leaflet';

interface NominatimAddress {
  road?: string;
  house_number?: string;
  village?: string;
  hamlet?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export const fetchAddressFromCoords = async (lat: number, lng: number): Promise<{ full_address: string; postal_code: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id-ID,id;q=0.9',
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch address from Nominatim');

    const data = await response.json();
    const address: NominatimAddress = data.address || {};

    const addressParts = [
      address.road,
      address.house_number,
      address.village || address.hamlet,
      address.suburb,
      address.city_district,
      address.city || address.county,
      address.state,
      address.country
    ].filter(Boolean);

    const full_address = [...new Set(addressParts)].join(', ');

    return {
      full_address: full_address || 'Alamat tidak ditemukan',
      postal_code: address.postcode || '',
    };
  } catch (error) {
    console.error("Error fetching address from coords:", error);
    return {
      full_address: 'Gagal mengambil alamat otomatis. Mohon isi manual.',
      postal_code: '',
    };
  }
};