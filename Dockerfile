FROM node:18-bullseye as bot
LABEL author=backend.luispeche.me
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
CMD ["npm", "start"]
