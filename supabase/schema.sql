DROP SCHEMA IF EXISTS public CASCADE;
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

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'paid',
    'processing',
    'shipped',
    'completed',
    'cancelled',
    'failed'
);

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
    price decimal(10,2) DEFAULT 0 NOT NULL,
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
    price decimal(10,2) DEFAULT 0 NOT NULL,
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
    achievements jsonb DEFAULT '[]'::jsonb NOT NULL,
    international_events jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  addresses jsonb DEFAULT '[]'::jsonb NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.cart_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT cart_items_user_product_key UNIQUE (user_id, product_id)
);

CREATE TABLE public.wishlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT wishlists_user_product_key UNIQUE (user_id, product_id)
);

CREATE TABLE public.orders (
    id uuid PRIMARY KEY,
    display_id text UNIQUE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    order_items jsonb NOT NULL,
    total_amount decimal(10,2) NOT NULL,
    status public.order_status NOT NULL DEFAULT 'pending',
    shipping_address jsonb,
    shipping_provider text,
    shipping_tracking_number text,
    payment_method text,
    midtrans_transaction_id text,
    midtrans_snap_token text,
    midtrans_snap_redirect_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT reviews_order_product_key UNIQUE (order_id, product_id, user_id)
);

CREATE TRIGGER on_products_update BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_product_drafts_update BEFORE UPDATE ON public.product_drafts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_organization_profile_update BEFORE UPDATE ON public.organization_profile FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_profiles_update BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_orders_update BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_user_role_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role)
  WHERE
    id = new.id;
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_profile_change_update_user_role
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_role_from_profile();

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role' = 'admin';
$$ LANGUAGE sql STABLE;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Product types are viewable by everyone" ON public.product_types FOR SELECT USING (true);
CREATE POLICY "Admins have full access to product types" ON public.product_types FOR ALL USING (is_admin());
CREATE POLICY "Published products are viewable by everyone" ON public.products FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins have full access to products" ON public.products FOR ALL USING (is_admin());

CREATE POLICY "Users can manage their own drafts" ON public.product_drafts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all drafts" ON public.product_drafts FOR ALL USING (is_admin());

CREATE POLICY "Organization profile is viewable by everyone" ON public.organization_profile FOR SELECT USING (true);
CREATE POLICY "Admins have full access to organization profile" ON public.organization_profile FOR ALL USING (is_admin());

CREATE POLICY "Users can manage their own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (is_admin());
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews for their own completed orders" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = reviews.order_id AND user_id = auth.uid() AND status = 'completed'
  )
);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to reviews" ON public.reviews FOR ALL USING (is_admin());

DROP FUNCTION IF EXISTS public.get_project_usage();
CREATE OR REPLACE FUNCTION public.get_project_usage()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    CASE
      WHEN is_admin() THEN
        jsonb_build_object(
          'database_size_bytes', db.size,
          'storage_size_bytes', storage.size,
          'total_used_bytes', db.size + storage.size
        )
      ELSE
        '{"error": "Unauthorized"}'::jsonb
    END
  FROM
    (SELECT pg_database_size(current_database()) AS size) AS db,
    (SELECT COALESCE(SUM((metadata->>'size')::bigint), 0) FROM storage.objects WHERE bucket_id = 'progress-jogja-bucket') AS storage(size);
$$;
GRANT EXECUTE ON FUNCTION public.get_project_usage() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_user(p_user_id uuid, p_updates jsonb)
RETURNS TABLE (j jsonb)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'admin_update_user: permission denied';
  END IF;

  UPDATE public.profiles
  SET
    full_name = COALESCE(p_updates->>'full_name', full_name),
    avatar_url = COALESCE(p_updates->>'avatar_url', avatar_url),
    addresses = COALESCE((p_updates->'addresses')::jsonb, addresses),
    role = COALESCE(p_updates->>'role', role)
  WHERE
    id = p_user_id;

  RETURN QUERY SELECT to_jsonb(t) FROM profiles t WHERE t.id = p_user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  deleted_user_id TEXT;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'admin_delete_user: permission denied';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;

  GET DIAGNOSTICS deleted_user_id = ROW_COUNT;

  IF deleted_user_id = '1' THEN
    RETURN jsonb_build_object('success', true, 'message', 'User deleted successfully.');
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'User not found or could not be deleted.');
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in admin_delete_user: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_all_users_with_email()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    CASE
      WHEN is_admin() THEN
        (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', u.id,
              'email', u.email,
              'full_name', p.full_name,
              'avatar_url', p.avatar_url,
              'role', p.role,
              'addresses', p.addresses,
              'updated_at', p.updated_at
            ) ORDER BY p.updated_at DESC
          ), '[]'::jsonb)
          FROM auth.users u
          LEFT JOIN public.profiles p ON u.id = p.id
        )
      ELSE
        '[]'::jsonb
    END
$$;
GRANT EXECUTE ON FUNCTION public.get_all_users_with_email() TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('progress-jogja-bucket', 'progress-jogja-bucket', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Allow public read access to storage" ON storage.objects;
CREATE POLICY "Allow public read access to storage" ON storage.objects FOR SELECT USING (bucket_id = 'progress-jogja-bucket');
DROP POLICY IF EXISTS "Allow authenticated users to upload to storage" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload to storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'progress-jogja-bucket' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated users to update storage" ON storage.objects;
CREATE POLICY "Allow authenticated users to update storage" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated users to delete from storage" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete from storage" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

INSERT INTO public.organization_profile (id) VALUES ('e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f') ON CONFLICT (id) DO NOTHING;
INSERT INTO "public"."profiles" ("id", "full_name", "avatar_url", "addresses", "role", "updated_at") VALUES ('315c3c4e-3c9d-44de-8dbb-a37bded946ac', 'Mohammad Farid Hendianto', null, '[]', 'admin', '2025-07-07 08:20:32.337484+00');