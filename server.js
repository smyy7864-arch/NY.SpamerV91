const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6";

let ipCredits = {}; 
let bannedIPs = []; 
let bannedNumbers = []; 

async function sendToDiscord(title, desc, color = 0xff0000) {
    try {
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: title,
                description: desc,
                color: color,
                timestamp: new Date(),
                footer: { text: "Spamer V9 Monitor" }
            }]
        });
    } catch (e) { console.log("Discord error"); }
}

// אימות כניסה
app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "Unknown Device";

    if (!ipCredits[ip]) { ipCredits[ip] = 10; }

    if (code === "1312") {
        await sendToDiscord("✅ כניסה מוצלחת למערכת", `**IP:** ${ip}\n**מכשיר:** ${device}\n**קרדיטים:** ${ipCredits[ip]}`, 0x00ff00);
        res.json({ success: true, credits: ipCredits[ip] });
    } else {
        await sendToDiscord("❌ ניסיון כניסה נכשל (קוד שגוי)", `**הוזן קוד:** ${code}\n**IP:** ${ip}\n**מכשיר:** ${device}`, 0xff0000);
        res.json({ success: false });
    }
});

// התראת תמיכה
app.post('/support-clicked', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await sendToDiscord("🆘 משתמש לחץ על תמיכה", `המשתמש ביקש עזרה.\n**IP:** ${ip}`, 0xffff00);
    res.json({ success: true });
});

// התראת ניסיון כניסה לאדמין
app.post('/admin-attempt', async (req, res) => {
    const { code, success } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const title = success ? "👑 כניסה מוצלחת לאדמין" : "⚠️ ניסיון פריצה לאדמין";
    const color = success ? 0xd4af37 : 0xffa500;
    
    await sendToDiscord(title, `**קוד שהוקלד:** ${code}\n**IP:** ${ip}`, color);
    res.json({ success: true });
});

// הפעלת ספאם
app.post('/spam', async (req, res) => {
    const { target, amount } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "Unknown Device";

    if (bannedIPs.includes(ip) || bannedNumbers.includes(target)) {
        await sendToDiscord("🚫 ניסיון ספאם חסום", `**IP:** ${ip}\n**יעד:** ${target}`, 0x555555);
        return res.json({ success: false, message: "גישה חסומה!" });
    }

    await sendToDiscord("🚀 התקפת ספאם יצאה לדרך", `**יעד:** ${target}\n**קרדיטים:** ${amount}\n**זמן משוער:** ${amount * 35} שניות\n**IP:** ${ip}\n**מכשיר:** ${device}`, 0x0000ff);
    res.json({ success: true });
});

app.post('/admin/action', (req, res) => {
    const { action, value, amount } = req.body;
    if (action === "banIP") bannedIPs.push(value);
    if (action === "banNum") bannedNumbers.push(value);
    if (action === "addCredits") ipCredits[value] = (amount === "Limited") ? "ללא הגבלה" : parseInt(amount);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
