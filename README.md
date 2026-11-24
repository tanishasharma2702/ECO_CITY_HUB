# EcoCity Hub – AI-Powered Smart City & Environmental Platform

> **"One Platform. Three Problems. One Greener City."**

An enterprise-grade, genuinely functional AI platform uniting personal carbon emission analytics, community civic infrastructure reporting with vision AI, and urban plant pathology diagnostics with organic remedies.

Developed by **Tanisha Sharma | JECRC University**  
*"Empowering community vigilance for cleaner, safer streets."*

---

## 🌍 Platform Overview & The Three Core Pillars

1. **Carbon Footprint Calculator (Module 1)**:
   - **Deterministic Calculations**: Mathematically calculates CO2-equivalent emissions using documented IPCC / CEA grid intensity factors for transportation (car, motorcycle, transit, bicycle, walking), electricity consumption (kWh), and dietary choices (vegan, vegetarian, mixed).
   - **Gemini AI Decarbonization**: Sends calculated results to Google Gemini AI to generate structured, personalized habit reduction tips and 90-day emission goals in the user's selected language.
   - **Visual Analytics**: Interactive Chart.js doughnut breakdowns, comparison against previous audits, and Supabase audit history.

2. **Civic Issue Reporter (Module 2)**:
   - **Vision AI Hazard Detection**: Citizens upload street photos (potholes, garbage dumps, water leaks, broken streetlights, overflowing drains). Gemini Vision classifies the problem and estimates urgency (`Low`, `Medium`, `High`, `Critical`).
   - **Municipal Grievance Drafting**: Automatically drafts formal, respectfully worded municipal complaint letters addressed to the relevant department (PWD, Sanitation, Water Board, Electrical Wing).
   - **Interactive Leaflet Mapping**: Pinpoint coordinates on OpenStreetMap with draggable/clickable markers.
   - **Lifecycle Tracking (`My Reports`)**: Status tracking across `Draft`, `Submitted`, `Under Review`, and `Resolved` with +50 to +75 Green Score rewards.

3. **Plant Health Checker (Module 3)**:
   - **Botanical Vision Diagnostics**: Upload leaf or garden plant photographs. Gemini identifies plant species (common + Latin botanical names), identifies visible symptoms, detects underlying pathogens or watering stress, and provides confidence percentages.
   - **Eco-Safe Organic Remedies**: Prescribes safe home care (cold-pressed neem oil, soil aeration, chamomile/baking soda wash, compost tea) and explicitly refuses toxic chemical treatments.
   - **Plant Care Ledger**: Stores previous diagnoses and tracking in Supabase.

4. **Gamified Green Score Engine**:
   - Transparent mathematical weighting: **40% Carbon Progress + 30% Civic Action + 30% Plant Care**.
   - Five achievement tiers: *Green Beginner* (0-200), *Eco Explorer* (201-500), *Green Guardian* (501-1000), *Eco Champion* (1001-2000), and *Planet Protector* (2001+).
   - Interactive weekly green missions and collectible achievement badges.

---

## 🎨 Exact 10-Color Earthy Palette Design System

The platform strictly uses the specified 10-shade earthy color palette:
- `#EDC4B3` – Soft Almond Beige
- `#E6B8A2` – Warm Peach Surface
- `#DEAB90` – Desert Sand
- `#D69F7E` – Terracotta Tint
- `#CD9777` – Earth Clay
- `#C38E70` – Muted Terracotta
- `#B07D62` – Warm Saddle Brown
- `#9D6B53` – Burnt Sienna
- `#8A5A44` – Deep Espresso
- `#774936` – Rich Terracotta Brown

**Theme Modes**: Full support for Light Mode (default), Dark Mode, and System Default, switchable inside Settings.

---

## 🌐 Multilingual Support (i18next)

EcoCity Hub provides full bilingual/multilingual interfaces across all navigation, buttons, forms, tool descriptions, and error states:
- 🇬🇧 **English** (Default)
- 🇮🇳 **Hindi** (हिन्दी)
- 🇪🇸 **Spanish** (Español)
- 🇫🇷 **French** (Français)
- 🇩🇪 **German** (Deutsch)

---

## 🚀 Getting Started & Demonstration

### 1. Instant Zero-Configuration Demo Mode
EcoCity Hub includes an integrated stateful local storage fallback engine. You can run and evaluate all three AI tools, registration, login, carbon calculations, civic reports, plant diagnoses, and badges **immediately** without configuring database credentials:

```bash
npm install
npm run dev
```

In the login screen, click **"Try Guest Demo (One-Click Instant Access)"** to load a pre-seeded account with sample records.

### 2. Connecting Remote Supabase (Production)
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL migration located at `supabase/migrations/20250101000000_create_ecocity_schema.sql` in the Supabase SQL Editor.
3. Deploy the Edge Functions:
   ```bash
   supabase functions deploy carbon-recommendations
   supabase functions deploy civic-analysis
   supabase functions deploy plant-analysis
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```
4. Copy your Supabase URL & Anon Key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

---

## ☁️ Netlify Deployment

- Build Command: `npm run build`
- Publish Directory: `dist`
- SPA redirects are configured in `public/_redirects` and `netlify.toml`.
