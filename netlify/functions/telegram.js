exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, body: 'Bot is running!' };
  }
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const body = JSON.parse(event.body || '{}');
  const chatId = body.message?.chat?.id;
  const text = body.message?.text;
  if (chatId) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text ? `Working! You said: ${text}` : 'Bot is live! 🎉 Type /start' })
    });
  }
  return { statusCode: 200, body: 'OK' };
};
