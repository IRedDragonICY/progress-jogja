import { createBrowserClient } from '@supabase/ssr';
import { Product, ProductType, ProductDraft, ProductFormData, StoreLinkItem, OrganizationProfileData, Profile, StorageUsageData, Order, OrderStatus, Review, NewUserPayload } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DEBUG_MODE = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => DEBUG_MODE && console.log('[SupabaseClient]', ...args);
export const ORG_PROFILE_ID_CONST = 'e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f';

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Supabase signOut error:", error);
        throw error;
    }
    window.location.href = '/';
};

export const getUserWithProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (error) {
    console.error("Error fetching profile:", error);
    return { user, profile: null };
  }

  return { user, profile };
};

const convertImageToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      if (!event.target?.result) {
        return reject(new Error("Couldn't read file for conversion."));
      }
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 1024;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round(height * (MAX_DIMENSION / width));
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round(width * (MAX_DIMENSION / height));
            height = MAX_DIMENSION;
          }
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Canvas to Blob conversion failed'));
          }
          const webpFile = new File([blob], 'avatar.webp', { type: 'image/webp' });
          resolve(webpFile);
        }, 'image/webp', 0.85);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<Profile, 'id'>>
) => {
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    throw updateError;
  }

  const { data: refetchedProfile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (selectError) {
    console.error('Error re-fetching profile after update:', selectError);
    throw selectError;
  }

  return refetchedProfile;
};

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const webpFile = await convertImageToWebP(file);
  const filePath = `avatars/${userId}`;

  const { error: uploadError } = await supabase.storage
    .from('progress-jogja-bucket')
    .upload(filePath, webpFile, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('progress-jogja-bucket')
    .getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error('Could not get public URL for avatar.');
  }

  return `${data.publicUrl}?t=${new Date().getTime()}`;
};


const CACHE_DURATION_LONG = 2 * 60 * 1000;
const CACHE_DURATION_SHORT = 10 * 60 * 1000;
const CACHE_KEYS = {
  PRODUCT_TYPES: 'cache_product_types',
  PRODUCTS: 'cache_products_all',
  USER_DRAFTS: 'cache_user_drafts',
  ORGANIZATION_PROFILE: `cache_org_profile_${ORG_PROFILE_ID_CONST}`,
  STORAGE_USAGE: 'cache_storage_usage',
  ALL_USERS_PROFILES: 'cache_all_users_profiles',
} as const;

interface CachedData<T> { data: T; timestamp: number; }

class CacheManager {
  private static isClient = typeof window !== 'undefined';
  static get<T>(key: string): T | null { if (!this.isClient) return null; try { const i = localStorage.getItem(key); if (!i) return null; const p = JSON.parse(i) as CachedData<T>; return this.isValid(key, p.timestamp) ? p.data : null; } catch { return null; }}
  static set<T>(key: string, data: T): void { if (!this.isClient) return; try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); } catch (e) { console.warn('Cache set error:', key, e); }}
  static invalidate(...keys: string[]): void { if (!this.isClient) return; keys.forEach(key => localStorage.removeItem(key));}
  static invalidateAll(): void { this.invalidate(...Object.values(CACHE_KEYS));}
  private static isValid(key: string, timestamp: number): boolean {
      const duration = key === CACHE_KEYS.STORAGE_USAGE ? CACHE_DURATION_SHORT : CACHE_DURATION_LONG;
      return Date.now() - timestamp < duration;
  }
}

