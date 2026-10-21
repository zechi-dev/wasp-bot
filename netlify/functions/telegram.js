const BOT_TOKEN = process.env.BOT_TOKEN;
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const msg = body.message;
  if (!msg) return { statusCode: 200, body: "ok" };
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || "";
  const webAppUrl = `https://iwasp.netlify.app?uid=${userId}`;

  let replyText = "";
  if (text.startsWith("/start")) {
    replyText = `🔥 Welcome to IWASP!\n\n💰 Get Paid To Do Surveys & Games\n👇 Click below to open INSIDE Telegram`;
  } else {
    replyText = `👇 Open IWASP Dashboard inside Telegram:`;
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      chat_id: chatId, 
      text: replyText,
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🚀 Open IWASP App",
            web_app: { url: webAppUrl }
          }
        ]]
      }
    })
  });
  return { statusCode: 200, body: "ok" };
};
