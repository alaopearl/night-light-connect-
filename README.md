# Night Light Connect

Nigeria's trusted nationwide real estate & investment advisory. Browse verified properties across 36 states & the FCT, manage listings through a built-in Admin Portal, and reach the team instantly via WhatsApp, phone, or email.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui.

## Features

- **Property Listings** — Browse verified properties with detailed views, filters, and inspection booking
- **Admin Portal** — Manage property listings with a secure PIN-gated admin interface
- **Built-in Leads & Inspection Requests** — Every contact/inspection form saves leads locally and opens WhatsApp for instant confirmation
- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Modern UI** — Phosphor icons, Framer Motion animations, and a premium gold-on-navy visual system

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | Phosphor Icons |
| Animations | Framer Motion |
| State | React state + localStorage persistence |

## Next Steps — Your Roadmap

### 1. Go Live 🚀 (choose one host)
The app is fully static once built (`dist/`) and ships with pre-configured configs for every major host. See [`DEPLOYMENT.md`](DEPLOYMENT.md) for step-by-step guides.

| Host | Config | Effort |
|------|--------|--------|
| **Vercel** (recommended) | `vercel.json` included | ~2 min |
| **Netlify** | `netlify.toml` included | ~2 min |
| **GitHub Pages** | workflow template in `DEPLOYMENT.md` | ~3 min |
| Cloudflare Pages / Render / any static host | see `DEPLOYMENT.md` | vary |

### 2. Customize Your Branding & Content 🎨
Everything is configurable — no code edits required:

| What | Where |
|------|-------|
| Brand name, tagline, WhatsApp, phone, email, address | `.env` (copy from `.env.example`) |
| Property listings | **Admin Portal** (PIN `2468`, change it!) or `src/constants.ts` |
| Regions, services, testimonials, stats | `src/constants.ts` |

### 3. Use the Admin Portal 🔐
1. Click the **Admin** button in the navbar (or visit `#admin`).
2. Enter the default PIN **`2468`** (change it via `VITE_ADMIN_PIN` in `.env` before going live).
3. Add, edit, publish/unpublish, or delete properties and manage leads.

### 4. Explore Future Enhancements 💡
Ready-to-build ideas, in suggested order:

- **Currency conversion** (₦ ↔ $/£/€) for diaspora buyers
- **Mortgage / affordability calculator** (Nigerian bank rates, monthly repayment)
- **Lead inquiry forms** with richer fields (budget, purpose, preferred location)
- **Advanced filters** (price range, bedrooms, title type, purpose)
- **Supabase backend** to sync leads, inspections, and listings across devices
- **Multi-language UI** (English + Hausa, Yoruba, Igbo, Pidgin)

## Quick Start

### Prerequisites
- Node.js 18+ or Bun 1.2+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd night-light-connect

# Install dependencies
bun install
# or: npm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Start the dev server on port 3000
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Type-check and build for production
bun run build
# or: npm run build

# Preview the production build locally
bun run preview
# or: npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following (all have production-ready defaults — none are required to run):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_NAME` | Application display name | Night Light Connect |
| `VITE_TAGLINE` | Hero tagline | Nigeria's trusted nationwide real estate & investment advisory. |
| `VITE_WHATSAPP_NUMBER` | Display WhatsApp number | 09133172414 |
| `VITE_WHATSAPP_INTL` | International WhatsApp number | 2349133172414 |
| `VITE_PHONE_NUMBER` | Display phone number | 07080210062 |
| `VITE_PHONE_INTL` | International phone number | +2347080210062 |
| `VITE_EMAIL` | Contact / inquiry email | nightlighthomes171@gmail.com |
| `VITE_ADDRESS` | Office address | 23 High Court, Lekki-Ajah Road, Lagos, Nigeria |
| `VITE_ADMIN_PIN` | Admin portal PIN | 2468 |

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitive components
│   ├── Navbar.tsx             # Navigation bar
│   ├── Footer.tsx             # Page footer
│   ├── FloatingActions.tsx    # WhatsApp / call floating buttons
│   ├── HomeSections.tsx       # Hero, About, Services, Why Us, Testimonials, Contact
│   ├── PropertiesSection.tsx  # Property listing grid + filters
│   ├── AdminPortal.tsx        # Admin dashboard (PIN-gated)
│   ├── AdminManager.tsx       # Admin content manager
│   └── AdminUploadForm.tsx    # Property upload form
├── hooks/
│   └── use-mobile.ts          # Mobile breakpoint hook
├── lib/
│   └── utils.ts               # Shared utility functions (cn)
├── types.ts                   # TypeScript type definitions
├── constants.ts               # App-wide constants + default properties
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for complete guides: **Vercel (recommended)**, Netlify, GitHub Pages, Cloudflare Pages, Render, and manual hosting.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Type-check and build for production |
| `bun run preview` | Preview production build locally |
| `bun run typecheck` | Run TypeScript type checking only |
| `bun run lint` | Run ESLint |

## License

This project is proprietary. All rights reserved.