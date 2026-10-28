import * as streamWishExtractor from '../src/extractors/streamWishExtractor.js';

describe('StreamWish Extractor', () => {
  test('should throw error on invalid or unreachable URL', async () => {
    await expect(streamWishExtractor.extract('https://streamwish.to/invalid')).rejects.toThrow();
  });
});
