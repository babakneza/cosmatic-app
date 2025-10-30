FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
