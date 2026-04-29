const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6";

// בסיס נתונים לקרדיטים לפי IP
let ipCredits = {}; 

async function sendToDiscord(title, desc) {
    try {
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{ title: title, description: desc, color: 0xff0000, timestamp: new Date() }]
        });
    } catch (e) { console.log("Discord error"); }
}

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "Unknown Device";

    if (!ipCredits[ip]) { ipCredits[ip] = 10; }

    if (code === "1312") {
        await sendToDiscord("✅ כניסה למערכת", `משתמש מחובר.\n**IP:** ${ip}\n**מכשיר:** ${device}`);
        res.json({ success: true, credits: ipCredits[ip] });
    } else {
        await sendToDiscord("❌ קוד שגוי", `ניסיון כניסה עם קוד: **${code}**\n**IP:** ${ip}`);
        res.json({ success: false });
    }
});

// פונקציה להוספת קרדיטים (אדמין בלבד)
app.post('/admin/add-credits', async (req, res) => {
    const { adminCode, targetIp, amount } = req.body;
    const myIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (adminCode === "NY2012") {
        ipCredits[targetIp] = (amount.toLowerCase() === "limited") ? "ללא הגבלה" : parseInt(amount);
        await sendToDiscord("👑 פעולת אדמין", `הוספו קרדיטים ל-IP: **${targetIp}**\nכמות: **${amount}**\nבוצע ע"י: ${myIp}`);
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "קוד אדמין שגוי!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