interface ProductDraftPayload extends Partial<ProductFormData> { user_id: string; product_id?: string | null; }
interface ProductPayload { name: string | undefined; description: string | undefined; price: number; image_urls: string[]; store_links: StoreLinkItem[]; product_type_id: string | null | undefined; is_published: boolean; user_id: string; }
interface ProductUpdatePayload { name?: string; description?: string; price?: number; image_urls?: string[]; store_links?: StoreLinkItem[]; product_type_id?: string | null; is_published?: boolean; user_id?: string; }
const fetchWithRetry = async <T>(fn: () => Promise<T>, retries = 1, delay = 700): Promise<T> => { try { return await fn(); } catch (error) { if (retries <= 0) throw error; await new Promise(resolve => setTimeout(resolve, delay)); return fetchWithRetry(fn, retries - 1, delay * 2);}};
const cleanStoreLinksForDb = (links?: Partial<StoreLinkItem>[]): StoreLinkItem[] => links?.map(({ name = '', url = '' }) => ({ name, url })).filter(({ name, url }) => name && url) ?? [];
const prepareDraftData = (data: Partial<ProductFormData>): Partial<ProductFormData> => ({ name: data.name || undefined, description: data.description || undefined, price: data.price, image_urls: Array.isArray(data.image_urls) ? data.image_urls : undefined, store_links: cleanStoreLinksForDb(data.store_links), product_type_id: data.product_type_id || null });
export const getProductTypes = async (force = false): Promise<ProductType[]> => { if (!force) { const c = CacheManager.get<ProductType[]>(CACHE_KEYS.PRODUCT_TYPES); if (c) return c; } return fetchWithRetry(async () => { const { data, error } = await supabase.from('product_types').select('*').order('name'); if (error) throw error; const r = data || []; CacheManager.set(CACHE_KEYS.PRODUCT_TYPES, r); return r;});};
export const createProductType = async (name: string): Promise<ProductType> => { const r = await fetchWithRetry(async () => { const { data, error } = await supabase.from('product_types').insert({ name }).select().single(); if (error) throw error; return data; }); CacheManager.invalidate(CACHE_KEYS.PRODUCT_TYPES); return r;};
export const updateProductType = async (id: string, name: string): Promise<ProductType> => { const r = await fetchWithRetry(async () => { const { data, error } = await supabase.from('product_types').update({ name }).eq('id', id).select().single(); if (error) throw error; return data; }); CacheManager.invalidate(CACHE_KEYS.PRODUCT_TYPES, CACHE_KEYS.PRODUCTS, CACHE_KEYS.USER_DRAFTS); return r;};
export const deleteProductType = async (id: string): Promise<void> => { await fetchWithRetry(async () => { const { error } = await supabase.from('product_types').delete().eq('id', id); if (error) throw error; }); CacheManager.invalidateAll();};
export const getProducts = async (force = false): Promise<Product[]> => { if (!force) { const c = CacheManager.get<Product[]>(CACHE_KEYS.PRODUCTS); if (c) return c; } return fetchWithRetry(async () => { const { data, error } = await supabase.from('products').select('*, product_types(id, name)').order('created_at', { ascending: false }); if (error) throw error; const r = data || []; CacheManager.set(CACHE_KEYS.PRODUCTS, r); return r;});};
const deleteImagesFromStorage = async (imageUrls: string[]): Promise<void> => { if (!imageUrls.length) return; const f = imageUrls.map(url => { try { const u = new URL(url).pathname; const p = u.split('/progress-jogja-bucket/'); return p.length > 1 ? p[1] : null; } catch (e) { console.warn("URL parse error:", url, e); return null; }}).filter((p): p is string => p !== null); if (f.length === 0) return; debugLog('Deleting images:', f); const { error } = await supabase.storage.from('progress-jogja-bucket').remove(f); if (error) { console.error('Storage deletion error:', error); }};
export const deleteMasterProductAndDrafts = async (productId: string): Promise<void> => { const { data: p, error: f } = await supabase.from('products').select('image_urls').eq('id', productId).single(); if (f && f.code !== 'PGRST116') throw f; if (p?.image_urls?.length) { await deleteImagesFromStorage(p.image_urls); } await fetchWithRetry(async () => { const { error } = await supabase.from('products').delete().eq('id', productId); if (error) throw error; }); CacheManager.invalidate(CACHE_KEYS.PRODUCTS, CACHE_KEYS.USER_DRAFTS);};
export const toggleProductPublishStatus = async (productId: string, publish: boolean): Promise<Product> => { const r = await fetchWithRetry(async () => { const { data, error } = await supabase.from('products').update({ is_published: publish }).eq('id', productId).select('*, product_types(id, name)').single(); if (error) throw error; return data; }); CacheManager.invalidate(CACHE_KEYS.PRODUCTS); return r;};
export const getUserDrafts = async (userId: string, force = false): Promise<ProductDraft[]> => { if (!force) { const c = CacheManager.get<ProductDraft[]>(CACHE_KEYS.USER_DRAFTS); if (c) return c; } return fetchWithRetry(async () => { const { data, error } = await supabase.from('product_drafts').select('*, product_types(id, name)').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw error; const r = data || []; CacheManager.set(CACHE_KEYS.USER_DRAFTS, r); return r;});};
export const createOrUpdateDraft = async (userId: string, draftData: Partial<ProductFormData>, existingDraftId?: string, associatedProductId?: string | null): Promise<ProductDraft> => { const p: ProductDraftPayload = { ...prepareDraftData(draftData), user_id: userId }; const r = await (existingDraftId ? updateExistingDraft(existingDraftId, p) : createNewDraft({ ...p, product_id: associatedProductId || null })); CacheManager.invalidate(CACHE_KEYS.USER_DRAFTS); return r;};
const updateExistingDraft = async (draftId: string, payload: ProductDraftPayload): Promise<ProductDraft> => { debugLog('Updating draft:', draftId, 'payload:', payload); const { data, error } = await supabase.from('product_drafts').update(payload).eq('id', draftId).select('*, product_types(id, name)').single(); if (error) throw error; return data;};
const createNewDraft = async (payload: ProductDraftPayload): Promise<ProductDraft> => { debugLog('Creating new draft:', payload); const { data, error } = await supabase.from('product_drafts').insert(payload).select('*, product_types(id, name)').single(); if (error) throw error; return data;};
export const deleteDraft = async (draftId: string): Promise<void> => { await fetchWithRetry(async () => { const { error } = await supabase.from('product_drafts').delete().eq('id', draftId); if (error) throw error; }); CacheManager.invalidate(CACHE_KEYS.USER_DRAFTS);};
export const deleteAllUserDrafts = async (userId: string): Promise<void> => { await fetchWithRetry(async () => { const { error } = await supabase.from('product_drafts').delete().eq('user_id', userId); if (error) throw error; }); CacheManager.invalidate(CACHE_KEYS.USER_DRAFTS);};
export const publishDraft = async (draftId: string, userId: string): Promise<Product> => { const d = await fetchWithRetry(async () => { const { data, error } = await supabase.from('product_drafts').select('*').eq('id', draftId).single(); if (error) throw error; return data; }); if (!d) throw new Error('Draft not found.'); if (d.user_id !== userId) throw new Error('Unauthorized.'); const p: ProductPayload = { name: d.name, description: d.description, price: d.price ?? 0, image_urls: d.image_urls || [], store_links: d.store_links || [], product_type_id: d.product_type_id, is_published: true, user_id: userId }; const r = await (d.product_id ? updateExistingProduct(d.product_id, p) : createNewProduct(p)); await deleteDraft(d.id); CacheManager.invalidate(CACHE_KEYS.PRODUCTS); return r;};
const updateExistingProduct = async (productId: string, payload: ProductUpdatePayload): Promise<Product> => { const { data, error } = await supabase.from('products').update(payload).eq('id', productId).select('*, product_types(id, name)').single(); if (error) throw error; return data;};
const createNewProduct = async (payload: ProductPayload): Promise<Product> => { const { data, error } = await supabase.from('products').insert(payload).select('*, product_types(id, name)').single(); if (error) throw error; return data;};
const uploadFileToStorage = async (file: File, folder: string): Promise<string> => { const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) throw new Error('Not authenticated.'); const f = `${uuidv4()}.${file.name.split('.').pop()}`; const p = `${folder}/${f}`; const { error } = await supabase.storage.from('progress-jogja-bucket').upload(p, file, { cacheControl: '3600', upsert: false }); if (error) throw error; const { data: u } = supabase.storage.from('progress-jogja-bucket').getPublicUrl(p); if (!u?.publicUrl) throw new Error('Could not get public URL.'); return u.publicUrl;};
export const uploadProductImage = (file: File): Promise<string> => uploadFileToStorage(file, 'product_images');
export const uploadPartnerLogo = (file: File): Promise<string> => uploadFileToStorage(file, 'partner_logos');
export const getOrganizationProfile = async (force = false): Promise<OrganizationProfileData | null> => { const k = CACHE_KEYS.ORGANIZATION_PROFILE; if (!force) { const c = CacheManager.get<OrganizationProfileData>(k); if (c) return c; } return fetchWithRetry(async () => { const { data, error } = await supabase.from('organization_profile').select('*').eq('id', ORG_PROFILE_ID_CONST).maybeSingle(); if (error) { console.error('Profile fetch error:', error); throw error; } const r = data ? data as OrganizationProfileData : null; if (r) { CacheManager.set(k, r); } return r;});};
export const upsertOrganizationProfile = async (profileData: Partial<OrganizationProfileData>): Promise<OrganizationProfileData> => { const d = { ...profileData, id: ORG_PROFILE_ID_CONST, addresses: profileData.addresses || [], phone_numbers: profileData.phone_numbers || [], social_media_links: profileData.social_media_links || [], organizational_structure: profileData.organizational_structure || [], partnerships: profileData.partnerships || []}; const r = await fetchWithRetry(async () => { const { data, error } = await supabase.from('organization_profile').upsert(d, { onConflict: 'id', ignoreDuplicates: false }).select().single(); if (error) { console.error('Profile upsert error:', error); throw error; } return data as OrganizationProfileData; }); CacheManager.invalidate(CACHE_KEYS.ORGANIZATION_PROFILE); return r;};
export const getStorageUsage = async (force = false): Promise<StorageUsageData | null> => { if (!force) { const c = CacheManager.get<StorageUsageData>(CACHE_KEYS.STORAGE_USAGE); if (c) return c; } try { const { data: rawData, error } = await supabase.rpc('get_project_usage'); if (error) throw error; const total_project_limit_bytes = 5 * 1024 * 1024 * 1024; const total_used_bytes = rawData.total_used_bytes || 0; const result: StorageUsageData = { database_size_bytes: rawData.database_size_bytes || 0, storage_size_bytes: rawData.storage_size_bytes || 0, total_used_bytes: total_used_bytes, total_project_limit_bytes: total_project_limit_bytes, available_size_bytes: total_project_limit_bytes - total_used_bytes, used_percentage: total_project_limit_bytes > 0 ? (total_used_bytes / total_project_limit_bytes) * 100 : 0, }; CacheManager.set(CACHE_KEYS.STORAGE_USAGE, result); return result; } catch (err) { console.error("Error fetching storage usage via RPC:", err); return null; } };
export const getProductImageUrl = (filename: string): string => { if (filename.startsWith('http://') || filename.startsWith('https://')) { return filename; } if (filename.startsWith('/')) { return filename; } const { data } = supabase.storage.from('progress-jogja-bucket').getPublicUrl(`produk/${filename}`); return data.publicUrl; };
export const getAllUsersWithProfiles = async (force = false): Promise<Profile[]> => { if (!force) { const c = CacheManager.get<Profile[]>(CACHE_KEYS.ALL_USERS_PROFILES); if (c) return c; } return fetchWithRetry(async () => { const { data, error } = await supabase.rpc('get_all_users_with_email'); if (error) { console.error("Error fetching all user profiles via RPC:", error); throw error; } const r = (data as Profile[]) || []; CacheManager.set(CACHE_KEYS.ALL_USERS_PROFILES, r); return r; }); };

