-- Hapus skema lama untuk memulai dari awal
DROP SCHEMA public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;

-- Atur izin dasar pada skema
GRANT USAGE ON SCHEMA public TO public, anon, authenticated;
GRANT ALL ON SCHEMA public TO postgres, supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO public, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO public, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO public, anon, authenticated;

-- Aktifkan ekstensi yang diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fungsi untuk menangani kolom updated_at secara otomatis
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


------------------------------------------------
-- Definisi Tabel Utama
------------------------------------------------

-- Tabel untuk tipe/kategori produk
CREATE TABLE public.product_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Tabel untuk produk yang sudah dipublikasikan
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    name text NOT NULL,
    product_type_id uuid REFERENCES public.product_types(id) ON DELETE SET NULL,
    description text,
    image_urls jsonb DEFAULT '[]'::jsonb NOT NULL,
    store_links jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabel untuk draf produk
CREATE TABLE public.product_drafts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    product_type_id uuid REFERENCES public.product_types(id) ON DELETE SET NULL,
    description text,
    image_urls jsonb DEFAULT '[]'::jsonb NOT NULL,
    store_links jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabel untuk profil organisasi (singleton)
CREATE TABLE public.organization_profile (
    id uuid PRIMARY KEY DEFAULT 'e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f',
    slogan text,
    email text,
    vision text,
    mission text,
    addresses jsonb DEFAULT '[]'::jsonb NOT NULL,
    phone_numbers jsonb DEFAULT '[]'::jsonb NOT NULL,
    social_media_links jsonb DEFAULT '[]'::jsonb NOT NULL,
    organizational_structure jsonb DEFAULT '[]'::jsonb NOT NULL,
    partnerships jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabel untuk profil pengguna
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  addresses jsonb DEFAULT '[]'::jsonb NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


------------------------------------------------
-- Trigger untuk updated_at
------------------------------------------------

CREATE TRIGGER on_products_update BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_product_drafts_update BEFORE UPDATE ON public.product_drafts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_organization_profile_update BEFORE UPDATE ON public.organization_profile FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_profiles_update BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


------------------------------------------------
-- Otomatisasi Profil dan Sinkronisasi Role
------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_role_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET
    raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.role)
  WHERE
    id = new.id;
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE TRIGGER on_profile_change_update_user_role
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_role_from_profile();


------------------------------------------------
-- Row Level Security (RLS) Policies
------------------------------------------------

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.jwt() ->> 'role' = 'admin';
$$ LANGUAGE sql STABLE;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Product types are viewable by everyone" ON public.product_types FOR SELECT USING (true);
CREATE POLICY "Admins have full access to product types" ON public.product_types FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Published products are viewable by everyone" ON public.products FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins have full access to products" ON public.products FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Users can manage their own drafts" ON public.product_drafts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all drafts" ON public.product_drafts FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Organization profile is viewable by everyone" ON public.organization_profile FOR SELECT USING (true);
CREATE POLICY "Admins have full access to organization profile" ON public.organization_profile FOR ALL USING (is_admin()) WITH CHECK (is_admin());


------------------------------------------------
-- Storage Bucket dan Policies (DENGAN PERBAIKAN)
------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('progress-jogja-bucket', 'progress-jogja-bucket', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ## PERBAIKAN: Hapus kebijakan lama terlebih dahulu untuk membuat skrip menjadi idempotent ##
DROP POLICY IF EXISTS "Allow public read access to storage" ON storage.objects;
CREATE POLICY "Allow public read access to storage" ON storage.objects FOR SELECT USING (bucket_id = 'progress-jogja-bucket');

DROP POLICY IF EXISTS "Allow authenticated users to upload to storage" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload to storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'progress-jogja-bucket' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update storage" ON storage.objects;
CREATE POLICY "Allow authenticated users to update storage" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete from storage" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete from storage" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');


------------------------------------------------
-- Data Awal
------------------------------------------------

INSERT INTO public.organization_profile (id) VALUES ('e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f') ON CONFLICT (id) DO NOTHING;