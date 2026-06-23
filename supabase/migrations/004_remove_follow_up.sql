-- Usuń follow-up, jeśli migracja 003 była już uruchomiona wcześniej

ALTER TABLE certificates DROP COLUMN IF EXISTS follow_up_done;
DROP INDEX IF EXISTS idx_certificates_follow_up;