export const adminUpdateFullUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
    const { data, error } = await supabase.rpc('admin_update_user', {
        p_user_id: userId,
        p_updates: updates
    });

    if (error || !data || (data.length > 0 && data[0].j?.error)) {
        const errorMessage = error?.message || (data && data[0].j?.error) || 'Failed to update user profile via RPC.';
        console.error(`Error during admin profile update for user ${userId}:`, errorMessage);
        throw new Error(errorMessage);
    }

    CacheManager.invalidate(CACHE_KEYS.ALL_USERS_PROFILES);
    return data[0].j as Profile;
};

export const adminDeleteUserProfile = async (userId: string): Promise<void> => {
    const { data, error } = await supabase.rpc('admin_delete_user', {
        p_user_id: userId
    });

    if (error || !data || !data.success) {
        const errorMessage = error?.message || data?.error || 'Failed to delete user via RPC.';
        console.error(`Error deleting profile for user ${userId}:`, errorMessage);
        throw new Error(errorMessage);
    }

    CacheManager.invalidate(CACHE_KEYS.ALL_USERS_PROFILES);
};

export const adminCreateUser = async (payload: NewUserPayload): Promise<Profile> => {
    const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to create user via API.');
    }

    CacheManager.invalidate(CACHE_KEYS.ALL_USERS_PROFILES);
    return result as Profile;
};

