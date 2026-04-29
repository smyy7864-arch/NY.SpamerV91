const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

// ה-Webhook שלך לדיסקורד
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6";

let ipCredits = {}; 
let bannedIPs = []; 
let bannedNumbers = []; 

async function sendToDiscord(title, desc, color = 0xff0000) {
    try {
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{ title: title, description: desc, color: color, timestamp: new Date() }]
        });
    } catch (e) { console.log("Discord error"); }
}

// אימות כניסה ושליחת התראה לדיסקורד
app.post('/verify', async (req, res) => {
    const { code, device } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (!ipCredits[ip]) ipCredits[ip] = 10;

    if (code === "1312") {
        await sendToDiscord("✅ כניסה מוצלחת למערכת", `**IP:** ${ip}\n**מכשיר:** ${device}`, 0x00ff00);
        res.json({ success: true, credits: ipCredits[ip] });
    } else {
        await sendToDiscord("❌ קוד אימות שגוי", `**הוזן:** ${code}\n**IP:** ${ip}\n**מכשיר:** ${device}`, 0xff0000);
        res.json({ success: false });
    }
});

// לוג תמיכה
app.post('/support-log', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await sendToDiscord("🆘 משתמש נכנס לתמיכה", `**IP:** ${ip}`, 0xffff00);
    res.json({ success: true });
});

// לוג ניסיון אדמין
app.post('/admin-log', async (req, res) => {
    const { code, success, device } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const title = success ? "👑 כניסה מוצלחת לאדמין" : "⚠️ ניסיון פריצה לאדמין";
    await sendToDiscord(title, `**קוד שניסה:** ${code}\n**IP:** ${ip}\n**מכשיר:** ${device}`, success ? 0xd4af37 : 0xffa500);
    res.json({ success: true });
});

// בדיקת ספאם וחסימות
app.post('/spam-check', async (req, res) => {
    const { target, amount, device } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (bannedIPs.includes(ip)) {
        await sendToDiscord("🚫 ניסיון ספאם מ-IP חסום", `**IP:** ${ip}\n**יעד:** ${target}`, 0x555555);
        return res.json({ success: false, message: "ה-IP שלך חסום לשימוש!" });
    }
    if (bannedNumbers.includes(target)) {
        await sendToDiscord("🚫 ניסיון ספאם למספר מוגן", `**יעד:** ${target}\n**IP:** ${ip}`, 0x555555);
        return res.json({ success: false, message: "המספר הזה חסום במערכת!" });
    }

    await sendToDiscord("🚀 התקפת ספאם יצאה", `**יעד:** ${target}\n**כמות:** ${amount}\n**IP:** ${ip}\n**מכשיר:** ${device}`, 0x0000ff);
    res.json({ success: true });
});

// ניהול אדמין
app.get('/admin/data', (req, res) => res.json({ bannedIPs, bannedNumbers }));

app.post('/admin/action', (req, res) => {
    const { action, value, amount, targetIp } = req.body;
    if (action === "banIP") bannedIPs.push(value);
    if (action === "unbanIP") bannedIPs = bannedIPs.filter(i => i !== value);
    if (action === "banNum") bannedNumbers.push(value);
    if (action === "unbanNum") bannedNumbers = bannedNumbers.filter(n => n !== value);
    if (action === "updateCredits") {
        if (amount.toLowerCase() === "limited") ipCredits[targetIp] = "Unlimited";
        else {
            let current = parseInt(ipCredits[targetIp] || 0);
            ipCredits[targetIp] = current + parseInt(amount);
        }
    }
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server Running'));
