# LULN Project Context

## Project Identity

- Project name: `luln`
- Production site: `https://luln.org`
- Primary live page currently referenced by the user: `https://luln.org/life-expectancy`
- Brand text: `LIFE IS URGENT, LIFE IS NOW`

## Hosting And Deployment

- Hosting target: `Cloudflare Pages`
- Custom domain: `luln.org`
- Pages default domain: `luln.pages.dev`
- GitHub repo: `https://github.com/apolloydy/luln`
- Expected deployment workflow: connect repo to `Cloudflare Pages`, then future pushes to the production branch trigger automatic deploys
- Current default branch: `main`
- Production branch in `Cloudflare Pages`: `main`
- Auto deployment: enabled
- Build command: `npm run build`
- Build output directory: `build`
- SPA routing fallback is handled by `public/_redirects`

## Current Cloudflare Deployment State

- Product area in dashboard: `Workers and Pages`
- Project name in dashboard: `luln`
- Active production deployment branch: `main`
- Current production commit shown by the user: `5d086f3`
- Current production preview URL shown by the user: `2c6df5e3.luln.pages.dev`
- Custom domains shown by the user:
  - `luln.pages.dev`
  - `luln.org`

## Deployment History Observed From Dashboard

- `5d086f3` with message `life style` -> available at `2c6df5e3.luln.pages.dev`
- `53f8721` with message `life style` -> no available deployment
- `759574a` with message `wellbing` -> no available deployment
- `801df08` with message `wellbing` -> no available deployment
- `6073280` with message `email` -> available at `5b246679.luln.pages.dev`
- `13d50df` with message `email` -> available at `5ef0dfa6.luln.pages.dev`
- `38c9748` with message `death rank` -> available at `5c409795.luln.pages.dev`
- `2a5f8ab` with message `death rank` -> available at `be913582.luln.pages.dev`
- `3a47dbf` with message `udpate width` -> available at `b6d8c1ae.luln.pages.dev`
- `566862f` with message `udpate width` -> available at `402efe06.luln.pages.dev`
- `5b0474d` with message `udpate width` -> available at `3b47c9fa.luln.pages.dev`
- `594c618` with message `udpate width` -> available at `4e35f35a.luln.pages.dev`
- `9aa2b9f` with message `udpate width` -> available at `05917eaa.luln.pages.dev`
- `c382566` with message `udpate width` -> available at `a39c82ae.luln.pages.dev`
- `3903d47` with message `udpate width` -> available at `7eda88f6.luln.pages.dev`

## App Structure

- Framework: `Create React App`
- Router: `react-router-dom` with `BrowserRouter`
- Top-level routes:
  - `/` -> redirects to `/life-expectancy`
  - `/life-expectancy`
  - `/contact`
  - `/wellbing`
- Nested routes under `/wellbing`:
  - `/wellbing/cause-of-death`
  - `/wellbing/chronic-disease`
  - `/wellbing/life-style-changes`
  - `/wellbing/vo2max`

## Cloudflare Functions

- Repo contains `functions/submit.js`, intended for `Cloudflare Pages Functions`
- Current outbound mail flow uses `MailChannels`
- Current sender address in code: `no-reply@luln.org`
- Current recipient address in code: `lifeisurgentlifeisnow@gmail.com`

## Working Conventions

- Preserve the existing site identity and domain alignment with `luln.org`
- Prefer changes that remain compatible with `Cloudflare Pages`
- Be careful with `BrowserRouter` route handling and avoid breaking direct-route refreshes
- If deployment behavior is changed, keep the `push -> deploy` workflow intact
- Before changing contact or email delivery behavior, verify whether the site should keep using `MailChannels`

## Notes

- The user wants conversation in Chinese, while keeping technical terms in English
- If future work needs reusable cross-project behavior, consider a `skill`
- For this repository alone, `AGENTS.md` is the right place; a dedicated `skill` is unnecessary for now
- The user has already connected this repo to `Cloudflare Pages`; this is not a new setup
