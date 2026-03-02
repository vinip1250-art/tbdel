FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

# Redireciona para stdout/stderr do container (PID 1)
RUN echo "*/30 * * * * node /app/node_modules/.bin/ts-node /app/src/cleaner.ts >> /proc/1/fd/1 2>/proc/1/fd/2" \
    > /etc/crontabs/root

CMD ["crond", "-f", "-l", "2"]
