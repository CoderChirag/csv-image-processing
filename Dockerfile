FROM node:18.20-alpine AS builder

WORKDIR /user/src

RUN apk update && apk add ca-certificates && apk add dumb-init && rm -rf /var/cache/apk/*
RUN corepack enable

COPY package.json .yarnrc.yml lerna.json nx.json yarn.lock ./

COPY app/package.json app/.yarnrc.yaml ./app/

COPY packages/*/package.json ./packages/*/package.json
COPY packages/*/.yarnrc.yaml ./packages/*/.yarnrc.yaml

RUN yarn install --immutable

COPY . .

RUN yarn build && yarn cache clean

FROM node:18.20-alpine AS runner

WORKDIR /usr/src

RUN apk update && apk add ca-certificates && apk add dumb-init && rm -rf /var/cache/apk/*
RUN corepack enable

COPY --from=builder /usr/src/package.json /usr/src/.yarnrc.yml /usr/src/lerna.json /usr/src/nx.json /usr/src/yarn.lock ./

COPY --from=builder /usr/src/app/dist /usr/src/app/package.json /usr/src/app/.yarnrc.yaml ./app/

COPY --from=builder /usr/src/packages/*/dist ./packages/*/dist
COPY --from=builder /usr/src/packages/*/package.json ./packages/*/package.json
COPY --from=builder /usr/src/packages/*/.yarnrc.yaml ./packages/*/.yarnrc.yaml

RUN yarn workspaces focus --production

EXPOSE 3000

CMD ["dumb-init", "node", "-r", "app/apm.cjs", "app/dist/main.js"]
