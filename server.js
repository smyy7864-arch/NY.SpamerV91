const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6";

// בסיס נתונים זמני לקרדיטים לפי IP
let ipCredits = {}; 

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "Unknown Device";

    // הגדרת קרדיטים ראשונית ל-IP חדש
    if (!ipCredits[ip]) { ipCredits[ip] = 10; }

    if (code === "1312") {
        await sendToDiscord("✅ כניסה מוצלחת", `משתמש נכנס עם קוד תקין.\n**IP:** ${ip}\n**מכשיר:** ${device}`);
        
        const panelHTML = `
            <div style="background: #0a0a0a; border: 2px solid red; padding: 20px; border-radius: 15px; width: 300px; color: white; position: relative; box-shadow: 0 0 20px rgba(255,0,0,0.5);">
                <div onclick="toggleMenu()" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 20px;">💣</div>
                
                <h2 style="color: red; text-align: center; margin: 0;">Spamer panel</h2>
                <p style="text-align: center; font-size: 11px; color: #888; margin-bottom: 15px;">By Nehoray yosef</p>
                
                <div id="menu-dropdown" style="display:none; background: #1a1a1a; border: 1px solid red; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <div onclick="alert('פנה לטלגרם: @YourUser')" style="cursor: pointer; padding: 5px; border-bottom: 1px solid #333;">🆘 תמיכה</div>
                    <div onclick="showAdmin()" style="cursor: pointer; padding: 5px; color: gold;">👑 אדמין</div>
                </div>

                <div id="main-interface">
                    <p>סטטוס: <span style="color: #0f0;">מחובר</span> | קרדיטים: <span id="credit-display" style="color: gold;">${ipCredits[ip]}</span></p>
                    <input type="text" id="target" placeholder="מספר יעד (05...)" style="width: 100%; padding: 10px; background: #000; border: 1px solid #444; color: white; margin-bottom: 10px; border-radius: 5px;">
                    <input type="number" id="amount" placeholder="כמות קרדיטים לספאם" style="width: 100%; padding: 10px; background: #000; border: 1px solid #444; color: white; margin-bottom: 15px; border-radius: 5px;">
                    <button onclick="startSpam()" style="width: 100%; padding: 12px; background: red; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">🚀 הפעל התקפה</button>
                    <p style="font-size: 10px; color: #666; margin-top: 10px; text-align: center;">קרדיט 1 = 35 שניות של הודעות</p>
                </div>

                <div id="admin-interface" style="display:none;">
                    <h3 style="color: gold; text-align: center; font-size: 14px;">בקרת מרכזית</h3>
                    <input type="text" id="admin-ip" placeholder="הכנס IP להוספה" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #000; color: white; border: 1px solid gold;">
                    <button onclick="addCreditsAdmin()" style="width: 100%; padding: 10px; background: gold; color: black; font-weight: bold; border: none; border-radius: 5px;">הוסף קרדיטים</button>
                    <button onclick="hideAdmin()" style="width: 100%; margin-top: 10px; background: transparent; color: #888; border: none;">חזור</button>
                </div>
            </div>`;
        res.json({ success: true, html: panelHTML });
    } else {
        await sendToDiscord("❌ ניסיון פריצה", `הוזן קוד שגוי: **${code}**\n**IP:** ${ip}\n**מכשיר:** ${device}`);
        res.json({ success: false });
    }
});

async function sendToDiscord(title, desc) {
    try {
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{ title: title, description: desc, color: 0xff0000, timestamp: new Date() }]
        });
    } catch (e) { console.log("Discord error"); }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
