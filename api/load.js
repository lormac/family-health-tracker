// api/load.js  — loads one user's data from Vercel KV

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { pin } = req.query;
  if (!pin || !/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'Invalid PIN' });

  try {
    const { kv } = await import('@vercel/kv');
    const raw = await kv.get(`user:${pin}`);
    if (!raw) return res.status(404).json({ error: 'No data found for this PIN' });
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error('KV load error:', e);
    return res.status(500).json({ error: 'Load failed', detail: e.message });
  }
}
