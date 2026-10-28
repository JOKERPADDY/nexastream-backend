import * as cheerio from 'cheerio';

export async function extract(videoUrl) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': videoUrl
  };

  const response = await fetch(videoUrl, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch target URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  let streamUrl = null;

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
