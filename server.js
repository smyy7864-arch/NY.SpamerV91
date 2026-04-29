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
            embeds: [{ title: title, description: desc, color: color, timestamp: new Date() }]
        });
    } catch (e) { console.log("Discord error"); }
}

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!ipCredits[ip]) ipCredits[ip] = 10;
    if (code === "1312") {
        res.json({ success: true, credits: ipCredits[ip] });
    } else { res.json({ success: false }); }
});

app.get('/admin/data', (req, res) => {
    res.json({ bannedIPs, bannedNumbers, ipCredits });
});

app.post('/admin/action', async (req, res) => {
    const { action, value, amount, targetIp } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (action === "banIP") bannedIPs.push(value);
    if (action === "unbanIP") bannedIPs = bannedIPs.filter(i => i !== value);
    if (action === "banNum") bannedNumbers.push(value);
    if (action === "unbanNum") bannedNumbers = bannedNumbers.filter(n => n !== value);
    if (action === "updateCredits") {
        if (amount.toLowerCase() === "limited") {
            ipCredits[targetIp] = "Unlimited";
        } else {
            let current = parseInt(ipCredits[targetIp] || 0);
            ipCredits[targetIp] = current + parseInt(amount);
        }
    }
    await sendToDiscord("👑 פעולת אדמין", `פעולה: ${action}\nערך: ${value || targetIp}\nבוצע ע"י: ${ip}`, 0xd4af37);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
