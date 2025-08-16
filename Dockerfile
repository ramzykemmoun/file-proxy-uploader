FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p public/uploads

EXPOSE 9999

CMD ["node", "index.js"]
