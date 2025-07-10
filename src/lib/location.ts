import { LatLngTuple } from 'leaflet';

interface NominatimAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export const fetchAddressFromCoords = async (lat: number, lng: number): Promise<{ full_address: string; postal_code: string }> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    if (!response.ok) throw new Error('Failed to fetch address');

    const data = await response.json();
    const address: NominatimAddress = data.address || {};

    const street = `${address.road || ''} ${address.house_number || ''}`.trim();
    const cityInfo = `${address.suburb || ''}, ${address.city || address.county || ''}`.trim().replace(/^,|,$/g, '').trim();
    const stateInfo = `${address.state || ''} ${address.postcode || ''}`.trim();

    const full_address = [street, cityInfo, stateInfo, address.country]
      .filter(Boolean)
      .join(', ');

    return {
      full_address: data.display_name || full_address || 'Alamat tidak ditemukan',
      postal_code: address.postcode || '',
    };
  } catch (error) {
    console.error("Error fetching address from coords:", error);
    return {
      full_address: 'Gagal mengambil alamat otomatis',
      postal_code: '',
    };
  }
};