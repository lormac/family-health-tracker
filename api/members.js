// api/members.js  — GET returns member list, POST sets members (admin PIN required)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { kv } = await import('@vercel/kv');

  if (req.method === 'GET') {
    const raw = await kv.get('members');
    const members = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    // Return members without PINs for public dashboard
    return res.status(200).json({ ok: true, members: members.map(m => ({ name: m.name, color: m.color, avatar: m.avatar })) });
  }

  if (req.method === 'POST') {
    const { adminPin, members } = req.body;
    const ADMIN_PIN = process.env.ADMIN_PIN || '0000';
    if (adminPin !== ADMIN_PIN) return res.status(403).json({ error: 'Wrong admin PIN' });
    if (!Array.isArray(members)) return res.status(400).json({ error: 'members must be array' });
    await kv.set('members', JSON.stringify(members));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
