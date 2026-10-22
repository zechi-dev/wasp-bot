import { getStore } from "@netlify/blobs";

const ok = () => new Response('ok', { status: 200 });

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('IWASP V7 Bot Live - /bot', { status: 200 });
  }
  try {
    const body = await req.json();
    const msg = body.message;
    if (!msg?.from) return ok();

    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) return ok();

    const uid = String(msg.from.id);
    if (!/^\d{6,15}$/.test(uid)) return ok();

    // Save to IWASP_DB Blob
    try {
      const store = getStore("IWASP_DB");
      const existing = await store.get(`user_${uid}`, { type: "json" }) || {};
      await store.setJSON(`user_${uid}`, {
        uid,
        username: msg.from.username || '',
        first_name: msg.from.first_name || '',
        joined: existing.joined || new Date().toISOString(),
        last_seen: new Date().toISOString(),
        balance: existing.balance ?? 0,
        wallet: existing.wallet || '',
        tasksDone: existing.tasksDone || 0,
        streak: existing.streak || 0
      });
    } catch (e) {
      console.log('blob error:', e.message);
    }

    const text = (msg.text || '').trim();
    const reply = text.startsWith('/start')
      ? `🐝 Welcome to IWASP Mature!\n\nYour UID: ${uid}\n\n💰 Earn up to $20/task\n✅ Daily Check: $0.10\n👥 Referral: $0.25\n\nTap below to open App:`
      : `🐝 IWASP Bot\n\n/start - Open App\n/balance - Check Balance\n\nYour UID: ${uid}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: reply,
        reply_markup: {
          inline_keyboard: [[{ text: "🚀 Open IWASP App", web_app: { url: "https://iwasp.netlify.app" } }]]
        }
      })
    });

    return ok();
  } catch (e) {
    console.log(e);
    return ok();
  }
}
