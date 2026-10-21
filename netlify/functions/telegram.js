exports.handler = async (event) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'Bot is running!' };
  }

  try {
    const body = JSON.parse(event.body);
    const message = body.message;
    if (!message) return { statusCode: 200, body: 'ok' };

    const chatId = message.chat.id;
    const text = message.text || '';

    let replyText = '';

    if (text === '/start') {
      replyText = 'Welcome to IWASP bot! 🎉\n\nYour bot is now live on Netlify!\n\nType /help for commands.';
    } else if (text === '/help') {
      replyText = 'Available commands:\n/start - Start bot\n/help - Help';
    } else {
      replyText = `You said: ${text}\n\nBot is working on Netlify! ✅`;
    }

    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText
      })
    });

    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    return { statusCode: 200, body: 'ok' };
  }
};
