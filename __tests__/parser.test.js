import { parseHtmlMetrics } from '../lib/parser.js';

// ---------------------------------------------------------------------------
// Happy Path
// ---------------------------------------------------------------------------
describe('parseHtmlMetrics – happy path', () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Awesome Page</title>
        <meta name="description" content="A great page about things." />
      </head>
      <body>
        <h1>Main Heading</h1>
        <p>Hello world this is some text</p>
        <img src="photo.jpg" alt="A nice photo" />
        <img src="logo.png" alt="Site logo" />
      </body>
    </html>
  `;

  it('extracts the page title', () => {
    const result = parseHtmlMetrics(html);
    expect(result.title).toBe('My Awesome Page');
  });

  it('extracts the meta description', () => {
    const result = parseHtmlMetrics(html);
    expect(result.metaDescription).toBe('A great page about things.');
  });

  it('counts one H1', () => {
    const result = parseHtmlMetrics(html);
    expect(result.h1Count).toBe(1);
  });

  it('reports zero images missing alt text', () => {
    const result = parseHtmlMetrics(html);
    expect(result.imagesMissingAlt).toBe(0);
  });

  it('counts words in the body', () => {
    const result = parseHtmlMetrics(html);
    // "Main Heading Hello world this is some text" = 8 words
    expect(result.wordCount).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Failure Case 1 – Empty / blank HTML input
// ---------------------------------------------------------------------------
describe('parseHtmlMetrics – empty HTML input', () => {
  it('returns fallback title for empty string', () => {
    const result = parseHtmlMetrics('');
    expect(result.title).toBe('No title found');
  });

  it('returns fallback description for empty string', () => {
    const result = parseHtmlMetrics('');
    expect(result.metaDescription).toBe('No meta description found');
  });

  it('reports 0 h1 tags for empty string', () => {
    const result = parseHtmlMetrics('');
    expect(result.h1Count).toBe(0);
  });

  it('reports 0 images missing alt for empty string', () => {
    const result = parseHtmlMetrics('');
    expect(result.imagesMissingAlt).toBe(0);
  });

  it('reports 0 word count for empty string', () => {
    const result = parseHtmlMetrics('');
    expect(result.wordCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Failure Case 2 – Page with bad SEO (missing/empty alt tags, multiple H1s,
//                  no title, no meta description)
// ---------------------------------------------------------------------------
describe('parseHtmlMetrics – bad-SEO page', () => {
  const badHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <!-- No title, no meta description -->
      </head>
      <body>
        <h1>First Heading</h1>
        <h1>Second Heading – duplicate!</h1>
        <!-- Images with missing or empty alt attributes -->
        <img src="a.jpg" />
        <img src="b.jpg" alt="" />
        <img src="c.jpg" alt="   " />
        <!-- One correctly alt-tagged image -->
        <img src="d.jpg" alt="Good image" />
      </body>
    </html>
  `;

  it('returns fallback title when <title> is absent', () => {
    const result = parseHtmlMetrics(badHtml);
    expect(result.title).toBe('No title found');
  });

  it('returns fallback description when meta description is absent', () => {
    const result = parseHtmlMetrics(badHtml);
    expect(result.metaDescription).toBe('No meta description found');
  });

  it('counts two H1 elements correctly', () => {
    const result = parseHtmlMetrics(badHtml);
    expect(result.h1Count).toBe(2);
  });

  it('flags three images as missing alt text (missing, empty, whitespace-only)', () => {
    const result = parseHtmlMetrics(badHtml);
    expect(result.imagesMissingAlt).toBe(3);
  });
});
