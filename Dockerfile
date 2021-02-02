FROM node:14.9.0

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY tsconfig.json .

ENTRYPOINT [ "yarn" ]
CMD [ "cmd" ]