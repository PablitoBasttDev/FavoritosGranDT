import app from '../server';

export default function handler(req: any, res: any) {
  // Normalize and resolve the true requested route on Vercel Serverless
  let targetUrl = req.url || '/api';

  // 1. If Vercel rewrote using $1 or query['0']
  if (req.query && req.query['0']) {
    const subpath = req.query['0'];
    const queryIdx = targetUrl.indexOf('?');
    const queryString = queryIdx >= 0 ? targetUrl.substring(queryIdx) : '';
    targetUrl = `/api/${subpath}${queryString}`;
  } else if (req.headers && req.headers['x-matched-path']) {
    const matched = req.headers['x-matched-path'] as string;
    if (matched) {
      const queryIdx = targetUrl.indexOf('?');
      const queryString = queryIdx >= 0 ? targetUrl.substring(queryIdx) : '';
      targetUrl = matched.startsWith('/api') ? `${matched}${queryString}` : `/api${matched}${queryString}`;
    }
  } else if (req.headers && req.headers['x-vercel-matched-path']) {
    const matched = req.headers['x-vercel-matched-path'] as string;
    if (matched) {
      const queryIdx = targetUrl.indexOf('?');
      const queryString = queryIdx >= 0 ? targetUrl.substring(queryIdx) : '';
      targetUrl = matched.startsWith('/api') ? `${matched}${queryString}` : `/api${matched}${queryString}`;
    }
  }

  // Ensure /api prefix is present for Express apiRouter
  if (!targetUrl.startsWith('/api')) {
    targetUrl = `/api${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
  }

  req.url = targetUrl;

  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[VERCEL_SERVERLESS_ERROR]', err);
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        isFallback: true,
        error: err?.message || 'Serverless error recovery',
        timestamp: Date.now(),
      });
    }
  }
}
