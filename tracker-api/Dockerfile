FROM node:18-alpine

WORKDIR /app

# העתקת קבצי ההגדרות והתקנת ספריות
COPY package.json ./
RUN npm install

# העתקת קוד השרת
COPY . .

# יצירת התיקייה שבה יישמר קובץ ה-JSON
RUN mkdir -p data

EXPOSE 3500

CMD ["npm", "start"]
