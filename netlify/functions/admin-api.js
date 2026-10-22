import { getStore } from "@netlify/blobs";

function isUID(uid) { return /^\d{6,15}$/.test(String(uid || '')); }
function isSOL(a) {
  if (!a) return false; a = a.trim();
  if (a.length < 32 || a.length > 44) return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
}

export default async (req) => {
  const store = getStore("IWASP_DB");
  const url = new URL(req.url);

  // GET Balance, Wallet, User Info
  if (req.method === 'GET') {
    const uid = url.searchParams.get('uid');
    if (!isUID(uid)) return new Response(JSON.stringify({ error: 'bad uid' }), { status: 400 });
    const user = await store.get(`user_${uid}`, { type: "json" }) || { balance: 0 };
    return new Response(JSON.stringify({
      balance: user.balance || 0,
      wallet: user.wallet || '',
      tasksDone: user.tasksDone || 0,
      refs: user.refs || 0,
      streak: user.streak || 0,
      memberSince: (user.joined || '').slice(0, 10)
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // POST Actions: saveWallet, dailyCheck
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const uid = body.uid;
      if (!isUID(uid)) return new Response(JSON.stringify({ error: 'bad uid' }), { status: 400 });
      
      let user = await store.get(`user_${uid}`, { type: "json" }) || { balance: 0, wallet: '' };

      if (body.action === 'saveWallet') {
        if (!isSOL(body.wallet)) return new Response(JSON.stringify({ error: 'Invalid SOL address' }), { status: 400 });
        user.wallet = body.wallet.trim();
        await store.setJSON(`user_${uid}`, user);
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
      }

      if (body.action === 'dailyCheck') {
        const today = new Date().toDateString();
        if (user.lastDaily === today) return new Response(JSON.stringify({ error: 'Already checked today' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        user.lastDaily = today;
        user.streak = (user.streak || 0) + 1;
        user.balance = (user.balance || 0) + 0.10;
        await store.setJSON(`user_${uid}`, user);
        return new Response(JSON.stringify({ message: `+ $0.10! Streak ${user.streak}`, streak: user.streak, newBalance: user.balance }), { headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response('ok', { status: 200 });
}
