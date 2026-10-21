// FILE 1 ONLY - SKELETON - Paste into GitHub netlify/functions/telegram.js
const BOT_TOKEN = process.env.BOT_TOKEN;
let users = global.users || (global.users = new Map());

function getUser(id) {
  if (!users.has(id)) users.set(id, { balance: 0, total: 0, wallet: null });
  return users.get(id);
}

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const msg = body.message;
  if (!msg) return { statusCode: 200, body: "ok" };
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || "";
  const user = getUser(userId);
  let reply = "";

  if (text.startsWith("/start")) {
    reply = `🔥 IWASP - BIBLE v4 LOCKED 60/10/30

/start - Welcome
/linkwallet TRC20 - Link wallet
/balance - Check $ 
/earn - Earn (Timewall coming tomorrow)
/daily - $0.10 daily (need 5 tasks)
/refer - Get $0.50 per friend
/withdraw - Min $5 (6th & 20th)

You have $${user.total.toFixed(2)}
First: /linkwallet YOUR_ADDRESS`;
  }
  else if (text.startsWith("/linkwallet")) {
    const wallet = text.split(" ")[1];
    if (!wallet) reply = "Use: /linkwallet TRC20ADDRESS";
    else { user.wallet = wallet; reply = `✅ Wallet linked: ${wallet.slice(0,6)}... Now /earn`; }
  }
  else if (text.startsWith("/balance")) {
    reply = `💼 Balance: $${user.total.toFixed(2)} (60% yours)\nWallet: ${user.wallet || "Not linked"}`;
  }
  else if (text.startsWith("/earn")) {
    reply = `🚀 Timewall link coming tomorrow after approval!\nFor now test: Your UID is ${userId}\nPostback will be: https://iwasp.netlify.app/.netlify/functions/postback?uid=${userId}&amount=0.30`;
  }
  else if (text.startsWith("/refer")) {
    reply = `👥 Your ref link: https://t.me/iwasp_bot?start=${userId}\nReward $0.50 when friend earns $2`;
  }
  else if (text.startsWith("/daily")) {
    reply = `📅 Daily $0.10 - Need 5 tasks/day - Coming tomorrow with Timewall`;
  }
  else if (text.startsWith("/withdraw")) {
    reply = `Withdraw min $5 - You have $${user.total.toFixed(2)} - Batch 6th & 20th via TRC20`;
  }
  else { reply = `Use /start`; }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: reply })
  });

  return { statusCode: 200, body: "ok" };
};
