const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3500;
const dataPath = path.join(__dirname, 'data', 'db.json');

app.use(express.json());

// פונקציית עזר לקריאת הנתונים
const readData = () => {
    if (!fs.existsSync(dataPath)) return [];
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
};

// שליפת כל הארוחות (GET)
app.get('/api/meals', (req, res) => {
    res.json(readData());
});

// שמירת ארוחה חדשה (POST)
app.post('/api/meals', (req, res) => {
    const meals = readData();
    const newMeal = req.body;
    meals.push(newMeal);
    fs.writeFileSync(dataPath, JSON.stringify(meals, null, 2));
    res.status(201).json({ message: 'Meal saved successfully' });
});

// מחיקת ארוחה לפי ID (DELETE)
app.delete('/api/meals/:id', (req, res) => {
    let meals = readData();
    meals = meals.filter(m => m.id !== parseInt(req.params.id));
    fs.writeFileSync(dataPath, JSON.stringify(meals, null, 2));
    res.json({ message: 'Meal deleted' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
