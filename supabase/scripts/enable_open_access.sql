-- =============================================================================
-- FriDom CRM — otwarty dostęp BEZ logowania (TYLKO development / testy)
-- =============================================================================
-- Uruchom w Supabase SQL Editor PO init.sql
--
-- UWAGA: Każdy z kluczem anon może czytać i modyfikować WSZYSTKIE dane.
-- NIE używaj tego na produkcji z prawdziwymi danymi klientów.
-- =============================================================================

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Open access profiles" ON profiles;
CREATE POLICY "Open access profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- clients
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
DROP POLICY IF EXISTS "Open access clients" ON clients;
CREATE POLICY "Open access clients" ON clients FOR ALL USING (true) WITH CHECK (true);

-- buildings
DROP POLICY IF EXISTS "Authenticated users can manage buildings" ON buildings;
DROP POLICY IF EXISTS "Open access buildings" ON buildings;
CREATE POLICY "Open access buildings" ON buildings FOR ALL USING (true) WITH CHECK (true);

-- certificates
DROP POLICY IF EXISTS "Authenticated users can manage certificates" ON certificates;
DROP POLICY IF EXISTS "Open access certificates" ON certificates;
CREATE POLICY "Open access certificates" ON certificates FOR ALL USING (true) WITH CHECK (true);

-- storage
DROP POLICY IF EXISTS "Authenticated users can read certificates files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update certificates files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete certificates files" ON storage.objects;
DROP POLICY IF EXISTS "Open access certificates files read" ON storage.objects;
DROP POLICY IF EXISTS "Open access certificates files write" ON storage.objects;
CREATE POLICY "Open access certificates files read"
  ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Open access certificates files write"
  ON storage.objects FOR ALL USING (bucket_id = 'certificates') WITH CHECK (bucket_id = 'certificates');

SELECT 'Otwarty dostęp włączony — aplikacja działa bez logowania.' AS status;
