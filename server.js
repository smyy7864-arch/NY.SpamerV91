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
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: "🔔 התחברות למערכת",
                color: 0xFF0000,
                fields: [
                    { name: "👤 משתמש", value: `\`${userData.name}\``, inline: true },
                    { name: "🌐 IP", value: `\`${ip}\``, inline: true }
                ],
                timestamp: new Date()
            }]
        }).catch(e => {});

        const creditsDisplay = userData.credits === -1 ? "ללא הגבלה" : userData.credits;
        
        // פאנל מוקטן יותר עם 3 נקודות
        const panelHTML = `
            <div style="background: rgba(10, 10, 10, 0.98); border: 1px solid red; padding: 20px; border-radius: 12px; width: 290px; text-align: right; color: white; box-shadow: 0 0 15px rgba(255,0,0,0.3);">
                <h3 style="color: red; text-align: center; margin: 0 0 15px 0; font-size: 20px;">NEHORAY SYSTEM V2</h3>
                
                <p style="font-size: 16px; margin: 0;">שלום, <span style="font-weight: bold;">${userData.name}</span></p>
                <p style="font-size: 13px; color: #aaa; margin: 5px 0 15px 0;">קרדיטים: <span style="color: #0f0;">${creditsDisplay}</span></p>

                <input type="text" id="target" placeholder="מספר מטרה" style="width: 100%; padding: 10px; background: #000; border: 1px solid #333; color: white; border-radius: 5px; box-sizing: border-box;">
                <p style="font-size: 10px; color: #666; margin: 5px 0;">קרדיט 1 = 35 שניות</p>

                <select id="usage" style="width: 100%; padding: 10px; background: #000; border: 1px solid #333; color: white; border-radius: 5px; margin-bottom: 15px;">
                    <option value="1">1 קרדיט</option>
                    <option value="2">2 קרדיטים</option>
                    <option value="5">5 קרדיטים</option>
                </select>

                <button onclick="startAttack()" id="sBtn" style="width: 100%; padding: 12px; background: red; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">הפעל התקפה</button>
                
                <div style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 11px;">
                    <a href="#" style="color: #444; text-decoration: none;">תמיכה ...</a>
                    ${userData.credits === -1 ? '<a href="#" style="color: #444; text-decoration: none;">מנהלים ...</a>' : ''}
                </div>
                <p id="status" style="text-align: center; color: yellow; font-size: 11px; margin-top: 10px;"></p>
            </div>

            <script>
                function startAttack() {
                    const n = document.getElementById('target').value;
                    if(!n) return alert('נא להזין מספר!');
                    document.getElementById('sBtn').disabled = true;
                    document.getElementById('status').innerText = 'מתקיף את ' + n + '...';
                }
            </script>
        `;
        res.json({ success: true, html: panelHTML });
    } else {
        res.json({ success: false });
    }
});

app.listen(process.env.PORT || 3000);
