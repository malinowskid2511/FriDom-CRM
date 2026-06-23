-- =============================================================================
-- FriDom CRM — reset bazy (TYLKO development / testy)
-- =============================================================================
-- UWAGA: Usuwa WSZYSTKIE dane klientów, budynków i certyfikatów.
-- Nie usuwa użytkowników auth ani profili.
-- =============================================================================

TRUNCATE TABLE building_materials CASCADE;
TRUNCATE TABLE certificates CASCADE;
TRUNCATE TABLE buildings CASCADE;
TRUNCATE TABLE clients CASCADE;

-- Usuń pliki z Storage (opcjonalnie — uruchom osobno w Storage lub API)
-- DELETE FROM storage.objects WHERE bucket_id IN ('certificates', 'building-materials');

SELECT 'Baza danych zresetowana (klienci, budynki, certyfikaty, materiały).' AS status;
