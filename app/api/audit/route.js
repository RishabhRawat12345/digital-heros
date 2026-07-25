import { NextResponse } from 'next/server';
import { parseHtmlMetrics } from '../../../lib/parser.js';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      targetUrl = `https://${url}`;
    }

    // Measure response time
    const startTime = Date.now();

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'PagePulse-Auditor/1.0',
        },
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timed out after 10 seconds' }, { status: 408 });
      }
      return NextResponse.json({ error: 'Failed to fetch the URL. Please verify the URL and try again.' }, { status: 400 });
    }

    const responseTime = Date.now() - startTime;
    const status = response.status;
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      return NextResponse.json({
        error: 'Target URL did not return HTML content.',
        details: { status, contentType, responseTime }
      }, { status: 400 });
    }

    const html = await response.text();
    const { title, metaDescription, h1Count, imagesMissingAlt, wordCount } = parseHtmlMetrics(html);

    const report = {
      status,
      responseTime: `${responseTime}ms`,
      title,
      metaDescription,
      h1Count,
      imagesMissingAlt,
      wordCount
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('Audit Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during the audit.' }, { status: 500 });
  }
}
