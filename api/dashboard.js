// api/dashboard.js  — returns today's summary for all registered users

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { kv } = await import('@vercel/kv');

    // Get the member registry (set by admin)
    const membersRaw = await kv.get('members');
    if (!membersRaw) return res.status(200).json({ ok: true, members: [] });

    const members = typeof membersRaw === 'string' ? JSON.parse(membersRaw) : membersRaw;
    const today = new Date().toLocaleDateString('en-CA');

    const summaries = await Promise.all(members.map(async (member) => {
      try {
        const raw = await kv.get(`user:${member.pin}`);
        if (!raw) return { ...member, hasData: false };
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const todayFood = (data.foodLog || []).filter(e => e.date === today);
        const totals = todayFood.reduce((a, e) => {
          a.calories += e.calories || 0;
          a.protein  += e.protein  || 0;
          a.carbs    += e.carbs    || 0;
          a.fat      += e.fat      || 0;
          return a;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Latest weight
        const sorted = [...(data.weightLog || [])].sort((a, b) => b.date.localeCompare(a.date));
        const latestWeight = sorted[0]?.val || null;

        // Latest blood sugar
        const sugarSorted = [...(data.sugarLog || [])].sort((a, b) => b.date.localeCompare(a.date));
        const latestSugar = sugarSorted[0] || null;

        // Today's exercise
        const todayEx = (data.exerciseLog || []).filter(e => e.date === today);
        const totalBurned = todayEx.reduce((a, e) => a + (e.burned || 0), 0);

        return {
          ...member,
          hasData: true,
          totals: {
            calories: Math.round(totals.calories),
            protein:  Math.round(totals.protein),
            carbs:    Math.round(totals.carbs),
            fat:      Math.round(totals.fat),
          },
          goals: data.goals || {},
          latestWeight,
          latestSugar,
          totalBurned,
          exerciseCount: todayEx.length,
        };
      } catch (e) {
        return { ...member, hasData: false };
      }
    }));

    return res.status(200).json({ ok: true, members: summaries, today });
  } catch (e) {
    console.error('Dashboard error:', e);
    return res.status(500).json({ error: 'Dashboard failed', detail: e.message });
  }
}
