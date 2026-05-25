const API_URL = '/api/meals';

// פונקציה לשליפת הנתונים מהשרת
async function fetchLogs() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// עדכון פונקציית שמירת הארוחה
async function saveEntry() {
    const amount = document.getElementById('inputAmount').value;
    if (!amount || amount <= 0) return alert("אנא הזן כמות תקינה");

    const newEntry = {
        id: Date.now(),
        day: parseInt(document.getElementById('inputDay').value),
        meal: document.getElementById('inputMeal').value,
        category: document.getElementById('inputCategory').value,
        food: document.getElementById('inputFood').value,
        amount: amount
    };
    
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
    });
    
    currentViewDay = newEntry.day;
    renderFilters();
    renderLogs();
}

// עדכון פונקציית המחיקה
async function deleteEntry(id) {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    renderLogs();
}

// עדכון רינדור הלוגים (עובד כעת בצורה אסינכרונית מול השרת)
async function renderLogs() {
    const container = document.getElementById('logsContainer');
    container.innerHTML = '<div style="text-align:center; padding:20px;">טוען נתונים מהשרת...</div>';
    
    let db = await fetchLogs();
    const dayLogs = db.filter(entry => entry.day === currentViewDay);
    
    container.innerHTML = '';
    
    if (dayLogs.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">אין עדיין רישומים ליום זה.</div>';
        return;
    }

    const mealOrder = {"בוקר":1, "צהריים":2, "ערב":3, "ביניים / לפני אימון":4};
    dayLogs.sort((a,b) => mealOrder[a.meal] - mealOrder[b.meal]);

    dayLogs.forEach(log => {
        const el = document.createElement('div');
        el.className = 'log-entry';
        
        let dotColor = '#bdc3c7';
        if(log.category.includes('חלבון')) dotColor = '#e74c3c';
        if(log.category.includes('פחמימה')) dotColor = '#f39c12';
        if(log.category.includes('ירקות')) dotColor = '#27ae60';
        if(log.category.includes('שומן')) dotColor = '#8e44ad';

        el.innerHTML = `
            <div class="log-details">
                <strong><span style="color:${dotColor}">●</span> ${log.meal} - ${log.category}</strong>
                <span>${log.amount} מנות | ${log.food}</span>
            </div>
            <button class="delete-btn" onclick="deleteEntry(${log.id})">מחק</button>
        `;
        container.appendChild(el);
    });
}

async function saveMeal() {
    const meal = {
        type: document.getElementById('mealSelect').value,
        name: document.getElementById('foodName').value,
        weight: document.getElementById('foodWeight').value,
        date: new Date().toISOString()
    };

    await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal)
    });
    alert('הארוחה נשמרה!');
}
