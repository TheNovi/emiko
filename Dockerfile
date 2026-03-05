ARG NODE_VERSION="25"

# FROM node:${NODE_VERSION}-alpine AS build
FROM dhi.io/node:${NODE_VERSION}-dev AS build
RUN mkdir /data
WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
# RUN npm i -g pnpm && pnpm i
RUN corepack enable pnpm && pnpm i

COPY . .
RUN pnpm build && pnpm prune --prod

# FROM node:${NODE_VERSION}-alpine AS run
FROM dhi.io/node:${NODE_VERSION} AS run
COPY --from=build /data /data
WORKDIR /app

# This should remove most of CVE's (not needed in hardened)
# RUN npm r -g npm

COPY --from=build /app/build build
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules node_modules
# RUN mkdir /data
# RUN ulimit -c unlimited

ENV NODE_ENV=production
ENV DB_URL=file:/data/emiko.db
ENV TZ=utc

EXPOSE 3000
ENTRYPOINT ["node", "build"]
