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
function handleCredentialResponse(response) {
    googleToken = response.credential;
    localStorage.setItem('google_token', googleToken); // שומרים את הטוקן בדפדפן
    alert("✅ התחברת בהצלחה!");
}

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

