-- Dodaje kolumnę kosztu do istniejącej tabeli certificates
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS cost NUMERIC(10, 2);
