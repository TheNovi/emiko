ARG NODE_VERSION="24"
# TODO User

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i

COPY . .
# RUN mkdir data && pnpm db:push --force
RUN pnpm build && pnpm prune --prod


FROM node:${NODE_VERSION}-alpine AS run
WORKDIR /app

# This should remove most of CVE's
RUN npm r -g npm

COPY --from=build /app/build build
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules node_modules
RUN mkdir /data
# RUN ulimit -c unlimited

ENV NODE_ENV=production
ENV DB_URL=file:/data/emiko.db
ENV DATA_PATH=/data
ENV TZ=utc

EXPOSE 3000
ENTRYPOINT ["node", "build"]
