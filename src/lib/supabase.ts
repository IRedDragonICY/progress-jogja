import { createClient } from '@supabase/supabase-js';
import { Product, ProductType, ProductDraft, ProductFormData, StoreLinkItem, OrganizationProfileData } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEBUG_MODE = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => DEBUG_MODE && console.log('[SupabaseClient]', ...args);
export const ORG_PROFILE_ID_CONST = 'e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f';

export const signOut = async (): Promise<void> => {
  const [{ error: supabaseSignOutError }] = await Promise.all([
    supabase.auth.signOut(),
    typeof document !== 'undefined'
      ? Promise.resolve(document.cookie = 'supabase-auth-token=; path=/; max-age=0; SameSite=Strict; Secure;')
      : Promise.resolve()
  ]);

  if (supabaseSignOutError) {
    console.error("Supabase signOut error:", supabaseSignOutError);
    throw supabaseSignOutError;
  }
};
const CACHE_DURATION = 2 * 60 * 1000;
const CACHE_KEYS = {
  PRODUCT_TYPES: 'cache_product_types',
  PRODUCTS: 'cache_products_all',
  USER_DRAFTS: 'cache_user_drafts',
  ORGANIZATION_PROFILE: `cache_org_profile_${ORG_PROFILE_ID_CONST}`,
} as const;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private static isClient = typeof window !== 'undefined';

  static get<T>(key: string): T | null {
    if (!this.isClient) return null;
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      const parsed = JSON.parse(cached) as CachedData<T>;
      return this.isValid(parsed.timestamp) ? parsed.data : null;
    } catch { return null; }
  }

  static set<T>(key: string, data: T): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() } satisfies CachedData<T>));
    } catch (e) { console.warn('Cache set error:', key, e); }
  }

  static invalidate(...keys: string[]): void {
    if (!this.isClient) return;
    keys.forEach(key => localStorage.removeItem(key));
  }

  static invalidateAll(): void { this.invalidate(...Object.values(CACHE_KEYS)); }
  private static isValid(timestamp: number): boolean { return Date.now() - timestamp < CACHE_DURATION; }
}

interface ProductDraftPayload extends Partial<ProductFormData> { user_id: string; product_id?: string | null; }
interface ProductPayload { name: string | undefined; description: string | undefined; image_urls: string[]; store_links: StoreLinkItem[]; product_type_id: string | null | undefined; is_published: boolean; user_id: string; }
interface ProductUpdatePayload { name?: string; description?: string; image_urls?: string[]; store_links?: StoreLinkItem[]; product_type_id?: string | null; is_published?: boolean; user_id?: string; }

const fetchWithRetry = async <T>(fn: () => Promise<T>, retries = 1, delay = 700): Promise<T> => {
  try { return await fn(); } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
};

const cleanStoreLinksForDb = (links?: Partial<StoreLinkItem>[]): StoreLinkItem[] => links?.map(({ name = '', url = '' }) => ({ name, url })).filter(({ name, url }) => name && url) ?? [];
const prepareDraftData = (data: Partial<ProductFormData>): Partial<ProductFormData> => ({ name: data.name || undefined, description: data.description || undefined, image_urls: Array.isArray(data.image_urls) ? data.image_urls : undefined, store_links: cleanStoreLinksForDb(data.store_links), product_type_id: data.product_type_id || null });

export const getProductTypes = async (force = false): Promise<ProductType[]> => {
  if (!force) { const cached = CacheManager.get<ProductType[]>(CACHE_KEYS.PRODUCT_TYPES); if (cached) return cached; }
  return fetchWithRetry(async () => {
    const { data, error } = await supabase.from('product_types').select('*').order('name');
    if (error) throw error;
    const result = data || [];
    CacheManager.set(CACHE_KEYS.PRODUCT_TYPES, result);
    return result;
  });
};

export const createProductType = async (name: string): Promise<ProductType> => {
  const result = await fetchWithRetry(async () => {
    const { data, error } = await supabase.from('product_types').insert({ name }).select().single();
    if (error) throw error; return data;
  });
  CacheManager.invalidate(CACHE_KEYS.PRODUCT_TYPES); return result;
};

