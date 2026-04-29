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
let spamLogs = [];

async function sendToDiscord(title, desc, color = 0xff0000) {
    try {
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: title,
                description: desc,
                color: color,
                timestamp: new Date()
            }]
        });
    } catch (e) { console.log("Discord error"); }
}

// קבלת נתונים לאדמין
app.get('/admin/data', (req, res) => {
    res.json({ bannedIPs, bannedNumbers, spamLogs });
});

// הסרת חסימה
app.post('/admin/unban', (req, res) => {
    const { type, value } = req.body;
    if (type === 'ip') bannedIPs = bannedIPs.filter(i => i !== value);
    if (type === 'num') bannedNumbers = bannedNumbers.filter(n => n !== value);
    res.json({ success: true });
});

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "Unknown Device";

    if (!ipCredits[ip]) ipCredits[ip] = 10;

    if (code === "1312") {
        await sendToDiscord("✅ כניסה מוצלחת", `**IP:** ${ip}\n**מכשיר:** ${device}`, 0x00ff00);
        res.json({ success: true, credits: ipCredits[ip] });
    } else {
        await sendToDiscord("❌ קוד שגוי", `**הוזן:** ${code}\n**IP:** ${ip}`, 0xff0000);
        res.json({ success: false });
    }
});

app.post('/spam', async (req, res) => {
    const { target, amount } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (bannedIPs.includes(ip) || bannedNumbers.includes(target)) {
        return res.json({ success: false, message: "חסום!" });
    }

    spamLogs.push({ target, amount, ip, time: new Date().toLocaleTimeString() });
    if (spamLogs.length > 20) spamLogs.shift();

    await sendToDiscord("🚀 ספאם הופעל", `**יעד:** ${target}\n**כמות:** ${amount}\n**IP:** ${ip}`, 0x0000ff);
    res.json({ success: true });
});

app.post('/admin/action', (req, res) => {
    const { action, value, amount } = req.body;
    if (action === "banIP") bannedIPs.push(value);
    if (action === "banNum") bannedNumbers.push(value);
    if (action === "addCredits") ipCredits[value] = amount;
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
