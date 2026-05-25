const express = require('express');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = 3500;
const dataPath = path.join(__dirname, 'data', 'db.json');

// ⚠️ REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
const CLIENT_ID = '82942474093-6eppuqvpc5aqcqlvgg80aispn39jm44d.apps.googleusercontent.com'; 
const client = new OAuth2Client(CLIENT_ID);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware לאימות הטוקן של גוגל
async function verifyUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        req.userEmail = payload.email; // שומרים את המייל של המשתמש בבקשה
        next(); // הטוקן תקין, ממשיכים לפעולה המבוקשת
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// פונקציית עזר לקריאת הנתונים - עכשיו מחזירה אובייקט במקום מערך
const readData = () => {
    if (!fs.existsSync(dataPath)) return {};
    const data = fs.readFileSync(dataPath);
    
    let parsedData = JSON.parse(data);
    // טיפול במקרה של קובץ ישן (אם הוא מערך, נהפוך אותו לאובייקט ריק)
    if (Array.isArray(parsedData)) parsedData = {}; 
    
    return parsedData;
};

// פונקציית עזר לשמירת הנתונים
const saveData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// שליפת הארוחות של המשתמש המחובר (GET)
app.get('/api/meals', verifyUser, (req, res) => {
    const db = readData();
    const userMeals = db[req.userEmail] || []; // שולף רק את הארוחות של המשתמש הספציפי
    res.json(userMeals);
});

// שמירת ארוחה חדשה למשתמש המחובר (POST)
app.post('/api/meals', verifyUser, (req, res) => {
    const db = readData();
    const newMeal = req.body;
    
    // אם אין עדיין נתונים למשתמש הזה, ניצור לו מערך ריק
    if (!db[req.userEmail]) {
        db[req.userEmail] = [];
    }
    
    db[req.userEmail].push(newMeal);
    saveData(db);
    
    res.status(201).json({ message: 'Meal saved successfully' });
});

// מחיקת ארוחה לפי ID של המשתמש המחובר (DELETE)
app.delete('/api/meals/:id', verifyUser, (req, res) => {
    const db = readData();
    
    if (db[req.userEmail]) {
        db[req.userEmail] = db[req.userEmail].filter(m => m.id !== parseInt(req.params.id));
        saveData(db);
    }
    
    res.json({ message: 'Meal deleted' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});