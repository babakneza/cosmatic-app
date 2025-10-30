FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# غیرفعال کردن Turbopack و استفاده از builder قدیمی
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV TURBOPACK=false
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]