const express = require('express');
const cors = require('cors');
const axios = require('axios'); // שים לב שכתוב axios
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

    if (userData) {
        try {
            await axios.post(DISCORD_WEBHOOK, { // גם כאן axios
                embeds: [{
                    title: "🚀 כניסה חדשה למערכת",
                    color: 0x00ff00,
                    fields: [
                        { name: "👤 משתמש", value: userData.name, inline: true },
                        { name: "🌐 IP", value: ip, inline: true }
                    ],
                    footer: { text: "NEHORAY SYSTEM V2" },
                    timestamp: new Date()
                }]
            });
        } catch (e) { console.log("Webhook error"); }

        const creditsDisplay = userData.credits === -1 ? "ללא הגבלה" : userData.credits;
        res.json({ 
            success: true, 
            html: `
            <div style="background: rgba(10, 10, 10, 0.98); border: 2px solid red; padding: 25px; border-radius: 15px; width: 280px; text-align: right; color: white; margin: auto;">
                <h2 style="color: red; text-align: center;">NEHORAY SYSTEM</h2>
                <p>שלום, <span style="color: red;">${userData.name}</span></p>
                <p>קרדיטים: <span style="color: #0f0;">${creditsDisplay}</span></p>
                <input type="text" id="target" placeholder="מספר יעד" style="width: 100%; padding: 10px; background: #000; border: 1px solid #444; color: white; margin-bottom: 15px;">
                <button onclick="alert('נשלח!')" style="width: 100%; padding: 12px; background: red; color: white; border: none; border-radius: 5px; font-weight: bold;">הפעל התקפה</button>
                <div style="margin-top: 20px; display: flex; justify-content: center; gap: 15px; font-size: 11px;">
                    <a href="#" style="color: #555; text-decoration: none;">תמיכה ...</a>
                    ${userData.credits === -1 ? '<a href="#" style="color: #555; text-decoration: none;">מנהלים ...</a>' : ''}
                </div>
            </div>` 
        });
    } else {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
