const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const app = express();
app.use(express.json());

let db = { users: {} };
try { db = JSON.parse(fs.readFileSync('./db.json')); } catch(e){}

function save(){
  fs.writeFileSync('./db.json', JSON.stringify(db));
}

app.get('/api/balance/:id', (req,res)=>{
  const u = db.users[req.params.id] || {balance:0};
  res.json(u);
});

app.post('/webhook/timewall', (req,res)=>{
  console.log("Timewall:", req.body);
  res.send("OK");
});

const token = process.env.BOT_TOKEN;
let bot;
if(token){
  bot = new TelegramBot(token);
  const url = process.env.RENDER_EXTERNAL_URL;
  if(url){
    app.post(`/bot${token}`, (req,res)=>{
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });
    bot.setWebHook(`${url}/bot${token}`).then(()=>console.log("Webhook set"));
  }
  bot.onText(/\/start/, (msg)=>{
    const userId = msg.from.id.toString();
    const ref = msg.text.split(' ')[1];
    if(!db.users[userId]){
      db.users[userId] = {balance:0, refBy: ref || null};
      save();
    }
    const netlifyUrl = process.env.NETLIFY_URL || "https://your-link.netlify.app";
    const link = `${netlifyUrl}?user_id=${userId}`;
    bot.sendMessage(msg.chat.id, `🐝 Welcome to WASP!\n\nSting offers & earn 60% per offer.\n\nYour ID: ${userId}\nBalance: $${(db.users[userId].balance||0).toFixed(2)}`, {
      reply_markup: {
        inline_keyboard: [[{text:"🚀 Open WASP App", web_app:{url:link}}]]
      }
    });
  });
}

app.get('/', (req,res)=> res.send("WASP Backend Running Free"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("WASP Server on "+PORT));
