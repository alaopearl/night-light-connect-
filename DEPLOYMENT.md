# Night Light Connect — Deployment Guide

Production deployment instructions for **Night Light Connect**, a client-side
React + TypeScript + Vite single-page application. The app is fully static
once built — no server runtime, no remote database required.

- **Build output:** `dist/`
- **Build command:** `bun run build` (or `npm run build`)
- **Package manager:** `bun@1.2.22` (npm works too)

## Prerequisites

- Node.js 18+ (or Bun 1.2+)
- A GitHub repository containing this project. Example: `git@github.com:you/night-light-connect.git`

## Environment Variables

All runtime configuration is baked in at build time via Vite `import.meta.env`.
The app ships with production-ready defaults, so **no variables are required**
to deploy. To override, create `.env` from `.env.example` or set the variables
in your host's dashboard before building:

| Variable            | Purpose                          | Default                         |
| ------------------- | -------------------------------- | ------------------------------- |
| `VITE_APP_NAME`     | Brand name shown in the UI       | `Night Light Connect`           |
| `VITE_TAGLINE`      | Hero tagline                     | Nigeria's trusted advisory…     |
| `VITE_WHATSAPP_INTL`| International WhatsApp number    | `2349133172414`                 |
| `VITE_PHONE_NUMBER` | Display phone number             | `07080210062`                   |
| `VITE_EMAIL`        | Contact / inquiry email          | `nightlighthomes171@gmail.com`  |
| `VITE_ADDRESS`      | Office address                   | `23 High Court, Lekki-Ajah…`    |
| `VITE_ADMIN_PIN`    | Admin portal PIN (change me!)    | `2468`                          |

---

## 1. Vercel (recommended)

SPA rewrites, cache headers, and security headers are pre-configured in
[`vercel.json`](vercel.json).

### One-click (dashboard)

1. Go to https://vercel.com/new
2. Import your GitHub repo (`night-light-connect`)
3. Vercel auto-detects the framework (**Vite**). Confirm:
   - **Build Command:** `npm run build` or `bun run build`
   - **Output Directory:** `dist`
4. Add any environment variables from the table above (optional).
5. Click **Deploy**. Done — rewrites are handled automatically by `vercel.json`.

### CLI

```bash
npm i -g vercel
vercel login
vercel            # preview deploy
vercel --prod     # production deploy
```

---

## 2. Netlify

Redirects and build settings are pre-configured in
[`netlify.toml`](netlify.toml).

### One-click (dashboard)

1. Go to https://app.netlify.com/start
2. **Add new site → Import an existing project → GitHub** and pick the repo.
3. Netlify reads `netlify.toml` automatically:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables (optional).
5. Click **Deploy site**. The SPA redirect `/* → /index.html` is applied for you.

### CLI

```bash
npm i -g netlify-cli
netlify login
netlify init       # link repo, picks up netlify.toml
netlify deploy --prod --dir=dist
```

---

## 3. GitHub Pages

GitHub Pages (and most static hosts) serve files as-is, so the SPA fallback
is done client-side. This app uses in-page section anchors (`#home`,
`#properties`, …) rather than router paths, so **deep links are not an issue**
— public pages work without any rewrite config.

1. Push the repo to GitHub.
2. **Repo → Settings → Pages → Source: GitHub Actions** (or Branch `main` / `docs`).
3. Add a workflow file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Site is live at `https://<user>.github.io/<repo>/`.

> If deployed to a **sub-path** (`/repo/`), set `base` in `vite.config.ts`
> (`base: "/repo/"`) and rebuild — assets are referenced with absolute paths.

---

## 4. Cloudflare Pages

1. Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the repo. Framework preset: **Vite**.
3. Confirm:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. For full SPA control, add a `_redirects` file in `public/`:

```
/*  /index.html  200
```

---

## 5. Render (Static Site)

1. https://render.com → **New → Static Site** → connect repo.
2. Settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Deploy. Render serves `dist` statically; sections use in-page anchors so
   no rewrite rules are required.

---

## 6. Manual / Any Static Host (Nginx, Apache, S3, cPanel)

1. Build locally: `bun run build`
2. Upload the contents of `dist/` to your web root.

### Nginx SPA fallback (only if you use router paths later)

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Apache `.htaccess`

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Post-Deploy Checklist

- [ ] HTTPS is enforced (default on all hosts above).
- [ ] OpenGraph / Twitter cards render on social shares — the meta tags in
      `index.html` reference `/og-image.jpg`; upload a square brand image to
      `public/og-image.jpg` and rebuild if you want a custom share image.
- [ ] Admin PIN set to something private via `VITE_ADMIN_PIN` (default `2468`
      is public in the source).
- [ ] Cache headers: hashed `dist/assets/*` files are cached immutably for a
      year on Vercel/Netlify via the config files in this repo.

## Troubleshooting

| Symptom                          | Fix                                                                 |
| -------------------------------- | ------------------------------------------------------------------- |
| 404 on refresh/URL               | Ensure SPA rewrite/redirect is active (configs above cover it)       |
| Blank page after deploy          | Rebuild locally; verify `dist/index.html` exists and asset paths     |
| Old assets cached                | Vercel/Netlify cache-bust via immutable hashes; hard-refresh         |
| Missing env overrides            | Rebuild — `import.meta.env` values are baked in at build time        |