export const updateProductType = async (id: string, name: string): Promise<ProductType> => {
  const result = await fetchWithRetry(async () => {
    const { data, error } = await supabase.from('product_types').update({ name }).eq('id', id).select().single();
    if (error) throw error; return data;
  });
  CacheManager.invalidate(CACHE_KEYS.PRODUCT_TYPES, CACHE_KEYS.PRODUCTS, CACHE_KEYS.USER_DRAFTS); return result;
};

export const deleteProductType = async (id: string): Promise<void> => {
  await fetchWithRetry(async () => {
    const { error } = await supabase.from('product_types').delete().eq('id', id);
    if (error) throw error;
  });
  CacheManager.invalidateAll();
};

export const getProducts = async (force = false): Promise<Product[]> => {
  if (!force) { const cached = CacheManager.get<Product[]>(CACHE_KEYS.PRODUCTS); if (cached) return cached; }
  return fetchWithRetry(async () => {
    const { data, error } = await supabase.from('products').select('*, product_types(id, name)').order('created_at', { ascending: false });
    if (error) throw error;
    const result = data || [];
    CacheManager.set(CACHE_KEYS.PRODUCTS, result);
    return result;
  });
};

const deleteImagesFromStorage = async (imageUrls: string[]): Promise<void> => {
  if (!imageUrls.length) return;
  const filePaths = imageUrls.map(url => { try { const urlPath = new URL(url).pathname; const parts = urlPath.split('/progress-jogja-bucket/'); return parts.length > 1 ? parts[1] : null; } catch (e) { console.warn("Could not parse URL for deletion:", url, e); return null; }}).filter((path): path is string => path !== null);
  if (filePaths.length === 0) return;
  debugLog('Attempting to delete images from storage:', filePaths);
  const { error } = await supabase.storage.from('progress-jogja-bucket').remove(filePaths);
  if (error) { console.error('Error deleting images from storage:', error); }
};

export const deleteMasterProductAndDrafts = async (productId: string): Promise<void> => {
  const { data: product, error: fetchError } = await supabase.from('products').select('image_urls').eq('id', productId).single();
  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  if (product?.image_urls?.length) { await deleteImagesFromStorage(product.image_urls); }
  await fetchWithRetry(async () => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  });
  CacheManager.invalidate(CACHE_KEYS.PRODUCTS, CACHE_KEYS.USER_DRAFTS);
};

export const toggleProductPublishStatus = async (productId: string, publish: boolean): Promise<Product> => {
  const result = await fetchWithRetry(async () => {
    const { data, error } = await supabase.from('products').update({ is_published: publish }).eq('id', productId).select('*, product_types(id, name)').single();
    if (error) throw error; return data;
  });
  CacheManager.invalidate(CACHE_KEYS.PRODUCTS); return result;
};

export const getUserDrafts = async (userId: string, force = false): Promise<ProductDraft[]> => {
  if (!force) { const cached = CacheManager.get<ProductDraft[]>(CACHE_KEYS.USER_DRAFTS); if (cached) return cached; }
  return fetchWithRetry(async () => {
    const { data, error } = await supabase.from('product_drafts').select('*, product_types(id, name)').eq('user_id', userId).order('updated_at', { ascending: false });
    if (error) throw error;
    const result = data || [];
    CacheManager.set(CACHE_KEYS.USER_DRAFTS, result);
    return result;
  });
};

export const createOrUpdateDraft = async (userId: string, draftData: Partial<ProductFormData>, existingDraftId?: string, associatedProductId?: string | null): Promise<ProductDraft> => {
  const payload: ProductDraftPayload = { ...prepareDraftData(draftData), user_id: userId };
  const result = await (existingDraftId ? updateExistingDraft(existingDraftId, payload) : createNewDraft({ ...payload, product_id: associatedProductId || null }));
  CacheManager.invalidate(CACHE_KEYS.USER_DRAFTS); return result;
};

const updateExistingDraft = async (draftId: string, payload: ProductDraftPayload): Promise<ProductDraft> => {
  debugLog('Updating draft:', draftId, 'with payload:', payload);
  const { data, error } = await supabase.from('product_drafts').update(payload).eq('id', draftId).select('*, product_types(id, name)').single();
  if (error) throw error; return data;
};

const createNewDraft = async (payload: ProductDraftPayload): Promise<ProductDraft> => {
  debugLog('Creating new draft with payload:', payload);
  const { data, error } = await supabase.from('product_drafts').insert(payload).select('*, product_types(id, name)').single();
  if (error) throw error; return data;
};

