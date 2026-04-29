const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- "בנק" הקרדיטים (נשמר בזיכרון של השרת) ---
let database = {
    users: {
        "admin": { credits: -1 }, // -1 מסמל קרדיטים ללא הגבלה
    }
};

const CONFIG = {
    CODE1: "2012",      // קוד הכניסה לאתר שלך
    ADMIN_KEY: "NY2012"  // מפתח סודי שתשתמש בו בבוט הדיסקורד
};

// פונקציה שמייצרת את ה-HTML של הפאנל עם נתוני המשתמש
const getSpammerHTML = (username, credits) => {
    let creditText = credits === -1 ? "ללא הגבלה" : credits;
    return `
        <div style="text-align:right; direction:rtl; font-family:sans-serif;">
            <h2 style="color:red; border-bottom:2px solid red; padding-bottom:10px;">NEHORAY SYSTEM V2</h2>
            <p style="color:white; font-size:18px;">שלום <b>${username}</b></p>
            <p style="color:#0f0; font-size:16px;">קרדיטים שנותרו: <span style="background:#222; padding:2px 8px; border-radius:4px;">${creditText}</span></p>
            <hr style="border:0.5px solid #333; margin:20px 0;">
            
            <label style="color:#bbb; display:block; margin-bottom:5px;">מספר טלפון מטרה:</label>
            <input type="text" id="targetNum" placeholder="למשל: 0501234567" 
                style="width:100%; padding:12px; margin-bottom:15px; background:#111; color:#0f0; border:1px solid #444; border-radius:8px; outline:none;">
            
            <button onclick="startSpam()" id="btn" 
                style="width:100%; padding:15px; background:linear-gradient(to bottom, #ff0000, #990000); color:white; border:none; font-weight:bold; cursor:pointer; border-radius:8px; text-shadow:1px 1px 2px #000;">
                הפעל התקפה (35 שניות)
            </button>
            
            <p id="status" style="font-size:14px; margin-top:15px; text-align:center; color:gray;"></p>
        </div>
        <script>
            async function startSpam() {
                const num = document.getElementById('targetNum').value;
                const status = document.getElementById('status');
                const btn = document.getElementById('btn');
                
                if(!num || num.length < 9) return alert('נא להכניס מספר טלפון תקין!');
                
                btn.disabled = true;
                btn.style.opacity = "0.5";
                status.innerText = "ההתקפה החלה... שולח חבילות למספר " + num;
                status.style.color = "yellow";
                
                // כאן יבוא בעתיד הקוד שמפעיל את הבוטים האמיתיים שלך
                setTimeout(() => {
                    status.innerText = "ההתקפה הסתיימה בהצלחה!";
                    status.style.color = "#0f0";
                    btn.disabled = false;
                    btn.style.opacity = "1";
                }, 35000);
            }
        </script>
    `;
};

// נתיב לבדיקת קוד כניסה (מה שהאתר ב-Acode ישלח)
app.post('/verify', (req, res) => {
    const { code, username } = req.body;
    const finalUser = username || "Guest";

    if (code === CONFIG.CODE1) {
        // אם המשתמש לא קיים בבנק, ניצור אותו עם 0 קרדיטים
        if (!database.users[finalUser]) {
            database.users[finalUser] = { credits: 0 };
        }
        const user = database.users[finalUser];
        res.json({ 
            success: true, 
            html: getSpammerHTML(finalUser, user.credits)
        });
    } else {
        res.json({ success: false, message: "הקוד שהזנת שגוי" });
    }
});

// נתיב לניהול המשתמשים (לשימוש בבוט הדיסקורד שלך)
app.post('/admin/manage', (req, res) => {
    const { key, targetUser, action, amount } = req.body;
    
    // בדיקת אבטחה שהבקשה מגיעה ממך (מהבוט)
    if (key !== CONFIG.ADMIN_KEY) return res.status(401).json({ error: "No Access" });

    if (!database.users[targetUser]) database.users[targetUser] = { credits: 0 };

    if (action === "add") database.users[targetUser].credits += (amount || 0);
    if (action === "remove") database.users[targetUser].credits -= (amount || 0);
    if (action === "set_unlimited") database.users[targetUser].credits = -1;
    if (action === "reset") database.users[targetUser].credits = 0;

    res.json({ 
        success: true, 
        user: targetUser,
        newBalance: database.users[targetUser].credits 
    });
});

// הפעלת השרת על הפורט של Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('--- NEHORAY SERVER IS ONLINE ON PORT ' + PORT + ' ---'));
