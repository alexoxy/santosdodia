# Cloudflare production deployment

Santos do Dia is deployed on Cloudflare Workers using OpenNext.

- Worker: `santosdodia`
- Current deployment branch: `cloudflare-preview`
- Build command: `npm run cloudflare:build`
- Deploy command: `npm run cloudflare:deploy`
- Root directory: `/`
- Non-production branch builds: disabled
- Workers.dev production URL: `https://santosdodia.alexmmpinto.workers.dev`
- Preview URLs: disabled
- Custom production domain: `https://www.santosdodia.com`

The GitHub repository is the source of truth. Cloudflare Workers is the production runtime. Vercel Git integration is disconnected and Vercel-specific application dependencies have been removed.

After the repository default branch is promoted, Cloudflare Branch control should be changed from `cloudflare-preview` to `main`.
