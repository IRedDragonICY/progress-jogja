import type { User } from "@supabase/supabase-js";

export interface Address {
  id: string;
  label: string;
  recipient_name: string;
  recipient_phone: string;
  full_address: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  courier_notes?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  addresses: Address[];
  role: 'admin' | 'user';
  updated_at: string;
}

export interface UserWithProfile {
  user: User;
  profile: Profile;
}

export interface ProductType {
  id: string;
  name: string;
  created_at?: string;
}

export interface StoreLinkItem {
  name: string;
  url: string;
}

export interface Product {
  id: string;
  user_id?: string;
  name: string;
  product_type_id: string | null;
  description: string | null;
  price: number;
  image_urls: string[];
  store_links: StoreLinkItem[];
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  product_types?: ProductType;
}

export interface ProductDraft {
  id: string;
  product_id: string | null;
  user_id?: string;
  name: string;
  product_type_id: string | null;
  description: string | null;
  price: number;
  image_urls: string[];
  store_links: StoreLinkItem[];
  created_at?: string;
  updated_at?: string;
  product_types?: ProductType;
}

export type ProductFormData = Omit<ProductDraft, 'id' | 'product_id' | 'user_id' | 'created_at' | 'updated_at' | 'product_types'>;

export interface FormStoreLink extends StoreLinkItem {
  id: string;
}

export interface AddressItem {
  id: string;
  text: string;
  latitude: number | null;
  longitude: number | null;
  notes?: string;
}

export interface ContactItem {
  id: string;
  number: string;
  label?: string;
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
}

export interface OrganizationMember {
  id: string;
  position: string;
  name: string;
}

export interface PartnershipItem {
  id:string;
  category: 'education_government' | 'industry';
  name: string;
  logo_url: string | null;
}

export interface OrganizationProfileData {
  id?: string;
  slogan: string | null;
  addresses: AddressItem[];
  phone_numbers: ContactItem[];
  email: string | null;
  social_media_links: SocialMediaLink[];
  vision: string | null;
  mission: string | null;
  organizational_structure: OrganizationMember[];
  partnerships: PartnershipItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products: Product;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: Product;
}