# FriDom CRM

Panel CRM dla biura **FriDom Antonina Frieske** — zarządzanie klientami, budynkami i certyfikatami energetycznymi (PDF).

> Strona publiczna jest w osobnym repozytorium: [FriDom-Website](https://github.com/malinowskid2511/FriDom-Website)

## Funkcje

- Zarządzanie klientami (telefon, e-mail, notatki)
- Wiele budynków na klienta
- Certyfikaty energetyczne (PDF) i materiały do świadectw
- Panel, zarobki, użytkownicy (admin / asystent)
- Tryb demo bez bazy (`VITE_DEMO_MODE=true`)

## Uruchomienie

```bash
npm install
cp .env.example .env
npm run dev
```

Domyślnie: `http://localhost:5173` (tryb demo, bez logowania).

## Supabase

Skrypty SQL i migracje w folderze `supabase/`. Szczegóły konfiguracji w komentarzach w `.env.example`.

## Wdrożenie

```bash
npm run build
npm run deploy
```

Ustaw `NODE_VERSION=22` oraz zmienne `VITE_SUPABASE_*` w panelu hostingu.

## Styl / branding

Logo i kolorystyka (czarno-biała, font Jost) są w `public/` i `src/style.css` — spójne ze stroną publiczną FriDom.
