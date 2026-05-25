FROM node:18-alpine

WORKDIR /app

# העתקת קבצי ההגדרות והתקנת ספריות
COPY package.json ./
RUN npm install

# העתקת קוד השרת
COPY server.js ./

# יצירת התיקייה שבה יישמר קובץ ה-JSON
RUN mkdir data

EXPOSE 3500

CMD ["npm", "start"]