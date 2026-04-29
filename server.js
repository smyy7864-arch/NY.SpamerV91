const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true); 
app.use(cors());
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6"; 

const VALID_CODES = {
    "NY2012": { name: "נהוראי (ADMIN)", credits: -1 },
    "2012": { name: "אורח", credits: 50 }
};

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const userData = VALID_CODES[code];
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "לא ידוע";

    if (userData) {
        // שליחה לדיסקורד
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: "🔔 התחברות חדשה",
                color: 0xFF0000,
                fields: [
                    { name: "👤 משתמש", value: `\`${userData.name}\``, inline: true },
                    { name: "🌐 IP", value: `\`${ip}\``, inline: true },
                    { name: "📱 מכשיר", value: `\`${device}\``, inline: false }
                ],
                timestamp: new Date()
            }]
        }).catch(e => {});

        const creditsDisplay = userData.credits === -1 ? "ללא הגבלה" : userData.credits;
        
        // --- כאן העיצוב החדש שביקשת (בתוך מלבן) ---
        const panelHTML = `
            <div style="background: rgba(15, 15, 15, 0.95); border: 2px solid red; padding: 25px; border-radius: 15px; width: 320px; box-shadow: 0 0 20px rgba(255, 0, 0, 0.2); text-align: right; color: white;">
                <h2 style="color: red; text-align: center; margin-top: 0; letter-spacing: 2px;">NEHORAY SYSTEM</h2>
                <div style="width: 100%; height: 1px; background: #333; margin-bottom: 20px;"></div>
                
                <p style="font-size: 18px; margin: 0;">שלום, <span style="color: red; font-weight: bold;">${userData.name}</span></p>
                <p style="font-size: 14px; color: #aaa; margin-top: 5px;">קרדיטים: <span style="color: #0f0;">${creditsDisplay}</span></p>

                <div style="margin-top: 25px;">
                    <label style="display: block; font-size: 14px; margin-bottom: 8px;">מספר טלפון יעד:</label>
                    <input type="text" id="target" placeholder="0500000000" style="width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: white; border-radius: 8px; box-sizing: border-box; text-align: center;">
                    
                    <p style="font-size: 11px; color: #777; margin: 8px 0;">קרדיט 1 = 35 שניות ספאם</p>

                    <label style="display: block; font-size: 14px; margin-bottom: 8px;">כמות קרדיטים לשימוש:</label>
                    <select id="usage" style="width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: white; border-radius: 8px; cursor: pointer;">
                        <option value="1">1 קרדיט (35 שניות)</option>
                        <option value="2">2 קרדיטים (70 שניות)</option>
                        <option value="5">5 קרדיטים (בוסט)</option>
                    </select>

                    <button onclick="startAttack()" id="sBtn" style="width: 100%; padding: 15px; background: red; color: white; border: none; border-radius: 8px; margin-top: 25px; font-weight: bold; cursor: pointer; font-size: 16px;">הפעל מתקפה</button>
                </div>
                
                <div style="margin-top: 20px; display: flex; justify-content: center; gap: 20px; font-size: 12px;">
                    <a href="#" style="color: #555; text-decoration: none;">תמיכה</a>
                    ${userData.credits === -1 ? '<a href="#" style="color: #555; text-decoration: none;">מנהלים</a>' : ''}
                </div>
                <p id="status" style="text-align: center; color: yellow; font-size: 12px; margin-top: 10px;"></p>
            </div>

            <script>
                function startAttack() {
                    const n = document.getElementById('target').value;
                    const u = document.getElementById('usage').value;
                    if(!n) return alert('נא להזין מספר!');
                    document.getElementById('sBtn').disabled = true;
                    document.getElementById('sBtn').style.background = '#333';
                    document.getElementById('status').innerText = 'מבצע התקפה על ' + n + ' ל-' + (u * 35) + ' שניות...';
                }
            </script>
        `;
        res.json({ success: true, html: panelHTML });
    } else {
        res.json({ success: false });
    }
});

app.listen(process.env.PORT || 3000);
