# debian12 has less vulnerabilities
FROM dhi.io/node:25-debian12-dev AS build
RUN mkdir /data
WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i

COPY . .
RUN pnpm build && pnpm prune --prod

FROM dhi.io/node:25 AS run
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
