FROM node:18.20-alpine AS builder

WORKDIR /usr/src

RUN apk update && apk add ca-certificates && apk add dumb-init && rm -rf /var/cache/apk/*
RUN corepack enable

COPY . .

RUN yarn install --immutable

RUN yarn build && yarn cache clean
RUN rm -rf node_modules
RUN rm -rf app/node_modules
RUN rm -rf packages/*/node_modules

FROM node:18.20-alpine AS runner

WORKDIR /usr/src

RUN apk update && apk add ca-certificates && apk add dumb-init && rm -rf /var/cache/apk/*
RUN corepack enable

COPY --from=builder /usr/src ./

RUN yarn workspaces focus --all --production

EXPOSE 3000

CMD ["dumb-init", "node", "-r", "/usr/src/app/apm.cjs", "/usr/src/app/dist/main.js"]
