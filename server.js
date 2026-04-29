const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

// הכתובת המתוקנת שלך
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6";

const VALID_CODES = {
    "NY2012": { name: "נהוראי (ADMIN)", credits: -1 },
    "2012": { name: "אורח", credits: 50 }
};

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const userData = VALID_CODES[code];
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "Unknown Device";

    if (userData) {
        // שליחת התראה לדיסקורד
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: "🚀 כניסה חדשה למערכת",
                color: 0x00ff00,
                fields: [
                    { name: "👤 משתמש", value: `**${userData.name}**`, inline: true },
                    { name: "🌐 IP", value: `\`${ip}\``, inline: true },
                    { name: "📱 מכשיר", value: `\`${device}\``, inline: false }
                ],
                footer: { text: "NEHORAY SYSTEM V2" },
                timestamp: new Date()
            }]
        }).catch(e => console.log("Discord Error"));

        const creditsDisplay = userData.credits === -1 ? "ללא הגבלה" : userData.credits;

        // הפאנל המעוצב והקומפקטי
        const panelHTML = `
            <div style="background: rgba(10, 10, 10, 0.98); border: 2px solid red; padding: 25px; border-radius: 15px; width: 310px; text-align: right; color: white; box-shadow: 0 0 20px rgba(255,0,0,0.4); font-family: sans-serif;">
                <h2 style="color: red; text-align: center; margin: 0 0 10px 0; letter-spacing: 2px;">NEHORAY SYSTEM</h2>
                <div style="width: 100%; height: 1px; background: #333; margin-bottom: 20px;"></div>
                
                <p style="margin: 0; font-size: 16px;">שלום, <span style="color: red; font-weight: bold;">${userData.name}</span></p>
                <p style="margin: 5px 0 20px 0; font-size: 14px; color: #aaa;">קרדיטים: <span style="color: #0f0;">${creditsDisplay}</span></p>

                <label style="display: block; font-size: 12px; margin-bottom: 5px; color: #777;">מספר יעד:</label>
                <input type="text" id="target" placeholder="0500000000" style="width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: white; border-radius: 8px; margin-bottom: 15px; box-sizing: border-box;">

                <label style="display: block; font-size: 12px; margin-bottom: 5px; color: #777;">כמות קרדיטים:</label>
                <select id="usage" style="width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: white; border-radius: 8px; margin-bottom: 20px;">
                    <option value="1">1 קרדיט (35 שניות)</option>
                    <option value="2">2 קרדיטים (70 שניות)</option>
                    <option value="5">5 קרדיטים (VIP)</option>
                </select>

                <button onclick="start()" id="btn" style="width: 100%; padding: 15px; background: red; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s;">הפעל התקפה</button>
                
                <div style="margin-top: 20px; display: flex; justify-content: center; gap: 20px; font-size: 12px;">
                    <a href="#" style="color: #555; text-decoration: none;">תמיכה ...</a>
                    ${userData.credits === -1 ? '<a href="#" style="color: #555; text-decoration: none;">מנהלים ...</a>' : ''}
                </div>
                <p id="st" style="text-align: center; color: yellow; font-size: 12px; margin-top: 15px;"></p>
            </div>
            <script>
                function start() {
                    const t = document.getElementById('target').value;
                    if(!t) return alert('הכנס מספר!');
                    document.getElementById('btn').disabled = true;
                    document.getElementById('btn').style.opacity = '0.5';
                    document.getElementById('st').innerText = 'מריץ התקפה על ' + t + '...';
                }
            </script>
        `;
        res.json({ success: true, html: panelHTML });
    } else {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
