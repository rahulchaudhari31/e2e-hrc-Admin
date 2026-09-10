const BACKEND_URL = 'https://e2e-hrc-backend.onrender.com';

async function getBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

export default async function handler(req, res) {
  const action = req.query.action ? req.query.action.join('/') : '';
  const targetUrl = `${BACKEND_URL}/auth/${action}`;

  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const body = await getBody(req);

    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: body || undefined,
    });

    const text = await backendResponse.text();

    res.status(backendResponse.status);

    const setCookie = backendResponse.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(text || '{}');
  } catch (error) {
    console.error('Auth proxy error:', error.message);
    res.status(502).json({ message: 'Backend unreachable' });
  }
}

export const config = { api: { bodyParser: false } };
