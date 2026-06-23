-- Sprawdź, czy jesteś w projekcie Supabase (uruchom PRZED init.sql)
SELECT
  EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') AS has_auth_schema,
  EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') AS has_storage_schema,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') AS has_auth_users;

-- Oczekiwany wynik na Supabase:
-- has_auth_schema = true, has_storage_schema = true, has_auth_users = true
--
-- Jeśli wszystko false → uruchamiasz skrypt na złej bazie danych.