export const getOrders = async (userId?: string): Promise<Order[]> => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (userId) {
        query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
    return data || [];
};

export const getCurrentMonthRevenue = async (): Promise<number> => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['paid', 'completed'])
        .gte('created_at', firstDayOfMonth)
        .lt('created_at', nextMonth.toISOString());

    if (error) {
        console.error("Error fetching current month revenue:", error);
        throw error;
    }

    const totalRevenue = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    return totalRevenue;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus, provider?: string, trackingNumber?: string): Promise<Order> => {
    const { data, error } = await supabase
        .from('orders')
        .update({ status, shipping_provider: provider, shipping_tracking_number: trackingNumber, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
};

export const createReview = async (reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
    const { data, error } = await supabase.from('reviews').insert(reviewData).select().single();
    if (error) throw error;
    return data;
};

export const getMonthlyRevenueSummary = async (numMonths: number = 6): Promise<{ month_start: string; total_revenue: number }[]> => {
    const { data, error } = await supabase.rpc('get_monthly_revenue_summary', { num_months: numMonths });
    if (error) {
        console.error("Error fetching monthly revenue summary:", error);
        throw error;
    }
    return data;
};

export const getFullExportData = async (reportType: 'financial' | 'users' | 'products' | 'organization_profile'): Promise<any> => {
    const { data, error } = await supabase.rpc('get_full_export_data', { report_type: reportType });
    if (error) {
        console.error(`Error fetching export data for ${reportType}:`, error);
        throw error;
    }
    return data;
};


export type { ProductFormData };