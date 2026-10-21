const BOT_TOKEN = process.env.BOT_TOKEN;
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const msg = body.message;
  if (!msg) return { statusCode: 200, body: "ok" };
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || "";

  let reply = "";
  if (text.startsWith("/start")) {
    reply = `🔥 Welcome to IWASP!

Click to start earning:
👉 https://iwasp.netlify.app?uid=${userId}

$5 min payout via USDT TRC20`;
  } else if (text.startsWith("/linkwallet")) {
    reply = `Link wallet inside website:
👉 https://iwasp.netlify.app?uid=${userId}

Go to Wallet section`;
  } else {
    reply = `Open IWASP Dashboard:
👉 https://iwasp.netlify.app?uid=${userId}`;
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: reply })
  });
  return { statusCode: 200, body: "ok" };
};
