CREATE SCHEMA IF NOT EXISTS public;

GRANT USAGE ON SCHEMA public TO public, anon, authenticated;
GRANT ALL ON SCHEMA public TO postgres, supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO public, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO public, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO public, anon, authenticated;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.product_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now() NOT NULL
);

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

GRANT ALL ON TABLE public.product_types TO public, anon, authenticated;
GRANT ALL ON TABLE public.products TO public, anon, authenticated;
GRANT ALL ON TABLE public.product_drafts TO public, anon, authenticated;
GRANT ALL ON TABLE public.organization_profile TO public, anon, authenticated;

CREATE TRIGGER on_products_update BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_product_drafts_update BEFORE UPDATE ON public.product_drafts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_organization_profile_update BEFORE UPDATE ON public.organization_profile FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to product types" ON public.product_types;
CREATE POLICY "Allow public read access to product types" ON public.product_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to manage product types" ON public.product_types;
CREATE POLICY "Allow authenticated users to manage product types" ON public.product_types FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read access to published products" ON public.products;
CREATE POLICY "Allow public read access to published products" ON public.products FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON public.products;
CREATE POLICY "Allow authenticated users to manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to manage their own drafts" ON public.product_drafts;
CREATE POLICY "Allow users to manage their own drafts" ON public.product_drafts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read access to organization profile" ON public.organization_profile;
CREATE POLICY "Allow public read access to organization profile" ON public.organization_profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to update organization profile" ON public.organization_profile;
CREATE POLICY "Allow authenticated users to update organization profile" ON public.organization_profile FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('progress-jogja-bucket', 'progress-jogja-bucket', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']) ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

DROP POLICY IF EXISTS "Allow public read access to media" ON storage.objects;
CREATE POLICY "Allow public read access to media" ON storage.objects FOR SELECT USING (bucket_id = 'progress-jogja-bucket');
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'progress-jogja-bucket' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated users to update their media" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their media" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated users to delete their media" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their media" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

INSERT INTO public.organization_profile (id) VALUES ('e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f') ON CONFLICT (id) DO NOTHING;