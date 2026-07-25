'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to audit the URL');
      }

      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main>
        <h1 className="hero-title">Page Pulse</h1>
        <p className="hero-subtitle">Instantly audit any webpage. Get insights into performance, SEO, and accessibility in seconds.</p>
        
        <form className="search-container" onSubmit={handleAudit}>
          <input
            type="text"
            className="search-input"
            placeholder="Enter URL to audit (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading || !url}>
            {loading ? 'Auditing...' : 'Analyze'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {report && (
          <div className="report-card">
            <h2>Audit Results</h2>
            <div style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              <h3>{report.title}</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{report.metaDescription}</p>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">HTTP Status</div>
                <div className={`metric-value ${report.status >= 200 && report.status < 300 ? 'status-success' : 'status-error'}`}>
                  {report.status}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Response Time</div>
                <div className="metric-value">{report.responseTime}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">H1 Count</div>
                <div className={`metric-value ${report.h1Count === 1 ? 'status-success' : report.h1Count === 0 ? 'status-error' : ''}`}>
                  {report.h1Count}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Images Missing Alt</div>
                <div className={`metric-value ${report.imagesMissingAlt === 0 ? 'status-success' : 'status-error'}`}>
                  {report.imagesMissingAlt}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Word Count</div>
                <div className="metric-value">{report.wordCount}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>
          <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer">
            Built for Digital Heroes Training Task
          </a>
        </p>
      </footer>
    </>
  );
}
