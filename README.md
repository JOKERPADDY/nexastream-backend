# NexaStream Centralized Backend

## Overview
Node.js / Express backend service for NexaStream 2 stream extraction, configured for deployment on **Render's free tier**.

## Deployment on Render
1. Create a new **Web Service** on Render and connect this repository (`New folder (13)`).
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Select the **Free** instance type.

## API Endpoints
- `GET /health` - Health check
- `GET /api/v1/providers` - List active providers
- `POST /api/v1/resolve` - Resolve stream URL
  - Body: `{ "provider": "streamwish", "url": "https://streamwish.to/e/..." }`
