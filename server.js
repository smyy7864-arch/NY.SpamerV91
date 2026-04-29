const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1499107460961796116/GWQRrPPOb6adYRynYQRR1AiIUqnQUg07DlYuewZrvgMCvYFpdPGRRnXL1MlpW608XVo6";

const VALID_CODES = {
    "NY2012": { name: "נהוראי (ADMIN)", credits: -1, role: "Admin" },
    "2012": { name: "אורח", credits: 10, role: "User" } // שונה ל-10 קרדיטים
};

app.post('/verify', async (req, res) => {
    const { code } = req.body;
    const userData = VALID_CODES[code];
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || "Unknown Device";

    if (userData) {
        try {
            await axios.post(DISCORD_WEBHOOK, {
                embeds: [{
                    title: "🚀 כניסה חדשה למערכת",
                    color: 0xff0000,
                    fields: [
                        { name: "👤 שם משתמש", value: userData.name, inline: true },
                        { name: "🔑 תפקיד", value: userData.role, inline: true },
                        { name: "💰 קרדיטים", value: userData.credits === -1 ? "ללא הגבלה" : userData.credits.toString(), inline: true },
                        { name: "🌐 כתובת IP", value: ip, inline: false },
                        { name: "📱 מכשיר", value: device, inline: false }
                    ],
                    footer: { text: "Spamer V9 Tracking" },
                    timestamp: new Date()
                }]
            });
        } catch (e) { console.log("Webhook error"); }

        const creditsDisplay = userData.credits === -1 ? "ללא הגבלה" : userData.credits;
        
        // יצירת ה-HTML של הפאנל עם השמות החדשים
        const panelHTML = `
            <div style="background: rgba(10, 10, 10, 0.98); border: 2px solid red; padding: 25px; border-radius: 15px; width: 280px; text-align: right; color: white; margin: auto; box-shadow: 0 0 20px rgba(255,0,0,0.5);">
                <h2 style="color: red; text-align: center; margin-bottom: 5px;">Spamer panel</h2>
                <p style="text-align: center; font-size: 12px; color: #888; margin-top: 0;">By Nehoray yosef</p>
                <div style="border-top: 1px solid #333; margin: 15px 0;"></div>
                <p>שלום, <span style="color: red;">${userData.name}</span></p>
                <p>קרדיטים: <span style="color: #0f0;">${creditsDisplay}</span></p>
                <input type="text" id="target" placeholder="מספר יעד" style="width: 100%; padding: 10px; background: #000; border: 1px solid #444; color: white; margin-bottom: 15px; border-radius: 5px;">
                <button onclick="alert('התקפה נשלחה!')" style="width: 100%; padding: 12px; background: red; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">הפעל התקפה</button>
                <div style="margin-top: 20px; display: flex; justify-content: center; gap: 15px; font-size: 11px;">
                    <a href="https://t.me/your_support" target="_blank" style="color: #888; text-decoration: none;">תמיכה ...</a>
                    ${userData.credits === -1 ? '<a href="#" style="color: #888; text-decoration: none;">מנהלים ...</a>' : ''}
                </div>
            </div>`;
        res.json({ success: true, html: panelHTML });
    } else {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
