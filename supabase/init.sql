-- =============================================================================
-- FriDom CRM — pełna inicjalizacja bazy danych Supabase
-- =============================================================================
-- WYMAGANE: uruchom WYŁĄCZNIE w Supabase Dashboard → SQL Editor
--           (NIE w pgAdmin, DBeaver ani lokalnym PostgreSQL bez Supabase)
--
-- Po uruchomieniu:
--   1. Utwórz użytkownika w Authentication → Users (e-mail + hasło)
--   2. Uruchom supabase/scripts/promote_admin.sql (podaj swój e-mail)
-- =============================================================================

-- Weryfikacja środowiska Supabase
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
  ) THEN
    RAISE EXCEPTION E'
██ BŁĄD: Schemat "auth" nie istnieje ██

Ten skrypt działa TYLKO w projekcie Supabase (auth + storage są wbudowane).

Nie uruchamiaj go na:
  - lokalnym PostgreSQL (pgAdmin, psql na localhost)
  - zwykłym hostingu SQL bez Supabase

Poprawne kroki:
  1. Wejdź na https://supabase.com i utwórz projekt (lub otwórz istniejący)
  2. W menu projektu: SQL Editor → New query
  3. Wklej CAŁY ten plik i kliknij Run

Lokalny development z Supabase CLI:
  supabase init && supabase start
  supabase db execute -f supabase/init.sql
';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage'
  ) THEN
    RAISE EXCEPTION 'Schemat "storage" nie istnieje — uruchom skrypt w projekcie Supabase.';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. Typy ENUM
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'assistant');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE building_type AS ENUM (
    'dom_jednorodzinny',
    'mieszkanie',
    'budynek_wielorodzinny',
    'inny'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('waiting_for_data', 'in_progress', 'ready');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_action AS ENUM (
    'client_created',
    'client_updated',
    'order_status_changed',
    'building_added',
    'building_updated',
    'material_uploaded',
    'material_deleted',
    'checklist_item_added',
    'checklist_item_toggled',
    'certificate_uploaded',
    'certificate_pdf_sent',
    'certificate_payment_changed',
    'certificate_deleted'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Tabele
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'assistant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  order_status order_status NOT NULL DEFAULT 'waiting_for_data',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  building_type building_type NOT NULL DEFAULT 'inny',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  certificate_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  energy_class TEXT,
  cost NUMERIC(10, 2),
  payment_status payment_status NOT NULL DEFAULT 'pending',
  pdf_sent_at TIMESTAMPTZ,
  file_path TEXT,
  file_name TEXT,
  notes TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS building_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  notes TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action activity_action NOT NULL,
  description TEXT NOT NULL,
  entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. Indeksy
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_buildings_client_id ON buildings(client_id);
CREATE INDEX IF NOT EXISTS idx_certificates_client_id ON certificates(client_id);
CREATE INDEX IF NOT EXISTS idx_certificates_building_id ON certificates(building_id);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry_date ON certificates(expiry_date);
CREATE INDEX IF NOT EXISTS idx_building_materials_building_id ON building_materials(building_id);
CREATE INDEX IF NOT EXISTS idx_building_materials_client_id ON building_materials(client_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_building_id ON checklist_items(building_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_client_id ON checklist_items(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id ON activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- -----------------------------------------------------------------------------
-- 4. Funkcje i triggery
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'assistant')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Uzupełnij profile dla użytkowników utworzonych PRZED migracją
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE((u.raw_user_meta_data->>'role')::user_role, 'assistant')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- -----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
CREATE POLICY "Authenticated users can manage clients"
  ON clients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage buildings" ON buildings;
CREATE POLICY "Authenticated users can manage buildings"
  ON buildings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage certificates" ON certificates;
CREATE POLICY "Authenticated users can manage certificates"
  ON certificates FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage building materials" ON building_materials;
CREATE POLICY "Authenticated users can manage building materials"
  ON building_materials FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage checklist items" ON checklist_items;
CREATE POLICY "Authenticated users can manage checklist items"
  ON checklist_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage activity log" ON activity_log;
CREATE POLICY "Authenticated users can manage activity log"
  ON activity_log FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 6. Storage — bucket na pliki PDF certyfikatów
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can read certificates files" ON storage.objects;
CREATE POLICY "Authenticated users can read certificates files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload certificates files" ON storage.objects;
CREATE POLICY "Authenticated users can upload certificates files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update certificates files" ON storage.objects;
CREATE POLICY "Authenticated users can update certificates files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete certificates files" ON storage.objects;
CREATE POLICY "Authenticated users can delete certificates files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'building-materials',
  'building-materials',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can read building materials files" ON storage.objects;
CREATE POLICY "Authenticated users can read building materials files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'building-materials' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload building materials files" ON storage.objects;
CREATE POLICY "Authenticated users can upload building materials files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'building-materials' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update building materials files" ON storage.objects;
CREATE POLICY "Authenticated users can update building materials files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'building-materials' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete building materials files" ON storage.objects;
CREATE POLICY "Authenticated users can delete building materials files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'building-materials' AND auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- Gotowe. Następny krok: uruchom supabase/scripts/promote_admin.sql
-- -----------------------------------------------------------------------------
