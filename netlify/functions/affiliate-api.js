import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("IWASP_DB");
  const url = new URL(req.url);

  if (req.method === 'POST') {
    const body = await req.json();
    const { action, email, password, token, adminEmail } = body;

    if (action === 'invite') {
      if (adminEmail !== process.env.ADMIN_EMAIL) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      const inviteToken = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      await store.setJSON(`affiliate_invite_${inviteToken}`, { email, created: Date.now() });
      await store.setJSON(`affiliate_${email}`, { email, token: inviteToken, password: '', earnings: 0, referrals: 0, created: Date.now() });
      const link = `https://iwasp.netlify.app/affiliate.html?token=${inviteToken}&email=${encodeURIComponent(email)}`;
      return new Response(JSON.stringify({ ok: true, link }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (action === 'setPassword') {
      if (!token || !password) return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
      const invite = await store.get(`affiliate_invite_${token}`, { type: "json" });
      if (!invite) return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 400 });
      let aff = await store.get(`affiliate_${invite.email}`, { type: "json" }) || {};
      aff.password = password;
      aff.activated = true;
      await store.setJSON(`affiliate_${invite.email}`, aff);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (req.method === 'GET') {
    const email = url.searchParams.get('email');
    const aff = await store.get(`affiliate_${email}`, { type: "json" }) || {};
    return new Response(JSON.stringify(aff), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('ok', { status: 200 });
}
