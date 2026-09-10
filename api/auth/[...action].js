const BACKEND_URL = process.env.BACKEND_URL || 'https://e2e-hrc-backend.onrender.com';

export default async function handler(req, res) {
  const action = req.query.action ? req.query.action.join('/') : '';
  const targetUrl = `${BACKEND_URL}/auth/${action}`;

  try {
    const headers = { 'Content-Type': 'application/json' };

    const fetchOptions = {
      method: req.method,
      headers,
      credentials: 'include',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const backendResponse = await fetch(targetUrl, fetchOptions);
    const data = await backendResponse.text();

    res.status(backendResponse.status);

    const setCookies = backendResponse.headers.getSetCookie?.() || [];
    if (setCookies.length > 0) {
      setCookies.forEach((cookie) => res.setHeader('Set-Cookie', cookie));
    }

    const contentType = backendResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json');
    } else {
      res.setHeader('Content-Type', contentType || 'application/json');
    }

    res.send(data);
  } catch (error) {
    console.error('Auth proxy error:', error);
    res.status(500).json({ message: 'Proxy error: Could not reach backend' });
  }
}