export const deleteDraft = async (draftId: string): Promise<void> => {
  await fetchWithRetry(async () => {
    const { error } = await supabase.from('product_drafts').delete().eq('id', draftId);
    if (error) throw error;
  });
  CacheManager.invalidate(CACHE_KEYS.USER_DRAFTS);
};

export const deleteAllUserDrafts = async (userId: string): Promise<void> => {
  await fetchWithRetry(async () => {
    const { error } = await supabase.from('product_drafts').delete().eq('user_id', userId);
    if (error) throw error;
  });
  CacheManager.invalidate(CACHE_KEYS.USER_DRAFTS);
};

export const publishDraft = async (draftId: string, userId: string): Promise<Product> => {
  const draft = await fetchWithRetry(async () => {
    const { data, error } = await supabase.from('product_drafts').select('*').eq('id', draftId).single();
    if (error) throw error; return data;
  });
  if (!draft) throw new Error('Draft not found for publishing.');
  if (draft.user_id !== userId) throw new Error('User not authorized to publish this draft.');
  const productPayload: ProductPayload = { name: draft.name, description: draft.description, image_urls: draft.image_urls || [], store_links: draft.store_links || [], product_type_id: draft.product_type_id, is_published: true, user_id: userId };
  const publishedProduct = await (draft.product_id ? updateExistingProduct(draft.product_id, productPayload) : createNewProduct(productPayload));
  await deleteDraft(draftId);
  CacheManager.invalidate(CACHE_KEYS.PRODUCTS); return publishedProduct;
};

const updateExistingProduct = async (productId: string, payload: ProductUpdatePayload): Promise<Product> => {
  const { data, error } = await supabase.from('products').update(payload).eq('id', productId).select('*, product_types(id, name)').single();
  if (error) throw error; return data;
};

const createNewProduct = async (payload: ProductPayload): Promise<Product> => {
  const { data, error } = await supabase.from('products').insert(payload).select('*, product_types(id, name)').single();
  if (error) throw error; return data;
};

const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated.');
    const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from('progress-jogja-bucket').upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('progress-jogja-bucket').getPublicUrl(filePath);
    if (!urlData?.publicUrl) throw new Error('Could not get public URL.');
    return urlData.publicUrl;
};

export const uploadProductImage = (file: File): Promise<string> => uploadFileToStorage(file, 'product_images');
export const uploadPartnerLogo = (file: File): Promise<string> => uploadFileToStorage(file, 'partner_logos');


export const getOrganizationProfile = async (force = false): Promise<OrganizationProfileData | null> => {
  const cacheKey = CACHE_KEYS.ORGANIZATION_PROFILE;
  if (!force) {
    const cached = CacheManager.get<OrganizationProfileData>(cacheKey);
    if (cached) return cached;
  }
  return fetchWithRetry(async () => {
    const { data, error } = await supabase
      .from('organization_profile')
      .select('*')
      .eq('id', ORG_PROFILE_ID_CONST)
      .maybeSingle();

    if (error) {
      console.error('Error fetching organization profile:', error);
      throw error;
    }

    const result = data ? data as OrganizationProfileData : null;
    if (result) {
        CacheManager.set(cacheKey, result);
    }
    return result;
  });
};

export const upsertOrganizationProfile = async (profileData: Partial<OrganizationProfileData>): Promise<OrganizationProfileData> => {
  const dataToUpsert = {
    ...profileData,
    id: ORG_PROFILE_ID_CONST,
    updated_at: new Date().toISOString(),
  };

  dataToUpsert.addresses = dataToUpsert.addresses || [];
  dataToUpsert.phone_numbers = dataToUpsert.phone_numbers || [];
  dataToUpsert.social_media_links = dataToUpsert.social_media_links || [];
  dataToUpsert.organizational_structure = dataToUpsert.organizational_structure || [];
  dataToUpsert.partnerships = dataToUpsert.partnerships || [];


  const result = await fetchWithRetry(async () => {
    const { data, error } = await supabase
      .from('organization_profile')
      .upsert(dataToUpsert, { onConflict: 'id', ignoreDuplicates: false })
      .select()
      .single();

    if (error) {
      console.error('Error upserting organization profile:', error);
      throw error;
    }
    return data as OrganizationProfileData;
  });
  CacheManager.invalidate(CACHE_KEYS.ORGANIZATION_PROFILE);
  return result;
};

export type { ProductFormData };