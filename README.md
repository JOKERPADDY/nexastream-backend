# NexaStream Cloudflare Worker Backend

## Overview
Cloudflare Worker backend service for NexaStream 2 stream extraction running at the edge with zero cold starts.

## Local Development
1. Install dependencies: `npm install`
2. Run locally: `npm run dev`

## Deployment to Cloudflare Workers
1. Login to Wrangler: `npx wrangler login`
2. Deploy: `npm run deploy`

## API Endpoints
- `GET /health` - Health check
- `GET /api/v1/providers` - List active providers
- `POST /api/v1/resolve` - Resolve stream URL
  - Body: `{ "provider": "streamwish", "url": "https://streamwish.to/e/..." }`
