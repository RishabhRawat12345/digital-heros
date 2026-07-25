import * as cheerio from 'cheerio';

/**
 * Parses an HTML string and extracts key SEO and accessibility metrics.
 *
 * @param {string} html - The raw HTML content to parse.
 * @returns {{
 *   title: string,
 *   metaDescription: string,
 *   h1Count: number,
 *   imagesMissingAlt: number,
 *   wordCount: number
 * }}
 */
export function parseHtmlMetrics(html) {
  const $ = cheerio.load(html || '');

  const title = $('title').text().trim() || 'No title found';
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    'No meta description found';
  const h1Count = $('h1').length;

  let imagesMissingAlt = 0;
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt.trim() === '') {
      imagesMissingAlt++;
    }
  });

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(' ').length : 0;

  return { title, metaDescription, h1Count, imagesMissingAlt, wordCount };
}
