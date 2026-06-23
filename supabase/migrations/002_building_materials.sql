-- Materiały przypisane do budynków (rzuty, dokumenty ze spółdzielni itd.)

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

CREATE INDEX IF NOT EXISTS idx_building_materials_building_id ON building_materials(building_id);
CREATE INDEX IF NOT EXISTS idx_building_materials_client_id ON building_materials(client_id);

ALTER TABLE building_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage building materials" ON building_materials;
CREATE POLICY "Authenticated users can manage building materials"
  ON building_materials FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

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
