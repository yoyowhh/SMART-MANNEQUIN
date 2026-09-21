FROM keymetrics/pm2:18-alpine

RUN apk update && apk upgrade && \
  apk add --no-cache \
    bash \
    git \
    curl \
    openssh

RUN mkdir -p /usr/src/apps
WORKDIR /usr/src/apps

COPY package*.json ./
RUN pnpm cache clean --force
RUN pnpm install
COPY . .

EXPOSE 3023

CMD [ "pm2-runtime", "start", "pm2.json", "--env", "production"]
