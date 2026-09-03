# S-Cafe Beach Restaurant — Ordering System (Phase 1)

Mobile-first menu + ordering system for S-Cafe. TR default / EN toggle.
Customer menu at `/`, admin dashboard at `/admin`.

## What's built (Phase 1)

- Mobile-first customer menu, TR/EN, tap-to-add product cards
- "En Çok Sipariş Edilenler / Most Loved" — auto-computed from real order history, no manual curation
- Sticky cart, checkout by first/last name (no sunbed number required), optional location
  dropdown (Plaj Alanı / Çim Alanı / Çardak Alanı / Havuz Restoran / Daire No.)
- QR zone parameter (`?location=beach`) auto-fills location, guest can still change it
- Order placed → live status page (polls every 6s)
- Admin login (Supabase Auth), orders dashboard grouped by status with sound alert on new order,
  status buttons (Kabul Et → Hazırlanıyor → Yola Çıktı → Teslim Edildi)
- Menu editor: edit price, mark sold out (stays visible, shows "Tükendi"), show/hide product — no code required
- Ayarlar: sipariş alımı açık/kapalı toggle, WhatsApp bildirim toggle
- Prices/totals always recalculated server-side from the database — a guest cannot
  manipulate a price from the browser
- Cart survives page refresh (localStorage), never used for anything critical

## Not yet built (flagged as Phase 2 in the original brief, architected to slot in later)

- Real WhatsApp API push (right now: number is stored in Settings, ready for Phase 2 wiring)
- Online payment
- Waiter call / request bill buttons
- Analytics / best-sellers report (though "Most Loved" gives a live preview of this already)
- Real admin image upload UI (Supabase Storage is the natural place for this — not wired yet)

## Setup

### 1. Supabase (free tier)

1. Create a project at supabase.com
2. Go to SQL Editor → run `supabase/schema.sql`, then `supabase/seed.sql`
3. Go to Authentication → Users → add two users (email + password) for yourself (owner) and Turan (staff)
   — for each, also insert a row in `staff_users` with their `id`, `full_name`, and `role`
4. Go to Project Settings → API → copy the Project URL and anon public key

### 2. Local setup

```bash
npm install
cp .env.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Visit `http://localhost:3000` for the menu, `http://localhost:3000/admin/login` for admin.

### 3. Deploy (free)

- Push this repo to GitHub
- Create a Netlify site from the repo (Netlify auto-detects Next.js)
- In Netlify → Site settings → Environment variables, add `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy — you'll get a free URL like `saranda-cafe.netlify.app`. A custom domain can be
  attached later without any code changes.

### 4. QR codes

- Zone QR: `https://your-site.netlify.app/?location=beach` (also: `grass`, `cardak`, `havuz_restoran`)
- Generic entrance/WhatsApp QR: `https://your-site.netlify.app/` (no parameter)
- Any free QR generator (e.g. qr-code-generator.com) can turn these URLs into printable codes

## Notes on the menu data

All prices in `supabase/seed.sql` are the real prices you sent. English names are draft
translations — review and edit them directly in Menüyü Düzenle, no redeploy needed once we
wire up the text-editing fields (currently price + sold-out + visibility are editable there;
name/description editing is the next small addition).

Known open items from our conversation:
- "Soğuk Kahve" currently listed once, under Soğuk İçecekler only — confirm this is correct
- Nut Mix, Cashew, Sunflower Seeds, Salted Peanuts, Almonds, and the Carrot/Cucumber "Mimoza"
  are not yet in the seed data — send prices and I'll add them to Atıştırmalıklar
