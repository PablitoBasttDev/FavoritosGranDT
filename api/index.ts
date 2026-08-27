import app from '../server';

export default function handler(req: any, res: any) {
  // If Vercel passed original matched path in headers or environment
  if (req.headers && req.headers['x-matched-path']) {
    const matched = req.headers['x-matched-path'] as string;
    if (matched && matched.startsWith('/api') && req.url === '/api') {
      const queryIdx = (req.url || '').indexOf('?');
      const queryString = queryIdx >= 0 ? (req.url as string).substring(queryIdx) : '';
      req.url = matched + queryString;
    }
  }

  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Serverless unhandled handler error:', err);
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        isFallback: true,
        error: err?.message || 'Serverless fallback response',
        timestamp: Date.now(),
      });
    }
  }
}
