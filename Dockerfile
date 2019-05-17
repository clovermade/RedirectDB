FROM mhart/alpine-node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

#переменные окружения
ENV PGUSER="redirector"
ENV PGHOST="localhost"
ENV PGDATABASE="RedirectDB"
ENV PGPASSWORD="123"
ENV PGPORT=5432

ENV BUCKET="https://offers.website.yandexcloud.net/"

ENV TABLE="hashes"
ENV HOSTCOLUMN="host"
ENV HASHCOLUMN="hash"
ENV BLOCKEDCOLUMN="blocked"

#открываем порт
EXPOSE 3000

CMD ["node", "app.js"]


