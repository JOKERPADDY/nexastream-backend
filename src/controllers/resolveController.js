const streamWishExtractor = require('../extractors/streamWishExtractor');

// Strict allowed host domains for SSRF prevention
const ALLOWED_HOSTS = [
  'streamwish.to',
  'streamwish.com',
  'wishfast.top',
  'embedwish.com',
  'awish.tokyo'
];

function isPrivateIP(hostname) {
  // Basic check for localhost or private IP ranges
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }
  const parts = hostname.split('.');
  if (parts.length === 4) {
    const num = parseInt(parts[0], 10);
    if (num === 10 || num === 127 || (num === 192 && parseInt(parts[1], 10) === 168) || (num === 172 && parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) {
      return true;
    }
  }
  return false;
}

exports.getProviders = (req, res) => {
  res.json({
    version: '1.0.0',
    providers: [
      { id: 'streamwish', name: 'StreamWish', status: 'active' }
    ]
  });
};

exports.resolveStream = async (req, res) => {
  const { provider, url } = req.body;

  if (!provider || !url) {
    return res.status(400).json({ error: 'Missing required parameters: provider and url' });
  }

  if (provider !== 'streamwish') {
    return res.status(400).json({ error: `Unsupported provider: ${provider}` });
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // SSRF & Allowlist Validation
    const isAllowed = ALLOWED_HOSTS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    if (!isAllowed || isPrivateIP(hostname)) {
      console.warn(`[Security Warning] Blocked unauthorized or private URL: ${url}`);
      return res.status(403).json({ error: 'URL is not allowed or points to a restricted network' });
    }

    console.log(`Resolving stream for provider [${provider}] with URL: ${url}`);

    // Set extraction timeout (10 seconds)
    const result = await Promise.race([
      streamWishExtractor.extract(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Extraction timeout')), 10000))
    ]);

    return res.json({
      success: true,
      provider,
      stream: result
    });

  } catch (error) {
    console.error(`Error resolving stream for ${provider}:`, error.message);
    return res.status(502).json({
      success: false,
      error: error.message || 'Failed to resolve stream'
    });
  }
};
