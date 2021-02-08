FROM node:14.9.0

WORKDIR /app

RUN npm install pm2 -g

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY prisma prisma
RUN yarn prisma generate

COPY tsconfig.json .
COPY nodemon.json .
COPY bin bin
COPY src src

ARG GIT_COMMIT_HASH
ARG GIT_COMMIT_STATUS
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}
ENV GIT_COMMIT_STATUS=${GIT_COMMIT_STATUS}
