-- =============================================================================
-- FriDom CRM — nadanie roli administratora
-- =============================================================================
-- Uruchom PO utworzeniu użytkownika w Supabase → Authentication → Users
--
-- Zmień adres e-mail poniżej na swój, potem uruchom w SQL Editor.
-- =============================================================================

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'twoj@email.pl';  -- ← ZMIEŃ NA SWÓJ E-MAIL

-- Sprawdzenie wyniku:
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE email = 'twoj@email.pl';  -- ← ZMIEŃ NA SWÓJ E-MAIL
