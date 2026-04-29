const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true); 
app.use(cors());
app.use(express.json());

// ה-Webhook האישי שלך
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6"; 

const VALID_CODES = {
    "NY2012": { name: "נהוראי (ADMIN)", credits: -1 },
    "2012": { name: "אורח", credits: 50 }
};

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const userData = VALID_CODES[code];
    
    // איסוף נתוני מכשיר ו-IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "לא ידוע";

    if (userData) {
        // שליחה מעוצבת לדיסקורד
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: "🔔 התחברות חדשה למערכת",
                color: 0xFF0000, // צבע אדום
                fields: [
                    { name: "👤 שם משתמש", value: `\`${userData.name}\``, inline: true },
                    { name: "🔑 קוד", value: `\`${code}\``, inline: true },
                    { name: "💳 קרדיטים", value: `\`${userData.credits === -1 ? 'ללא הגבלה' : userData.credits}\``, inline: true },
                    { name: "🌐 כתובת IP", value: `\`${ip}\``, inline: false },
                    { name: "📱 סוג מכשיר", value: `\`${device}\``, inline: false }
                ],
                footer: { text: "NEHORAY SYSTEM V2" },
                timestamp: new Date()
            }]
        }).catch(e => console.log("Discord Error"));

        const creditsDisplay = userData.credits === -1 ? "ללא הגבלה" : userData.credits;
        
        // שליחת הפאנל המעוצב ל-Acode
        const panelHTML = `
            <div style="width: 100%; max-width: 350px; margin: 0 auto; text-align: center;">
                <h1 style="color: red; font-size: 26px; margin-bottom: 5px;">NEHORAY SYSTEM V2</h1>
                <div style="width: 100%; height: 2px; background: red; margin-bottom: 20px;"></div>
                
                <div style="background: rgba(10, 10, 10, 0.95); border: 1px solid #333; padding: 20px; border-radius: 12px; text-align: right;">
                    <p style="font-size: 20px; margin: 0 0 5px 0;">שלום <span style="font-weight: bold;">${userData.name}</span></p>
                    <p style="font-size: 16px; margin: 0 0 20px 0;">קרדיטים שנותרו: <span style="color: #0f0; background: rgba(0,255,0,0.1); padding: 2px 8px; border-radius: 4px;">${creditsDisplay}</span></p>

                    <label style="font-size: 16px; display: block; margin-bottom: 8px;">מספר טלפון מטרה:</label>
                    <input type="text" id="target" placeholder="למשל: 0501234567" style="width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: white; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    <p style="font-size: 12px; color: #888; margin: 8px 0 20px 0;">קרדיט 1 = 35 שניות ספאם</p>

                    <label style="font-size: 16px; display: block; margin-bottom: 8px;">כמות קרדיטים לשימוש:</label>
                    <select id="usage" style="width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: white; border-radius: 8px; font-size: 16px; margin-bottom: 20px; appearance: none;">
                        <option value="1">1 קרדיט (35 שניות)</option>
                        <option value="2">2 קרדיטים (70 שניות)</option>
                        <option value="5">5 קרדיטים (חזק)</option>
                    </select>

                    <button onclick="startAttack()" id="sBtn" style="width: 100%; padding: 14px; background: red; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer;">הפעל התקפה</button>
                </div>
                <div style="margin-top: 15px; display: flex; justify-content: center; gap: 15px;">
                    <a href="https://discord.gg/YOUR_LINK" style="color: #666; text-decoration: none; font-size: 12px;">תמיכה</a>
                    ${userData.credits === -1 ? '<a href="#" style="color: #666; text-decoration: none; font-size: 12px;">מנהלים</a>' : ''}
                </div>
                <p id="status" style="margin-top: 15px; color: yellow; font-size: 13px;"></p>
            </div>
            <script>
                function startAttack() {
                    const n = document.getElementById('target').value;
                    const u = document.getElementById('usage').value;
                    if(!n) return alert('נא להזין מספר!');
                    document.getElementById('sBtn').disabled = true;
                    document.getElementById('sBtn').style.background = '#444';
                    document.getElementById('status').innerText = 'מבצע התקפה על ' + n + ' ל-' + (u * 35) + ' שניות...';
                }
            </script>
        `;
        res.json({ success: true, html: panelHTML });
    } else {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Live"));
