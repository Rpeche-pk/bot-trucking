FROM node:18-bullseye as bot
LABEL author=backend.luispeche.me
WORKDIR /app
COPY package*.json ./
# Instalar el paquete de zona horaria
RUN apt-get update && apt-get install -y tzdata
# Configurar la zona horaria
RUN ln -fs /usr/share/zoneinfo/America/Lima /etc/localtime && dpkg-reconfigure -f noninteractive tzdata
RUN npm i
COPY . .
CMD ["npm", "start"]
