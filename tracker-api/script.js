const API_URL = '/api/meals';

// שולפים את הטוקן מהזיכרון של הדפדפן אם הוא קיים
let googleToken = localStorage.getItem('google_token');

window.onload = function () {
    // אתחול מערכת ההתחברות של גוגל
    google.accounts.id.initialize({
        client_id: "82942474093-6eppuqvpc5aqcqlvgg80aispn39jm44d.apps.googleusercontent.com", // <--- הדבק את ה-Client ID שלך כאן!
        callback: handleCredentialResponse
    });
    
    // ציור הכפתור
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "filled_black", size: "large", shape: "pill" } // עיצוב שחור שמתאים לאתר שלך
    );
};

// פונקציה שמופעלת ברגע שהמשתמש מתחבר בהצלחה
// פונקציה שמופעלת ברגע שהמשתמש מתחבר בהצלחה
async function handleCredentialResponse(response) {
    googleToken = response.credential;
    localStorage.setItem('google_token', googleToken);
    
    // משיכת ההגדרות האישיות מהשרת מיד לאחר ההתחברות
    await loadMenuSettings();
    alert("✅ התחברת בהצלחה והתפריט שלך נטען!");
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "82942474093-6eppuqvpc5aqcqlvgg80aispn39jm44d.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "filled_black", size: "large", shape: "pill" } 
    );

    // אם המשתמש כבר מחובר (רענון דף), נטען את ההגדרות שלו
    if (googleToken) {
        loadMenuSettings();
    }
};

// פונקציה לשאיבת הגדרות התפריט מהשרת
async function loadMenuSettings() {
    if (!googleToken) return;
    try {
        const res = await fetch('/api/settings', {
            headers: { 'Authorization': `Bearer ${googleToken}` }
        });
        if (res.ok) {
            const data = await res.json();
            
            // עדכון מנות
            if (data.carbPortions) document.getElementById('carbPortionsInput').value = data.carbPortions;
            if (data.proteinPortions) document.getElementById('proteinPortionsInput').value = data.proteinPortions;
            
            // עדכון טבלאות
            if (data.customItems) {
                const inputs = document.querySelectorAll('.item-input');
                inputs.forEach(input => {
                    const foodName = input.getAttribute('data-food');
                    if (data.customItems[foodName]) {
                        input.value = data.customItems[foodName];
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

// פונקציה לשמירת הגדרות התפריט לשרת
async function saveMenuSettings() {
    if (!googleToken) {
        alert('❌ אנא התחבר עם גוגל תחילה כדי לשמור את התפריט');
        return;
    }

    const carbPortions = document.getElementById('carbPortionsInput').value;
    const proteinPortions = document.getElementById('proteinPortionsInput').value;
    
    const customItems = {};
    const inputs = document.querySelectorAll('.item-input');
    inputs.forEach(input => {
        const foodName = input.getAttribute('data-food');
        customItems[foodName] = input.value; // שמירת משקל לפי שם המנה
    });

    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${googleToken}`
            },
            body: JSON.stringify({ carbPortions, proteinPortions, customItems })
        });
        
        if (res.ok) {
            alert('✅ התפריט נשמר בהצלחה!');
        } else {
            alert('⚠️ שגיאה בשמירת התפריט');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('⚠️ שגיאה בשמירת התפריט. ודא שהשרת רץ.');
    }
}

// ... המשך הקוד (saveMeal נשאר כפי שהוא) ...

async function saveMeal() {
    // נוודא שהמשתמש מחובר לפני שהוא שומר
    if (!googleToken) {
        alert('❌ אנא התחבר עם גוגל לפני שמירת ארוחה');
        return;
    }

    const mealType = document.getElementById('mealSelect').value;
    const foodName = document.getElementById('foodName').value.trim();
    const foodWeight = document.getElementById('foodWeight').value;

    if (!foodName) {
        alert('❌ אנא הזיני שם מנה');
        return;
    }
    if (!foodWeight || foodWeight <= 0) {
        alert('❌ אנא הזיני משקל תקין');
        return;
    }

    const meal = {
        id: Date.now(),
        type: mealType,
        name: foodName,
        weight: parseInt(foodWeight),
        date: new Date().toISOString()
    };

    try {
        await fetch('/api/meals', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${googleToken}` // שולחים את תעודת הזהות של גוגל לשרת
            },
            body: JSON.stringify(meal)
        });
        
        alert(`✅ הארוחה נשמרה בהצלחה!\n${mealType}: ${foodName} - ${foodWeight}g`);
        
        document.getElementById('foodName').value = '';
        document.getElementById('foodWeight').value = '';
        document.getElementById('mealSelect').selectedIndex = 0;
        
    } catch (error) {
        console.error('Error saving meal:', error);
        alert('⚠️ שגיאה בשמירת הארוחה. אנא ודא שהשרת רץ ושהטוקן תקין.');
    }
}

