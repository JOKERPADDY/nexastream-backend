import { extract as extractStreamWish } from './src/extractors/streamWishExtractor.js';
import { extract as extractVixSrc } from './src/extractors/vixSrcExtractor.js';

const ALLOWED_HOSTS = [
  'streamwish.to',
  'streamwish.com',
  'wishfast.top',
  'embedwish.com',
  'awish.tokyo',
  'vixsrc.to',
  'blackpuma78.boats',
  'filemoon.sx',
  'filemoon.site',
  'rabbitstream.net'
];

function isPrivateIP(hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }
  const parts = hostname.split('.');
  if (parts.length === 4) {
    const num = parseInt(parts[0], 10);
    if (num === 10 || num === 127 || (num === 192 && parts[1] === '168') || (num === 172 && num >= 16 && num <= 31)) {
      return true;
    }
  }
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return Response.json({ status: 'healthy', runtime: 'cloudflare-worker', timestamp: new Date().toISOString() }, { headers: corsHeaders });
    }

    if (url.pathname === '/api/v1/providers' && request.method === 'GET') {
      return Response.json({
        version: '1.0.0',
        providers: [
          { id: 'streamwish', name: 'StreamWish', status: 'active' },
          { id: 'vixsrc', name: 'VixSrc', status: 'active' }
        ]
      }, { headers: corsHeaders });
    }

    if (url.pathname === '/api/v1/resolve' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { provider, url: targetUrl } = body;

        if (!provider || !targetUrl) {
          return Response.json({ error: 'Missing required parameters: provider and url' }, { status: 400, headers: corsHeaders });
        }

        const parsedUrl = new URL(targetUrl);
        const hostname = parsedUrl.hostname.toLowerCase();

        const isAllowed = ALLOWED_HOSTS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
        if (!isAllowed || isPrivateIP(hostname)) {
          console.warn(`[Security Warning] Blocked unauthorized or private URL: ${targetUrl}`);
          return Response.json({ error: 'URL is not allowed or points to a restricted network' }, { status: 403, headers: corsHeaders });
        }

        console.log(`Resolving stream for provider [${provider}] with URL: ${targetUrl}`);

        let streamInfo = null;
        if (provider === 'streamwish') {
          streamInfo = await extractStreamWish(targetUrl);
        } else if (provider === 'vixsrc') {
          streamInfo = await extractVixSrc(targetUrl);
        } else {
          return Response.json({ error: `Unsupported provider: ${provider}` }, { status: 400, headers: corsHeaders });
        }

        return Response.json({
          success: true,
          provider,
          stream: streamInfo
        }, { headers: corsHeaders });

      } catch (error) {
        console.error('Error resolving stream:', error.message);
        return Response.json({ success: false, error: error.message || 'Failed to resolve stream' }, { status: 502, headers: corsHeaders });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
