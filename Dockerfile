FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

# Instala o crond nativo do Alpine
RUN echo "*/30 * * * * node /app/node_modules/.bin/ts-node /app/src/cleaner.ts >> /var/log/torbox-cleaner.log 2>&1" \
    > /etc/crontabs/root

CMD ["crond", "-f", "-l", "2"]
