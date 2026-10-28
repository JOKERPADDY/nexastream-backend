const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Safe StreamWish extractor using Axios and Cheerio.
 * No arbitrary JavaScript evaluation (vm/vm2) is used.
 */
async function extract(videoUrl) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': videoUrl
  };

  const response = await axios.get(videoUrl, { headers, timeout: 8000 });
  const html = response.data;
  const $ = cheerio.load(html);

  let streamUrl = null;

  // Search for m3u8 sources in script tags or evaluation strings
  $('script').each((i, el) => {
    const scriptContent = $(el).html() || '';
    if (scriptContent.includes('.m3u8')) {
      const match = scriptContent.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
      if (match) {
        streamUrl = match[0];
      }
    }
  });

  if (!streamUrl) {
    // Fallback regex search on full HTML
    const match = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
    if (match) {
      streamUrl = match[0];
    }
  }

  if (!streamUrl) {
    throw new Error('StreamWish stream URL not found in target page');
  }

  return {
    url: streamUrl,
    quality: 'auto',
    headers: {
      'Referer': videoUrl,
      'User-Agent': headers['User-Agent']
    },
    subtitles: []
  };
}

module.exports = { extract };
