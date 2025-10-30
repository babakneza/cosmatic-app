FROM node:20-alpine

WORKDIR /app

# ابتدا package.json را کپی کنید
COPY package*.json ./
RUN npm install

# سپس ALL فایل‌ها را کپی کنید (شامل src/)
COPY . .

# ساختار فایل‌ها را بررسی کنید (برای دیباگ)
RUN ls -la && ls -la src/

ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]