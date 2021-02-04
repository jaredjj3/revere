FROM node:14.9.0

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY prisma prisma
RUN yarn prisma generate

COPY tsconfig.json .
COPY bin bin
COPY src src

ENTRYPOINT [ "bin/run" ]
