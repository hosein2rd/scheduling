FROM node:latest

WORKDIR /usr/src/app

RUN cd /usr/src/app

COPY package*.json ./

RUN npm i && npm i -g sequelize-cli

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]