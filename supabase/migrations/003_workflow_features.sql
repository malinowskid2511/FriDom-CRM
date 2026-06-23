-- Status zlecenia, płatności, checklista materiałów, timeline aktywności

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

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS order_status order_status NOT NULL DEFAULT 'waiting_for_data';

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pdf_sent_at TIMESTAMPTZ;

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

CREATE INDEX IF NOT EXISTS idx_checklist_items_building_id ON checklist_items(building_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_client_id ON checklist_items(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id ON activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

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
