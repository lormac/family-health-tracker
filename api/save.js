// api/save.js  — stores one user's data in Vercel KV
// Vercel KV is a Redis-compatible store — add it in your Vercel dashboard under Storage

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pin, data } = req.body;
  if (!pin || !/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'Invalid PIN' });

  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(`user:${pin}`, JSON.stringify(data));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('KV save error:', e);
    return res.status(500).json({ error: 'Save failed', detail: e.message });
  }
}
